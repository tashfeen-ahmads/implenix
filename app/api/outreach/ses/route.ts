import { NextResponse, type NextRequest } from 'next/server';
import { adminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { allowedSnsTopics } from '@/lib/outreach/config';
import { isSnsUrl, parseSnsMessage, verifySnsMessage } from '@/lib/outreach/sns-verify';
import { handleInboundEmail, handleSesEvent } from '@/lib/outreach/inbound';

// Amazon SNS HTTPS subscription endpoint for SES:
// - configuration-set event destination (Bounce, Complaint, Delivery)
// - receipt rule SNS action (inbound replies)
// Every message's signature is verified before anything is trusted.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BODY = 400_000; // SNS action content caps at 150 KB, base64 ~200 KB.

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: 'Too large' }, { status: 413 });
  const msg = parseSnsMessage(raw);
  if (!msg) return NextResponse.json({ error: 'Not an SNS message' }, { status: 400 });

  const topics = allowedSnsTopics();
  if (topics.length && !topics.includes(msg.TopicArn)) {
    console.warn('[outreach/ses] message from a topic not in SES_INBOUND_SNS_TOPIC_ARN');
    return NextResponse.json({ error: 'Topic not allowed' }, { status: 403 });
  }
  if (!(await verifySnsMessage(msg))) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 403 });
  }

  if (msg.Type === 'SubscriptionConfirmation') {
    if (!isSnsUrl(msg.SubscribeURL)) return NextResponse.json({ error: 'Bad SubscribeURL' }, { status: 400 });
    try {
      const res = await fetch(msg.SubscribeURL!, { signal: AbortSignal.timeout(8_000), redirect: 'error', cache: 'no-store' });
      if (!res.ok) throw new Error(`status ${res.status}`);
      console.info('[outreach/ses] SNS subscription confirmed');
      return NextResponse.json({ ok: true, confirmed: true });
    } catch (err) {
      console.error('[outreach/ses] subscription confirm failed', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'Confirm failed' }, { status: 502 });
    }
  }
  if (msg.Type === 'UnsubscribeConfirmation') return NextResponse.json({ ok: true });
  if (msg.Type !== 'Notification') return NextResponse.json({ ok: true, ignored: msg.Type });

  if (!adminConfigured()) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  let payload: Record<string, unknown>;
  try {
    const v: unknown = JSON.parse(msg.Message);
    if (!v || typeof v !== 'object') throw new Error('not an object');
    payload = v as Record<string, unknown>;
  } catch {
    // SNS test messages and other plain-text notifications.
    return NextResponse.json({ ok: true, ignored: 'non-JSON message' });
  }

  const db = supabaseAdmin();
  const kind = String(payload.notificationType ?? payload.eventType ?? '');
  try {
    const handled =
      kind === 'Received' ? await handleInboundEmail(db, payload) : await handleSesEvent(db, payload);
    return NextResponse.json({ ok: true, handled });
  } catch (err) {
    console.error('[outreach/ses] handling failed', err instanceof Error ? err.message : err);
    // 500 lets SNS retry; inbound handling is idempotent on Message-ID.
    return NextResponse.json({ error: 'Handling failed' }, { status: 500 });
  }
}
