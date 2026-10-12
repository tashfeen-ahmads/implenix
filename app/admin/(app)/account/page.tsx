import { getTeamMember } from '@/lib/supabase/auth';
import { Card, PageHeader } from '@/components/admin/ui';
import { AccountForms } from '@/components/admin/team/AccountForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your account' };

export default async function AccountPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const me = await getTeamMember();
  if (!me) return null;
  return (
    <>
      <PageHeader title="Your account" description={me.email} />
      {searchParams.welcome ? (
        <p role="status" className="mb-6 max-w-2xl border border-emerald-400/30 bg-emerald-500/10 rounded-md px-4 py-3 font-body text-sm text-emerald-200">
          Welcome to the team. Set a password below so you can sign in without an email link next time.
        </p>
      ) : null}
      <div className="max-w-2xl">
        <Card title="Profile and password">
          <AccountForms fullName={me.full_name ?? ''} />
        </Card>
      </div>
    </>
  );
}
