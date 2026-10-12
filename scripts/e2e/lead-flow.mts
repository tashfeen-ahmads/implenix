// Email-first lead finder end to end: DataForSEO search (stub) -> results
// -> website email crawl (local fixture sites) -> verification.
// Run via npm run test:outreach (scripts/e2e/run.sh).
const { supabaseAdmin } = await import('../../lib/supabase/admin.ts');
const { startSearch, syncSearch } = await import('../../lib/leads/index.ts');
const { enrichSearch } = await import('../../lib/leads/enrich.ts');
const finder = await import('../../lib/leads/emailFinder.ts');
const verify = await import('../../lib/leads/verify.ts');

finder.setFinderDepsForTests({
  resolve: async () => [{ address: '93.184.216.34' }],
  fetchImpl: ((u: URL | string, init?: RequestInit) => {
    const x = new URL(String(u));
    return fetch(`http://127.0.0.1:4010/site/${x.hostname}${x.pathname}`, init);
  }) as typeof fetch,
});
verify.setDnsForTests({ mx: (async (d: string) => [{ exchange: `mx.${d}`, priority: 10 }]) as never });
verify.setVerifierForTests({
  name: 'test-verifier',
  verify: async (e: string) => (e.startsWith('catchall@') ? { verdict: 'risky', reason: 'catch_all' } : { verdict: 'deliverable', reason: 'ok' }),
});

const db = supabaseAdmin();
const results: [string, boolean, string][] = [];
const check = (n: string, ok: boolean, d: unknown = '') => results.push([n, ok, typeof d === 'string' ? d : JSON.stringify(d)]);

const started = await startSearch('dataforseo', { query: 'plumber', location: 'Columbus, OH', maxResults: 50, findEmails: false });
const { data: row } = await db
  .from('lead_searches')
  .insert({ provider: 'dataforseo', query: 'plumber', location: 'Columbus, OH', max_results: 50, find_emails: false, status: 'running', external_id: started.externalId, result_count: 0, with_email_count: 0, created_at: new Date().toISOString() })
  .select('*')
  .single();
const search = await syncSearch(db, row as never);
check('DataForSEO search completes', search.status === 'succeeded', search.status);

const all = async () => ((await db.from('lead_results').select('*').eq('search_id', search.id)).data ?? []) as Record<string, any>[];
let rows = await all();
const by = (name: string) => rows.find((r) => r.name === name)!;
check('4 businesses stored', rows.length === 4, rows.length);
check('listing email kept (contact_info mail)', by('Catchall Electric').email === 'catchall@catchall-e2e.com' && by('Catchall Electric').email_status === 'found', by('Catchall Electric'));
check('sites without email queued for crawl', by("Joe's Plumbing").email_status === 'pending' && by('Quiet HVAC').email_status === 'pending');
check('no website marked', by('No Site Roofing').email_status === 'no_website');

let p = await enrichSearch(db, search.id, { limit: 10, budgetMs: 20_000 });
for (let i = 0; i < 3 && !p.done; i++) p = await enrichSearch(db, search.id, { limit: 10, budgetMs: 20_000 });
rows = await all();
check("crawler found Joe's email via contact page", by("Joe's Plumbing").email === 'office@joesplumbing-e2e.com' && by("Joe's Plumbing").email_source === 'website', by("Joe's Plumbing"));
check('site without an email marked not_found', by('Quiet HVAC').email_status === 'not_found');
check("Joe's email verified deliverable", by("Joe's Plumbing").email_verdict === 'deliverable');
check('catch-all flagged risky', by('Catchall Electric').email_verdict === 'risky');
check('progress: 2 found, 1 sendable, done', p.found === 2 && p.sendable === 1 && p.done, p);

// Crawler edge cases.
const cf = (email: string, key = 0x2a) =>
  key.toString(16).padStart(2, '0') + [...email].map((c) => (c.charCodeAt(0) ^ key).toString(16).padStart(2, '0')).join('');
const found = finder.extractEmails(
  `<a href="mailto:Sales@Acme-e2e.com?subject=hi">x</a> info (at) acme-e2e (dot) com
   <a class="__cf_email__" data-cfemail="${cf('hidden@acme-e2e.com')}">[email protected]</a> logo@2x.png`,
);
check('extracts mailto, (at)/(dot) and Cloudflare-protected emails', ['sales@acme-e2e.com', 'info@acme-e2e.com', 'hidden@acme-e2e.com'].every((e) => found.includes(e)) && !found.some((e) => e.endsWith('.png')), found);
const robots = await finder.findEmailsOnWebsite('https://blocked-e2e.com');
check('robots.txt Disallow is honoured', robots.emails.length === 0 && /robots/i.test(robots.error ?? ''), robots);
const priv = await finder.findEmailsOnWebsite('http://169.254.169.254/latest/meta-data');
const privDns = await finder.findEmailsOnWebsite('https://intranet-e2e.com', { resolve: async () => [{ address: '10.0.0.5' }], fetchImpl: (() => { throw new Error('fetched'); }) as never });
check('private and metadata addresses are never fetched', priv.pages === 0 && privDns.pages === 0 && !privDns.error?.includes('fetched'), { priv, privDns });

// DNS rebinding: the real fetcher re-checks the address at connect time,
// even if the earlier check was fooled.
const rebind = await finder
  .pinnedFetch(new URL('http://localhost:4010/site/joesplumbing-e2e.com/'), {})
  .then((r) => `fetched ${r.status}`)
  .catch((e: any) => e.code ?? e.message);
check('connect-time check blocks a loopback address', rebind === 'EBLOCKED', rebind);

// Basic verification without a mailbox verifier.
verify.setVerifierForTests(null);
verify.setDnsForTests({
  mx: (async (d: string) => (d === 'nomail-e2e.com' ? [] : [{ exchange: `mx.${d}`, priority: 10 }])) as never,
  a: (async () => []) as never,
});
const v = async (e: string) => (await verify.verifyEmail(e)).verdict;
const verdicts = { ok: await v('owner@shop-e2e.com'), noMx: await v('owner@nomail-e2e.com'), role: await v('postmaster@shop-e2e.com'), disposable: await v('x@mailinator.com'), syntax: await v('not-an-email') };
check(
  'basic check: good domain passes (mailbox unconfirmed); no MX, blocked role, disposable and bad syntax undeliverable',
  verdicts.ok === 'unknown' && verdicts.noMx === 'undeliverable' && verdicts.role === 'undeliverable' && verdicts.disposable === 'undeliverable' && verdicts.syntax === 'undeliverable',
  verdicts,
);

for (const [n, ok, d] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${ok ? '' : `  ${d}`}`);
console.log(`${results.filter((r) => r[1]).length}/${results.length} passed`);
if (results.some((r) => !r[1])) process.exit(1);
