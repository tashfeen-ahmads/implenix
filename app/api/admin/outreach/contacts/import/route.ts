import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ImportError, ImportRow, importContacts } from '@/lib/outreach/importContacts';

// CSV import (already parsed in the browser). Large files arrive in
// batches: the first creates the list, later batches pass its listId.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Body = z.object({
  listName: z.string().trim().min(1).max(200),
  listId: z.string().uuid().optional().nullable(),
  sourceFile: z.string().max(300).optional().nullable(),
  rows: z.array(ImportRow).max(50_000),
});

export async function POST(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  try {
    const result = await importContacts(supabaseAdmin(), { ...parsed.data, createdBy: auth.member.user_id });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ImportError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
