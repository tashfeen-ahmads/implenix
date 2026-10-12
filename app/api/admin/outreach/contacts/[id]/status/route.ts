import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Contact } from '@/lib/db/types';
import { addSuppression, normalizeEmail, stopEnrollments, type SuppressionReason } from '@/lib/outreach/suppress';

// Manual contact status change from the dashboard. Opt-out style statuses
// write a suppression and stop sequences; a suppressed address cannot be
// set back to active from here.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = [
  'active',
  'replied',
  'interested',
  'booked',
  'not_interested',
  'unsubscribed',
  'bounced',
  'complained',
] as const;
const Body = z.object({ status: z.enum(STATUSES) });

const SUPPRESS: Partial<Record<(typeof STATUSES)[number], SuppressionReason>> = {
  unsubscribed: 'unsubscribed',
  bounced: 'bounced',
  complained: 'complained',
};
const STOPS = new Set(['unsubscribed', 'bounced', 'complained', 'not_interested', 'booked', 'replied', 'interested']);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const { status } = parsed.data;
  const db = supabaseAdmin();

  const { data } = await db.from('contacts').select('*').eq('id', params.id).maybeSingle();
  const contact = data as Contact | null;
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  if (status === 'active') {
    const { data: sup } = await db
      .from('suppressions')
      .select('reason')
      .eq('email', normalizeEmail(contact.email))
      .maybeSingle();
    if (sup) {
      return NextResponse.json(
        { error: `This address is suppressed (${(sup as { reason: string }).reason}) and cannot be re-activated.` },
        { status: 409 },
      );
    }
  }

  const reason = SUPPRESS[status];
  if (reason) await addSuppression(db, contact.email, reason);
  const { error } = await db.from('contacts').update({ status }).eq('id', contact.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (STOPS.has(status)) await stopEnrollments(db, contact.id);
  return NextResponse.json({ ok: true });
}
