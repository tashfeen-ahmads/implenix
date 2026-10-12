import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { PROVIDERS, configuredProviders } from '@/lib/leads';
import type { LeadSearch } from '@/lib/leads/types';
import { Card, EmptyState, PageHeader, Pill, TableWrap, formatDateTime, tdClass, thClass } from '@/components/admin/ui';
import { NewSearchForm } from '@/components/admin/leads/NewSearchForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lead finder' };

const TONE = { running: 'amber', succeeded: 'green', failed: 'red' } as const;

export default async function LeadsPage() {
  const { data } = await supabaseServer()
    .from('lead_searches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  const searches = (data ?? []) as LeadSearch[];
  const providers = configuredProviders().map((p) => ({ value: p, label: PROVIDERS[p].label }));

  return (
    <>
      <PageHeader
        title="Lead finder"
        description="Find local businesses on Google Maps, with emails pulled from their own websites. Review the results, then import them into a contact list for a campaign."
      />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="New search">
          <NewSearchForm providers={providers} />
        </Card>
        <Card title="Searches" className="xl:col-span-2">
          {searches.length === 0 ? (
            <EmptyState title="No searches yet" body="Try something like “hvac contractor” in “Columbus, OH”." />
          ) : (
            <TableWrap label="Lead searches">
              <thead>
                <tr>
                  <th className={thClass}>Search</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Found</th>
                  <th className={`${thClass} text-right`}>With email</th>
                  <th className={thClass}>Started</th>
                </tr>
              </thead>
              <tbody>
                {searches.map((s) => (
                  <tr key={s.id}>
                    <td className={tdClass}>
                      <Link href={`/admin/leads/${s.id}`} className="text-white hover:underline">
                        {s.query} · {s.location}
                      </Link>
                      <p className="text-xs text-white/50">{PROVIDERS[s.provider]?.label ?? s.provider}, up to {s.max_results}</p>
                    </td>
                    <td className={tdClass}><Pill tone={TONE[s.status]}>{s.status}</Pill></td>
                    <td className={`${tdClass} text-right tabular-nums`}>{s.status === 'succeeded' ? s.result_count : '—'}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{s.status === 'succeeded' ? s.with_email_count : '—'}</td>
                    <td className={`${tdClass} whitespace-nowrap text-xs`}>{formatDateTime(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      </div>
    </>
  );
}
