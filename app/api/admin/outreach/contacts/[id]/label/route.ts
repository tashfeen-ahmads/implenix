import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Contact } from '@/lib/db/types';
import { REPLY_LABELS } from '@/lib/pipeline/stages';
import { moveToNurture } from '@/lib/outreach/stage';
import { stopEnrollments, suppressAndStop } from '@/lib/outreach/suppress';

// A person corrects the AI's reading of a reply. The label is saved and
// the pipeline stage follows it, the same way an AI classification would.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LABELS = Object.keys(REPLY_LABELS) as [string, ...string[]];
const Body = z.object({ label: z.enum(LABELS) });

const OPTED_OUT = ['unsubscribed', 'bounced', 'complained'];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid label' }, { status: 400 });
  const { label } = parsed.data;
  const db = supabaseAdmin();

  const { data } = await db.from('contacts').select('*').eq('id', params.id).maybeSingle();
  const contact = data as Contact | null;
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
  if (OPTED_OUT.includes(contact.status) && label !== 'unsubscribe') {
    return NextResponse.json({ error: 'This address has opted out or bounced; its stage stays closed.' }, { status: 409 });
  }

  await db.from('contacts').update({ reply_label: label }).eq('id', contact.id);
  // A contact that already became a client keeps its client card.
  if (contact.stage === 'client') return NextResponse.json({ ok: true, stage: 'client' });

  let stage: Contact['stage'] = contact.stage;
  switch (label) {
    case 'interested':
    case 'wants_times':
    case 'pricing':
    case 'booked':
      stage = 'interested';
      await stopEnrollments(db, contact.id);
      await db.from('contacts').update({ stage, status: 'interested' }).eq('id', contact.id);
      break;
    case 'not_interested':
      stage = 'not_interested';
      await stopEnrollments(db, contact.id);
      await db.from('contacts').update({ stage, status: 'not_interested' }).eq('id', contact.id);
      break;
    case 'unsubscribe':
      stage = 'unsubscribed';
      await suppressAndStop(db, contact.email, 'unsubscribed');
      break;
    case 'not_now': {
      // Use the nurture campaign of the sequence they replied to, if any.
      const { data: last } = await db
        .from('campaign_enrollments')
        .select('created_at, campaigns(id, nurture_campaign_id)')
        .eq('contact_id', contact.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const from = (last as { campaigns: { id: string; nurture_campaign_id: string | null } | null } | null)?.campaigns ?? null;
      const res = await moveToNurture(db, contact, { manual: true, fromCampaign: from });
      return NextResponse.json({ ok: true, stage: 'nurture', nurture: res });
    }
    case 'out_of_office':
      // No stage change: the person hasn't really answered yet.
      break;
    default:
      // question, wrong_person, other: a person needs to follow up.
      stage = 'replied';
      await db.from('contacts').update({ stage }).eq('id', contact.id);
  }
  return NextResponse.json({ ok: true, stage });
}
