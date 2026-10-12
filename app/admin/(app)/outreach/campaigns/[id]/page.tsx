import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import type { Campaign, CampaignStep, ContactList } from '@/lib/db/types';
import { Card, Stat } from '@/components/admin/ui';
import { trackingConfigured } from '@/lib/outreach/config';
import { CampaignEditor } from '@/components/admin/outreach/CampaignEditor';
import { percent } from '@/components/admin/outreach/shared';
import { countEnrolledContacts, countEnrollments, countMessages, countReplied } from '@/components/admin/outreach/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campaign · Outreach' };

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const [campaignRes, stepsRes, listsRes, nurtureRes] = await Promise.all([
    supabase.from('campaigns').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('campaign_steps').select('*').eq('campaign_id', params.id).order('step_number'),
    supabase.from('contact_lists').select('*').order('created_at', { ascending: false }),
    supabase.from('campaigns').select('id, name, status').eq('kind', 'nurture').neq('id', params.id).neq('status', 'completed').order('name'),
  ]);
  const campaign = campaignRes.data as Campaign | null;
  if (!campaign) notFound();
  const steps = (stepsRes.data ?? []) as CampaignStep[];
  const lists = (listsRes.data ?? []) as ContactList[];

  const id = campaign.id;
  const [enrolled, sent, delivered, bounced, replied, booked, unsubscribed, contacted, perStep] = await Promise.all([
    countEnrollments(supabase, id),
    countMessages(supabase, id),
    countMessages(supabase, id, { statuses: ['delivered'] }),
    countMessages(supabase, id, { statuses: ['bounced'] }),
    countReplied(supabase, id),
    countEnrolledContacts(supabase, id, ['booked']),
    countEnrolledContacts(supabase, id, ['unsubscribed', 'complained']),
    countEnrollments(supabase, id, { contacted: true }),
    Promise.all(steps.map((s) => countMessages(supabase, id, { step: s.step_number }))),
  ]);

  const stats = (
    <section aria-label="Campaign results" className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <Stat label="Enrolled" value={enrolled.toLocaleString()} />
        <Stat label="Sent" value={sent.toLocaleString()} hint={`${contacted.toLocaleString()} contacts reached`} />
        <Stat label="Delivered" value={delivered.toLocaleString()} hint={sent ? percent(delivered, sent) : undefined} />
        <Stat label="Bounced" value={bounced.toLocaleString()} hint={sent ? percent(bounced, sent) : undefined} />
        <Stat label="Replied" value={replied.toLocaleString()} hint={contacted ? `${percent(replied, contacted)} reply rate` : undefined} />
        <Stat label="Booked" value={booked.toLocaleString()} hint={replied ? `${percent(booked, replied)} of replies` : undefined} />
        <Stat label="Unsubscribed" value={unsubscribed.toLocaleString()} />
      </div>
      <p className="mt-3 font-body text-xs text-white/60">
        Reply rates per step and A/B variant, and where leads drop off:{' '}
        <Link href={`/admin/outreach/funnel?range=all&campaign=${campaign.id}`} className="text-brand-cyan hover:underline">
          open the funnel report
        </Link>
        .
      </p>
      {steps.length ? (
        <Card className="mt-3">
          <h2 className="font-body text-sm font-semibold text-white mb-3">Sent per step</h2>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const n = perStep[i] ?? 0;
              const max = Math.max(1, ...perStep);
              return (
                <li key={s.id} className="font-body text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-white/80 truncate">
                      Step {s.step_number}: <span className="text-white/60">{s.subject || 'reply in thread'}</span>
                    </span>
                    <span className="tabular-nums text-white shrink-0">{n.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-sm bg-white/10" aria-hidden>
                    <div className="h-full rounded-sm bg-brand-purple" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      ) : null}
    </section>
  );

  return (
    <>
      <Link href="/admin/outreach/campaigns" className="inline-flex items-center gap-1.5 mb-4 font-body text-sm text-white/65 hover:text-white">
        <ArrowLeft size={14} aria-hidden /> All campaigns
      </Link>
      <CampaignEditor
        campaign={campaign}
        steps={steps}
        lists={lists}
        stats={stats}
        nurtureCampaigns={(nurtureRes.data ?? []) as Pick<Campaign, 'id' | 'name' | 'status'>[]}
        trackingAvailable={trackingConfigured()}
      />
    </>
  );
}
