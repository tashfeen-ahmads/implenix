import { NextResponse } from 'next/server';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Campaign } from '@/lib/db/types';
import { fromDomain, isOnSendingDomain, postalAddress, sesConfigured } from '@/lib/outreach/config';

// Enrolls every eligible contact on the campaign's list and activates it.
// Eligible: status active, not suppressed, not already in this campaign,
// and not currently in another active sequence (no double-emailing).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PAGE = 1000;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const db = supabaseAdmin();

  const { data: campaignRow } = await db.from('campaigns').select('*').eq('id', params.id).maybeSingle();
  const campaign = campaignRow as Campaign | null;
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (campaign.status === 'completed') {
    return NextResponse.json({ error: 'Campaign is completed; duplicate it to send again.' }, { status: 409 });
  }
  // Nurture campaigns can run without a list: leads are moved into them
  // from other campaigns, the AI agent and the pipeline board.
  if (!campaign.list_id && campaign.kind !== 'nurture') {
    return NextResponse.json({ error: 'Pick a contact list first.' }, { status: 400 });
  }
  if (!sesConfigured()) return NextResponse.json({ error: 'Amazon SES is not configured.' }, { status: 400 });
  if (!postalAddress()) {
    return NextResponse.json({ error: 'OUTREACH_POSTAL_ADDRESS is not set (required by CAN-SPAM).' }, { status: 400 });
  }
  if (!isOnSendingDomain(campaign.from_email)) {
    return NextResponse.json(
      { error: `From address must be on the sending domain ${fromDomain()}.` },
      { status: 400 },
    );
  }
  const { data: steps } = await db
    .from('campaign_steps')
    .select('step_number')
    .eq('campaign_id', campaign.id)
    .order('step_number');
  const stepNumbers = ((steps ?? []) as { step_number: number }[]).map((s) => s.step_number);
  if (!stepNumbers.includes(1)) return NextResponse.json({ error: 'Add step 1 before launching.' }, { status: 400 });

  if (!campaign.list_id) {
    const { error: upErr } = await db.from('campaigns').update({ status: 'active' }).eq('id', campaign.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({ enrolled: 0 });
  }

  // Everyone who should not be enrolled.
  const exclude = new Set<string>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('campaign_enrollments')
      .select('contact_id, campaign_id, status')
      .or(`campaign_id.eq.${campaign.id},status.eq.active`)
      .range(from, from + PAGE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    (data ?? []).forEach((e: { contact_id: string }) => exclude.add(e.contact_id));
    if (!data || data.length < PAGE) break;
  }

  const eligible: { id: string; email: string }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('contacts')
      .select('id, email')
      .eq('list_id', campaign.list_id)
      .eq('status', 'active')
      .order('created_at')
      .range(from, from + PAGE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    (data ?? []).forEach((c: { id: string; email: string }) => {
      if (!exclude.has(c.id)) eligible.push(c);
    });
    if (!data || data.length < PAGE) break;
  }

  const suppressed = new Set<string>();
  for (let i = 0; i < eligible.length; i += 500) {
    const part = eligible.slice(i, i + 500).map((c) => c.email.toLowerCase());
    const { data } = await db.from('suppressions').select('email').in('email', part);
    (data ?? []).forEach((s: { email: string }) => suppressed.add(s.email));
  }
  const toEnroll = eligible.filter((c) => !suppressed.has(c.email.toLowerCase()));

  let enrolled = 0;
  const now = new Date().toISOString();
  for (let i = 0; i < toEnroll.length; i += 500) {
    const rows = toEnroll.slice(i, i + 500).map((c) => ({
      campaign_id: campaign.id,
      contact_id: c.id,
      current_step: 0,
      next_send_at: now,
      status: 'active',
    }));
    const { error } = await db
      .from('campaign_enrollments')
      .upsert(rows, { onConflict: 'campaign_id,contact_id', ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message, enrolled }, { status: 500 });
    enrolled += rows.length;
    // Pipeline: enrolled contacts move to Queued (nurture keeps its own stage).
    if (campaign.kind === 'sequence') {
      await db
        .from('contacts')
        .update({ stage: 'queued' })
        .in('id', rows.map((r) => r.contact_id))
        .in('stage', ['new', 'no_response', 'queued']);
    } else {
      await db
        .from('contacts')
        .update({ stage: 'nurture' })
        .in('id', rows.map((r) => r.contact_id))
        .in('stage', ['new', 'no_response', 'queued']);
    }
  }

  const { error: upErr } = await db.from('campaigns').update({ status: 'active' }).eq('id', campaign.id);
  if (upErr) return NextResponse.json({ error: upErr.message, enrolled }, { status: 500 });
  return NextResponse.json({ enrolled });
}
