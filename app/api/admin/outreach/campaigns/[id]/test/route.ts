import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Campaign, CampaignStep, Contact } from '@/lib/db/types';
import { SITE_URL, isOnSendingDomain, sesConfigured } from '@/lib/outreach/config';
import { buildOutreachEmail } from '@/lib/outreach/render';
import { SesSendError, sendOutreachEmail } from '@/lib/outreach/ses';
import { isSuppressed, isValidEmail, normalizeEmail } from '@/lib/outreach/suppress';

// Sends one rendered step to a team address. Merge fields come from the
// first contact on the campaign's list (or blanks, so fallbacks show).
// Nothing is recorded in messages and the unsubscribe link is inert.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ to: z.string().max(320), step: z.number().int().min(1).max(50) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Body must be {to, step}' }, { status: 400 });
  const to = normalizeEmail(parsed.data.to);
  if (!isValidEmail(to)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  if (!sesConfigured()) return NextResponse.json({ error: 'Amazon SES is not configured.' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: campaignRow } = await db.from('campaigns').select('*').eq('id', params.id).maybeSingle();
  const campaign = campaignRow as Campaign | null;
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (!isOnSendingDomain(campaign.from_email)) {
    return NextResponse.json({ error: 'From address is not on the SES sending domain.' }, { status: 400 });
  }
  const { data: stepRow } = await db
    .from('campaign_steps')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('step_number', parsed.data.step)
    .maybeSingle();
  const step = stepRow as CampaignStep | null;
  if (!step) return NextResponse.json({ error: `Step ${parsed.data.step} not found` }, { status: 404 });
  if (await isSuppressed(db, to)) {
    return NextResponse.json({ error: 'That address is on the suppression list.' }, { status: 409 });
  }

  let sample: Contact | null = null;
  if (campaign.list_id) {
    const { data } = await db
      .from('contacts')
      .select('*')
      .eq('list_id', campaign.list_id)
      .order('created_at')
      .limit(1)
      .maybeSingle();
    sample = data as Contact | null;
  }
  const contact = {
    id: '00000000-0000-0000-0000-000000000000',
    email: to,
    first_name: sample?.first_name ?? null,
    last_name: sample?.last_name ?? null,
    company: sample?.company ?? null,
    website: sample?.website ?? null,
    city: sample?.city ?? null,
    state: sample?.state ?? null,
    industry: sample?.industry ?? null,
    phone: sample?.phone ?? null,
    custom: sample?.custom ?? {},
  };
  const subject = step.subject.trim() || (await firstSubject(db, campaign.id)) || '(follow-up, same thread)';
  const email = buildOutreachEmail({
    subject,
    body: step.body,
    contact,
    unsubscribeUrlOverride: `${SITE_URL}/api/outreach/unsubscribe?test=1`,
  });
  try {
    await sendOutreachEmail({
      fromName: campaign.from_name,
      fromEmail: campaign.from_email,
      to,
      replyTo: campaign.reply_to,
      subject: `[TEST] ${email.subject}`,
      text: email.text,
      html: email.html,
      unsubscribeUrl: email.unsubscribeUrl,
      tags: { campaign_id: campaign.id, kind: 'test' },
    });
  } catch (err) {
    const message = err instanceof SesSendError ? `${err.code}: ${err.message}` : 'Send failed';
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

async function firstSubject(db: ReturnType<typeof supabaseAdmin>, campaignId: string): Promise<string | null> {
  const { data } = await db
    .from('campaign_steps')
    .select('subject')
    .eq('campaign_id', campaignId)
    .eq('step_number', 1)
    .maybeSingle();
  const s = (data as { subject: string } | null)?.subject?.trim();
  return s ? `Re: ${s}` : null;
}
