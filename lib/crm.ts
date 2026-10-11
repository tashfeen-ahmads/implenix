import { createHmac, randomUUID } from 'node:crypto';

// Server-only CRM delivery. Every lead and booking is POSTed as one
// stable JSON shape to CRM_WEBHOOK_URL, so the same feed can drive the
// in-house CRM or any client CRM (via Zapier/Make/n8n or a custom
// receiver).
//
// Headers on every delivery:
//   X-Implenix-Event       lead.created | booking.created
//   X-Implenix-Delivery    unique id, use it to de-duplicate retries
//   X-Implenix-Timestamp   unix seconds
//   X-Implenix-Signature   sha256=<hex HMAC of "<timestamp>.<raw body>">
//                          (only when CRM_WEBHOOK_SECRET is set)
//   Authorization          Bearer <CRM_WEBHOOK_TOKEN> (only when set)

export type CrmEventType = 'lead.created' | 'booking.created';

export type CrmContact = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
};

export type CrmEvent = {
  id: string;
  event: CrmEventType;
  created_at: string;
  source: string;
  page?: string;
  contact: CrmContact;
  details: Record<string, unknown>;
};

export type CrmResult =
  | { status: 'delivered' }
  | { status: 'skipped' } // CRM_WEBHOOK_URL not configured
  | { status: 'failed'; reason: string };

const TIMEOUT_MS = 5000;

export function buildCrmEvent(
  event: CrmEventType,
  input: Omit<CrmEvent, 'id' | 'event' | 'created_at'>,
): CrmEvent {
  return {
    id: randomUUID(),
    event,
    created_at: new Date().toISOString(),
    ...input,
  };
}

export function signPayload(secret: string, timestamp: string, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
}

export async function sendToCrm(payload: CrmEvent): Promise<CrmResult> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    console.info(`[crm] CRM_WEBHOOK_URL not set, ${payload.event} ${payload.id} not forwarded`);
    return { status: 'skipped' };
  }

  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Implenix-Webhook/1.0',
    'X-Implenix-Event': payload.event,
    'X-Implenix-Delivery': payload.id,
    'X-Implenix-Timestamp': timestamp,
  };
  if (process.env.CRM_WEBHOOK_SECRET) {
    headers['X-Implenix-Signature'] = signPayload(
      process.env.CRM_WEBHOOK_SECRET,
      timestamp,
      body,
    );
  }
  if (process.env.CRM_WEBHOOK_TOKEN) {
    headers.Authorization = `Bearer ${process.env.CRM_WEBHOOK_TOKEN}`;
  }

  // One retry on network errors and 5xx; receivers de-duplicate on
  // X-Implenix-Delivery.
  let reason = 'unknown';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return { status: 'delivered' };
      reason = `http_${res.status}`;
      if (res.status < 500) break;
    } catch (err) {
      // fetch wraps the socket error (ECONNREFUSED, ENOTFOUND...) in `cause`.
      const cause = (err as { cause?: { code?: string } })?.cause;
      reason = cause?.code ?? (err instanceof Error ? err.name : 'network_error');
    }
  }
  console.error(`[crm] ${payload.event} ${payload.id} failed: ${reason}`);
  return { status: 'failed', reason };
}
