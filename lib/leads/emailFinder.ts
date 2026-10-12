import 'server-only';
import { lookup } from 'node:dns/promises';
import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { Readable } from 'node:stream';
import { cleanEmails } from './normalize';

// Finds a business's email on its own website: the homepage plus up to
// three contact/about pages on the same site. Reads mailto links, plain
// text, "name [at] domain [dot] com" style obfuscation and Cloudflare's
// email protection. Honours robots.txt.
//
// The URLs come from third-party listings, so every hop is checked:
// http(s) only, no private or internal addresses, manual redirects (each
// re-checked), short timeouts and a size cap. The address is checked
// again when the connection opens (pinnedFetch), so a domain can't pass
// the check and then re-point to an internal address (DNS rebinding).

const UA = 'Mozilla/5.0 (compatible; ImplenixLeadBot/1.0; +https://implenix.net)';
const MAX_BYTES = 1_500_000;
const PAGE_TIMEOUT_MS = 8_000;
const MAX_EXTRA_PAGES = 3;
const LINK_HINT = /(contact|about|team|staff|our-?story|reach|get-?in-?touch|location|office|connect)/i;

export type FinderResult = { emails: string[]; pages: number; error?: string };

// Overridable for tests only (no DNS or outside network in CI).
export type FinderDeps = {
  resolve?: (host: string) => Promise<{ address: string }[]>;
  fetchImpl?: typeof fetch;
};

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 10 || a === 127 || a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80') || v6.startsWith('::ffff:');
}

async function safeUrl(raw: string, deps: FinderDeps = {}): Promise<URL | null> {
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (u.port && !['80', '443'].includes(u.port)) return null;
  const host = u.hostname;
  if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (isIP(host)) return isPrivateIp(host) ? null : u;
  try {
    const addrs = deps.resolve ? await deps.resolve(host) : await lookup(host, { all: true });
    if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) return null;
  } catch {
    return null;
  }
  return u;
}

// Resolves like the OS does, but refuses private and internal addresses.
// Runs at connect time, on the address actually used.
function safeLookup(
  hostname: string,
  options: { all?: boolean; family?: number },
  cb: (err: NodeJS.ErrnoException | null, address?: string | LookupAddress[], family?: number) => void,
) {
  dnsLookup(hostname, { family: options.family ?? 0, all: true }, (err, addrs) => {
    if (err) return cb(err);
    const list = addrs as LookupAddress[];
    if (!list.length || list.some((a) => isPrivateIp(a.address))) {
      return cb(Object.assign(new Error(`Blocked address for ${hostname}`), { code: 'EBLOCKED' }));
    }
    if (options.all) return cb(null, list);
    cb(null, list[0].address, list[0].family);
  });
}

// GET with the connect-time address check. Returns a standard Response.
export function pinnedFetch(url: URL, init: { headers?: Record<string, string>; signal?: AbortSignal }): Promise<Response> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request(
      url,
      { method: 'GET', headers: init.headers, signal: init.signal, lookup: safeLookup as never, timeout: PAGE_TIMEOUT_MS },
      (res) => {
        const headers = new Headers();
        for (const [k, v] of Object.entries(res.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
        const status = Math.min(599, Math.max(200, res.statusCode ?? 500));
        const noBody = [204, 205, 304].includes(status);
        if (noBody) res.resume();
        resolve(new Response(noBody ? null : (Readable.toWeb(res) as ReadableStream<Uint8Array>), { status, headers }));
      },
    );
    req.on('timeout', () => req.destroy(new Error('Timed out')));
    req.on('error', reject);
    req.end();
  });
}

async function fetchText(start: URL, deps: FinderDeps = {}): Promise<{ url: URL; html: string } | null> {
  const doFetch = deps.fetchImpl ?? (pinnedFetch as unknown as typeof fetch);
  let url: URL | null = start;
  for (let hop = 0; hop < 4 && url; hop++) {
    const res: Response = await doFetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      url = loc ? await safeUrl(new URL(loc, url).toString(), deps) : null;
      continue;
    }
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    if (!/html|text\/plain/i.test(type)) return null;
    // Read at most MAX_BYTES.
    const reader = res.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      size += value.length;
      if (size > MAX_BYTES) {
        await reader.cancel();
        break;
      }
    }
    return { url, html: Buffer.concat(chunks).toString('utf8') };
  }
  return null;
}

// Minimal robots.txt check for our user agent and "*".
async function robotsAllows(origin: URL, deps: FinderDeps): Promise<(path: string) => boolean> {
  try {
    const got = await fetchText(new URL('/robots.txt', origin), deps);
    if (!got) return () => true;
    const rules: string[] = [];
    let applies = false;
    for (const line of got.html.split(/\r?\n/)) {
      const [k, ...rest] = line.split(':');
      const key = k.trim().toLowerCase();
      const value = rest.join(':').trim();
      if (key === 'user-agent') applies = value === '*' || /implenix/i.test(value);
      else if (applies && key === 'disallow' && value) rules.push(value);
    }
    return (path: string) => !rules.some((r) => path.startsWith(r.replace(/\*.*$/, '')));
  } catch {
    return () => true;
  }
}

// Cloudflare "email protection": hex string XORed with its first byte.
function decodeCf(hex: string): string {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

const decodeEntities = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&commat;|&#64;/g, '@')
    .replace(/&period;/g, '.');

export function extractEmails(html: string): string[] {
  const found: string[] = [];
  const text = decodeEntities(html);
  for (const m of text.matchAll(/mailto:([^"'?>\s]+)/gi)) found.push(decodeURIComponent(m[1]));
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)) found.push(decodeCf(m[1]));
  for (const m of html.matchAll(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/gi)) found.push(decodeCf(m[1]));
  // Visible text only (drop scripts/styles) for plain and obfuscated forms.
  const visible = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  for (const m of visible.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)) found.push(m[0]);
  for (const m of visible.matchAll(/([a-z0-9._%+-]+)\s*[[(]\s*at\s*[\])]\s*([a-z0-9-]+(?:\s*[[(]\s*dot\s*[\])]\s*[a-z0-9-]+)+)/gi)) {
    found.push(`${m[1]}@${m[2].replace(/\s*[[(]\s*dot\s*[\])]\s*/gi, '.')}`);
  }
  return cleanEmails(found);
}

function contactLinks(html: string, base: URL): URL[] {
  const out = new Map<string, URL>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const [, href, label] = m;
    if (!LINK_HINT.test(href) && !LINK_HINT.test(label.replace(/<[^>]+>/g, ''))) continue;
    try {
      const u = new URL(href, base);
      if (u.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) continue;
      if (/\.(pdf|jpe?g|png|gif|zip|docx?)$/i.test(u.pathname)) continue;
      u.hash = '';
      out.set(u.toString(), u);
    } catch {
      // ignore bad hrefs
    }
  }
  return [...out.values()].slice(0, MAX_EXTRA_PAGES);
}

// Same-domain addresses first (info@theirsite.com beats a stray gmail),
// then the rest.
export function rankEmails(emails: string[], website: string | null): string[] {
  let host = '';
  try {
    host = new URL(/^https?:/i.test(website ?? '') ? website! : `https://${website}`).hostname.replace(/^www\./, '');
  } catch {
    host = '';
  }
  const own = (e: string) => (host && (e.endsWith(`@${host}`) || e.endsWith(`.${host}`)) ? 0 : 1);
  return [...emails].sort((a, b) => own(a) - own(b));
}

// Tests only: route crawls to local fixtures (CI has no DNS).
let testDeps: FinderDeps | null = null;
export function setFinderDepsForTests(d: FinderDeps | null) {
  testDeps = d;
}

export async function findEmailsOnWebsite(
  website: string,
  deps: FinderDeps = testDeps ?? {},
  // Extra pages to try first, e.g. the listing's contact-page URL.
  extraUrls: string[] = [],
): Promise<FinderResult> {
  const start = await safeUrl(website, deps);
  if (!start) return { emails: [], pages: 0, error: 'Website address is not reachable or not allowed' };
  try {
    const allowed = await robotsAllows(new URL(start.origin), deps);
    if (!allowed(start.pathname || '/')) return { emails: [], pages: 0, error: 'Blocked by robots.txt' };
    const home = await fetchText(start, deps);
    if (!home) return { emails: [], pages: 0, error: 'Website did not load' };
    const emails = new Set(extractEmails(home.html));
    let pages = 1;
    if (emails.size === 0) {
      const extra = extraUrls
        .map((u) => {
          try {
            const x = new URL(u, home.url);
            return x.hostname.replace(/^www\./, '') === home.url.hostname.replace(/^www\./, '') ? x : null;
          } catch {
            return null;
          }
        })
        .filter((u): u is URL => u !== null);
      for (const link of [...extra, ...contactLinks(home.html, home.url)].slice(0, MAX_EXTRA_PAGES + 1)) {
        if (!allowed(link.pathname)) continue;
        const safe = await safeUrl(link.toString(), deps);
        if (!safe) continue;
        const page = await fetchText(safe, deps).catch(() => null);
        pages++;
        if (page) extractEmails(page.html).forEach((e) => emails.add(e));
        if (emails.size) break;
      }
    }
    return { emails: rankEmails([...emails], website), pages };
  } catch (err) {
    return { emails: [], pages: 0, error: err instanceof Error ? err.message.slice(0, 200) : 'Fetch failed' };
  }
}
