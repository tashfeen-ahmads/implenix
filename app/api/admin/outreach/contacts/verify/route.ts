import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyContactBatch } from '@/lib/outreach/verifyContacts';
import { verifierName } from '@/lib/leads/verify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Body = z.object({ listId: z.string().uuid().nullable().optional() });

// Verifies one batch of unchecked contacts (optionally one list). The page
// calls it until nothing is left.
export async function POST(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid list.' }, { status: 400 });
  try {
    const batch = await verifyContactBatch(supabaseAdmin(), { listId: parsed.data.listId ?? null, budgetMs: 40_000 });
    return NextResponse.json({ ...batch, verifier: verifierName() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Verification failed' }, { status: 500 });
  }
}
