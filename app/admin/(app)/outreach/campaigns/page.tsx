import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import type { Campaign, ContactList } from '@/lib/db/types';
import { EmptyState, PageHeader, Pill, TableWrap, formatDate, tdClass, thClass } from '@/components/admin/ui';
import { NewCampaignButton } from '@/components/admin/outreach/NewCampaignButton';
import { SendingHealth } from '@/components/admin/outreach/SendingHealth';
import { CAMPAIGN_STATUS_TONES, percent } from '@/components/admin/outreach/shared';
import { countEnrolledContacts, countEnrollments, countMessages, countReplied } from '@/components/admin/outreach/stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campaigns · Outreach' };

export default async function CampaignsPage() {
  const supabase = supabaseServer();
  const [campaignsRes, listsRes, stepsRes] = await Promise.all([
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_lists').select('id, name'),
    supabase.from('campaign_steps').select('campaign_id'),
  ]);
  const campaigns = (campaignsRes.data ?? []) as Campaign[];
  const listName = new Map(((listsRes.data ?? []) as Pick<ContactList, 'id' | 'name'>[]).map((l) => [l.id, l.name]));
  const stepCount = new Map<string, number>();
  for (const s of (stepsRes.data ?? []) as { campaign_id: string }[]) {
    stepCount.set(s.campaign_id, (stepCount.get(s.campaign_id) ?? 0) + 1);
  }

  const rows = await Promise.all(
    campaigns.map(async (c) => {
      const [sent, contacted, replied, booked] = await Promise.all([
        countMessages(supabase, c.id),
        countEnrollments(supabase, c.id, { contacted: true }),
        countReplied(supabase, c.id),
        countEnrolledContacts(supabase, c.id, ['booked']),
      ]);
      return { c, sent, contacted, replied, booked };
    }),
  );

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Cold sequences send to a contact list and stop for anyone who replies. Nurture campaigns pick up leads who said not now or never answered."
        actions={<NewCampaignButton />}
      />
      <SendingHealth db={supabase} />

      {campaignsRes.error ? (
        <p role="alert" className="mb-6 font-body text-sm text-red-300">
          Could not load campaigns: {campaignsRes.error.message}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          body="Create a campaign, pick a contact list, write a short sequence, send yourself a test, then launch."
          action={<NewCampaignButton label="Create your first campaign" />}
        />
      ) : (
        <TableWrap label="Campaigns">
          <thead>
            <tr>
              <th scope="col" className={thClass}>Campaign</th>
              <th scope="col" className={thClass}>Status</th>
              <th scope="col" className={thClass}>List</th>
              <th scope="col" className={`${thClass} text-right`}>Steps</th>
              <th scope="col" className={`${thClass} text-right`}>Sent</th>
              <th scope="col" className={`${thClass} text-right`}>Replied</th>
              <th scope="col" className={`${thClass} text-right`}>Reply rate</th>
              <th scope="col" className={`${thClass} text-right`}>Booked</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, sent, contacted, replied, booked }) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className={tdClass}>
                  <Link href={`/admin/outreach/campaigns/${c.id}`} className="font-medium text-white hover:text-brand-cyan hover:underline underline-offset-2">
                    {c.name}
                  </Link>
                  <p className="text-xs text-white/50">
                    {c.kind === 'nurture' ? 'Nurture, ' : ''}created {formatDate(c.created_at)}
                  </p>
                </td>
                <td className={tdClass}>
                  <Pill tone={CAMPAIGN_STATUS_TONES[c.status]}>{c.status}</Pill>
                  {c.status === 'paused' && c.paused_reason ? (
                    <span className="mt-1 block font-body text-xs text-amber-300" title={c.paused_reason}>
                      Auto-paused: high {c.paused_reason.startsWith('Spam') ? 'complaints' : 'bounces'}
                    </span>
                  ) : null}
                </td>
                <td className={`${tdClass} whitespace-nowrap`}>
                  {c.list_id ? listName.get(c.list_id) ?? 'Deleted list' : <span className="text-white/40">{c.kind === 'nurture' ? 'Fed by other campaigns' : 'No list'}</span>}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>{stepCount.get(c.id) ?? 0}</td>
                <td className={`${tdClass} text-right tabular-nums`}>{sent.toLocaleString()}</td>
                <td className={`${tdClass} text-right tabular-nums`}>{replied.toLocaleString()}</td>
                <td className={`${tdClass} text-right tabular-nums`} title={`${replied} of ${contacted} contacted`}>
                  {percent(replied, contacted)}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>{booked.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
