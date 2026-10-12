import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Contact } from '@/lib/db/types';
import { verifyEmail } from '@/lib/leads/verify';
import { saveContactVerdict } from './sendable';

// Bulk verification for contacts nobody has checked yet (CSV uploads),
// run in time-boxed batches from the Contacts page.

export type VerifyBatch = { checked: number; undeliverable: number; risky: number; remaining: number };

const CONCURRENCY = 4;

const unverified = (db: SupabaseClient, listId: string | null) => {
  let q = db.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'active').is('verified_at', null);
  if (listId) q = q.eq('list_id', listId);
  return q;
};

export async function countUnverified(db: SupabaseClient, listId: string | null): Promise<number> {
  const { count } = await unverified(db, listId);
  return count ?? 0;
}

export async function verifyContactBatch(
  db: SupabaseClient,
  opts: { listId: string | null; limit?: number; budgetMs?: number },
): Promise<VerifyBatch> {
  const deadline = Date.now() + (opts.budgetMs ?? 40_000);
  let q = db.from('contacts').select('id, email').eq('status', 'active').is('verified_at', null).order('created_at').limit(opts.limit ?? 40);
  if (opts.listId) q = q.eq('list_id', opts.listId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Pick<Contact, 'id' | 'email'>[];

  const out: VerifyBatch = { checked: 0, undeliverable: 0, risky: 0, remaining: 0 };
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, rows.length) }, async () => {
      while (i < rows.length && Date.now() < deadline) {
        const c = rows[i++];
        const v = await verifyEmail(c.email);
        await saveContactVerdict(db, c, v);
        out.checked++;
        if (v.verdict === 'undeliverable') out.undeliverable++;
        if (v.verdict === 'risky') out.risky++;
      }
    }),
  );
  out.remaining = await countUnverified(db, opts.listId);
  return out;
}
