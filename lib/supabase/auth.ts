import 'server-only';
import { NextResponse } from 'next/server';
import { supabaseServer } from './server';
import { supabaseConfigured } from './env';
import type { TeamMember } from '@/lib/db/types';

// Returns the signed-in team member, or null when the visitor is signed
// out or signed in but not on the team.
export async function getTeamMember(): Promise<TeamMember | null> {
  if (!supabaseConfigured()) return null;
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return (data as TeamMember | null) ?? null;
}

// For /api/admin/* route handlers: the member, or a 401 response.
export async function requireTeamApi(): Promise<
  { member: TeamMember; error?: undefined } | { member?: undefined; error: NextResponse }
> {
  const member = await getTeamMember();
  if (!member) {
    return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) };
  }
  return { member };
}
