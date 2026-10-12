import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SERVICES, type WebLead } from '@/lib/db/types';
import { escapeLike } from '@/lib/outreach/suppress';

// Website lead actions from the overview: mark called, dismiss, reopen,
// or convert into a client on the pipeline (New lead).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERVICE_VALUES = SERVICES.map((s) => s.value) as [string, ...string[]];

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.enum(['contacted', 'dismissed', 'new']) }),
  z.object({
    action: z.literal('convert'),
    firstName: z.string().trim().min(1, 'First name is required').max(80),
    lastName: z.string().trim().max(80).optional(),
    email: z.string().trim().email('A valid email is required').max(200),
    phone: z.string().trim().max(40).optional(),
    company: z.string().trim().max(200).optional(),
    service: z.enum(SERVICE_VALUES),
  }),
]);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
  const body = parsed.data;
  const db = supabaseAdmin();

  const { data } = await db.from('web_leads').select('*').eq('id', params.id).maybeSingle();
  const lead = data as WebLead | null;
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  if (body.action !== 'convert') {
    const { error } = await db.from('web_leads').update({ status: body.action, handled_by: auth.member.user_id }).eq('id', lead.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const email = body.email.toLowerCase();
  const { data: existing } = await db.from('clients').select('id').ilike('email', escapeLike(email)).limit(1).maybeSingle();
  let clientId = (existing as { id: string } | null)?.id ?? null;
  if (!clientId) {
    const { data: created, error } = await db
      .from('clients')
      .insert({
        first_name: body.firstName,
        last_name: body.lastName || null,
        email,
        phone: body.phone || lead.phone,
        company: body.company || lead.company,
        service: body.service,
        source: `website:${lead.source}`,
        stage: 'new',
        owner_id: auth.member.user_id,
      })
      .select('id')
      .single();
    if (error || !created) return NextResponse.json({ error: error?.message ?? 'Could not create the client' }, { status: 500 });
    clientId = (created as { id: string }).id;
  }
  const detailText = Object.entries(lead.details ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
  await db.from('activities').insert({
    client_id: clientId,
    type: 'client.created',
    body: `From a website lead (${lead.source})${detailText ? `. ${detailText}` : ''}`,
    meta: { web_lead_id: lead.id, page: lead.page },
    actor_id: auth.member.user_id,
  });
  await db.from('web_leads').update({ status: 'converted', client_id: clientId, handled_by: auth.member.user_id }).eq('id', lead.id);
  return NextResponse.json({ ok: true, clientId });
}
