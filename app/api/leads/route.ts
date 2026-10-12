import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildCrmEvent, sendToCrm, type CrmContact } from '@/lib/crm';
import { adminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { webLeadEmail } from '@/lib/email/templates';
import { SITE_URL } from '@/lib/seo';
import { teamAlertRecipients } from '@/lib/email/recipients';
import { escapeLike } from '@/lib/outreach/suppress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 10_000;
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;

// Best-effort flood guard per server instance: at most 5 leads a minute per
// IP. Serverless instances don't share memory, so the per-lead duplicate
// check below is the real protection against repeat alerts.
const recent = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 60_000);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > 5;
}

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

// Only short scalar details are kept (numbers, short strings, booleans).
function cleanDetails(details: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(details).slice(0, 30)) {
    const key = k.slice(0, 60);
    if (typeof v === 'number' && Number.isFinite(v)) out[key] = v;
    else if (typeof v === 'boolean') out[key] = v;
    else if (typeof v === 'string' && v.trim()) out[key] = v.trim().slice(0, 500);
  }
  return out;
}

// Saves the lead for the team dashboard and alerts the team. Returns false
// when Supabase isn't set up or the insert failed.
async function saveLead(input: {
  source: string;
  page?: string;
  contact: CrmContact;
  details: Record<string, string | number | boolean>;
}): Promise<boolean> {
  if (!adminConfigured()) return false;
  const db = supabaseAdmin();
  // Same person again within 30 minutes (a resubmit or a script): keep the
  // first row and don't alert the team twice.
  const since = new Date(Date.now() - 30 * 60_000).toISOString();
  const dupe = input.contact.phone
    ? db.from('web_leads').select('id').eq('phone', input.contact.phone)
    : db.from('web_leads').select('id').ilike('email', escapeLike(input.contact.email!.toLowerCase()));
  const { data: seen } = await dupe.gte('created_at', since).limit(1);
  if (seen?.length) return true;

  const { data, error } = await db
    .from('web_leads')
    .insert({
      source: input.source,
      page: input.page ?? null,
      name: input.contact.name ?? null,
      email: input.contact.email?.toLowerCase() ?? null,
      phone: input.contact.phone ?? null,
      company: input.contact.company ?? null,
      details: input.details,
    })
    .select('id')
    .single();
  if (error || !data) {
    console.error('[leads] save failed', error?.message);
    return false;
  }
  const team = teamAlertRecipients();
  if (team.length) {
    const mail = webLeadEmail({
      source: input.source,
      ...input.contact,
      details: Object.entries(input.details).map(([k, v]) => [k, String(v)]),
      dashboardUrl: `${SITE_URL}/admin#website-leads`,
    });
    await sendEmail({
      to: team,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(input.contact.email && EMAIL_RE.test(input.contact.email) ? { replyTo: input.contact.email } : {}),
      tags: [{ name: 'type', value: 'web_lead' }],
    }).catch((err) => console.error('[leads] team alert failed', err instanceof Error ? err.message : err));
  }
  return true;
}

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const raw = await request.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(raw);
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
  const clean = cleanDetails(details);

  const [saved, result] = await Promise.all([
    saveLead({ source, page, contact, details: clean }),
    sendToCrm(buildCrmEvent('lead.created', { source, page, contact, details: clean })),
  ]);
  // Error only when a configured destination failed and the lead landed
  // nowhere. With nothing configured (local dev, previews) it's accepted.
  const dbFailed = adminConfigured() && !saved;
  if (!saved && result.status !== 'delivered' && (result.status === 'failed' || dbFailed)) {
    return NextResponse.json({ error: 'forward_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

// Reject other methods cleanly.
export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
