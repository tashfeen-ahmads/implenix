import { NextResponse, type NextRequest } from 'next/server';
import { adminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { escapeHtml, verifyUnsubscribeToken } from '@/lib/outreach/render';
import { suppressAndStop } from '@/lib/outreach/suppress';

// Unsubscribe link (GET, from the email footer) and RFC 8058 one-click
// unsubscribe (POST, sent by mailbox providers from List-Unsubscribe-Post).
// Both carry ?c=<contact id>&t=<HMAC token>.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function unsubscribe(req: NextRequest): Promise<'ok' | 'invalid' | 'error'> {
  const c = req.nextUrl.searchParams.get('c') ?? '';
  const t = req.nextUrl.searchParams.get('t') ?? '';
  if (!UUID_RE.test(c) || !t || !adminConfigured()) return 'invalid';
  try {
    const db = supabaseAdmin();
    const { data } = await db.from('contacts').select('id, email').eq('id', c).maybeSingle();
    const contact = data as { id: string; email: string } | null;
    if (!contact || !verifyUnsubscribeToken(contact.id, contact.email, t)) return 'invalid';
    await suppressAndStop(db, contact.email, 'unsubscribed');
    return 'ok';
  } catch (err) {
    console.error('[outreach/unsubscribe] failed', err instanceof Error ? err.message : err);
    return 'error';
  }
}

function page(title: string, message: string, status: number) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title>
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f7f9;color:#1f2328}
main{max-width:480px;margin:15vh auto;padding:32px 24px;background:#fff;border:1px solid #e3e5e8;border-radius:12px}
h1{font-size:20px;margin:0 0 12px}p{margin:0;line-height:1.5;color:#4b5058}</style></head>
<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></main></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

export async function GET(req: NextRequest) {
  const res = await unsubscribe(req);
  if (res === 'ok') {
    return page("You're unsubscribed", 'You will not receive any more emails from us. Sorry for the interruption.', 200);
  }
  if (res === 'invalid') {
    return page(
      'Link not recognised',
      'This unsubscribe link is invalid or expired. Reply to the email with "unsubscribe" and we will remove you.',
      400,
    );
  }
  return page('Something went wrong', 'Please try again in a minute, or reply "unsubscribe" to the email.', 500);
}

// RFC 8058: body is "List-Unsubscribe=One-Click"; respond 2xx, no redirect.
export async function POST(req: NextRequest) {
  const res = await unsubscribe(req);
  if (res === 'ok') return NextResponse.json({ ok: true });
  if (res === 'invalid') return NextResponse.json({ ok: false, error: 'Invalid link' }, { status: 400 });
  return NextResponse.json({ ok: false, error: 'Try again later' }, { status: 500 });
}
