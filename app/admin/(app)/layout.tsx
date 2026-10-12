import { Sidebar } from '@/components/admin/Sidebar';
import { getTeamMember } from '@/lib/supabase/auth';
import { supabaseConfigured } from '@/lib/supabase/env';
import { SignOutButton } from '@/components/admin/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) {
    return (
      <Notice title="Connect Supabase to use the dashboard">
        Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
        SUPABASE_SERVICE_ROLE_KEY, then run the migration in
        supabase/migrations. Full steps are in docs/TEAM_DASHBOARD.md.
      </Notice>
    );
  }
  const member = await getTeamMember();
  if (!member) {
    return (
      <Notice title="You are signed in, but not on the team yet">
        Ask an admin to add your account to team_members (see
        docs/TEAM_DASHBOARD.md).
        <div className="mt-4"><SignOutButton /></div>
      </Notice>
    );
  }
  return (
    <div className="lg:flex">
      <Sidebar name={member.full_name ?? member.email} email={member.email} />
      <main id="main" className="flex-1 min-w-0 px-4 py-8 md:px-8 lg:px-10">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md border border-white/10 rounded-md p-8">
        <h1 className="font-heading text-xl text-white">{title}</h1>
        <div className="mt-3 font-body text-sm text-white/70 leading-relaxed">{children}</div>
      </div>
    </main>
  );
}
