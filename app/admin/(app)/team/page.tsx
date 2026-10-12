import { supabaseServer } from '@/lib/supabase/server';
import { adminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { getTeamMember } from '@/lib/supabase/auth';
import type { TeamMember } from '@/lib/db/types';
import { Card, PageHeader, Pill, TableWrap, formatDate, formatDateTime, tdClass, thClass } from '@/components/admin/ui';
import { InviteForm } from '@/components/admin/team/InviteForm';
import { MemberActions } from '@/components/admin/team/MemberActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Team' };

export default async function TeamPage() {
  const me = await getTeamMember();
  const { data } = await supabaseServer().from('team_members').select('*').order('created_at');
  const members = (data ?? []) as TeamMember[];
  const isAdmin = me?.role === 'admin';

  // Last sign-in comes from Supabase Auth (service role, server only).
  const lastSeen = new Map<string, string | null>();
  if (adminConfigured()) {
    const { data: users } = await supabaseAdmin().auth.admin.listUsers({ perPage: 200 });
    users?.users.forEach((u) => lastSeen.set(u.id, u.last_sign_in_at ?? null));
  }
  const [{ data: owned }] = await Promise.all([
    supabaseServer().from('clients').select('owner_id').not('stage', 'in', '(live,lost)'),
  ]);
  const openByOwner = new Map<string, number>();
  ((owned ?? []) as { owner_id: string | null }[]).forEach((c) => {
    if (c.owner_id) openByOwner.set(c.owner_id, (openByOwner.get(c.owner_id) ?? 0) + 1);
  });

  return (
    <>
      <PageHeader
        title="Team"
        description={isAdmin ? 'Who can sign in to the dashboard. Admins can invite people, change roles and remove access.' : 'Who can sign in to the dashboard. Ask an admin to invite someone or change a role.'}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
        <div className="min-w-0">
          <TableWrap label="Team members">
            <thead>
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Role</th>
                <th className={`${thClass} text-right`}>Open clients</th>
                <th className={thClass}>Last signed in</th>
                {isAdmin ? <th className={thClass}><span className="sr-only">Actions</span></th> : null}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const seen = lastSeen.get(m.user_id);
                return (
                  <tr key={m.user_id}>
                    <td className={`${tdClass} min-w-[13rem]`}>
                      <p className="text-white whitespace-nowrap">
                        {m.full_name ?? m.email}
                        {m.user_id === me?.user_id ? <span className="ml-2 text-xs text-white/50">(you)</span> : null}
                      </p>
                      <p className="text-xs text-white/55">{m.email}</p>
                    </td>
                    <td className={tdClass}>
                      <Pill tone={m.role === 'admin' ? 'purple' : 'neutral'}>{m.role === 'admin' ? 'Admin' : 'Member'}</Pill>
                    </td>
                    <td className={`${tdClass} text-right tabular-nums`}>{openByOwner.get(m.user_id) ?? 0}</td>
                    <td className={`${tdClass} whitespace-nowrap text-xs`}>
                      {seen ? formatDateTime(seen) : adminConfigured() ? <Pill tone="amber">Invite pending</Pill> : '—'}
                      <p className="text-white/45">Added {formatDate(m.created_at)}</p>
                    </td>
                    {isAdmin ? (
                      <td className={`${tdClass} text-right`}>
                        {m.user_id !== me?.user_id ? <MemberActions member={m} /> : null}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </div>
        {isAdmin ? (
          <Card title="Invite someone">
            <InviteForm />
          </Card>
        ) : null}
      </div>
    </>
  );
}
