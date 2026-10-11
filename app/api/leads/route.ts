import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildCrmEvent, sendToCrm, type CrmContact } from '@/lib/crm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Accept any of the form variants we ship. The form layer already validates
// per-variant; this server-side schema is the wire format.
const payloadSchema = z.object({
  source: z.string().min(1).max(120),
  data: z.record(z.unknown()),
  page: z.string().max(500).optional(),
});

const str = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : undefined;

// Forms name the same field differently (firstName vs name, businessName
// vs company). Lift identity fields into `contact`; everything else stays
// in `details`.
function splitContact(data: Record<string, unknown>) {
  const { name, firstName, fullName, email, phone, company, businessName, ...rest } = data;
  const contact: CrmContact = {
    name: str(name) ?? str(fullName) ?? str(firstName),
    email: str(email),
    phone: str(phone),
    company: str(company) ?? str(businessName),
  };
  return { contact, details: rest };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { source, data, page } = parsed.data;
  const { contact, details } = splitContact(data);
  if (!contact.email && !contact.phone) {
    return NextResponse.json({ error: 'missing_contact' }, { status: 400 });
  }

  const result = await sendToCrm(
    buildCrmEvent('lead.created', { source, page, contact, details }),
  );
  if (result.status === 'failed') {
    return NextResponse.json({ error: 'forward_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

// Reject other methods cleanly.
export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
