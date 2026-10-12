import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase/server';

// Team invite / email link landing. Verifies the one-time token server side,
// which sets the session cookie, then continues into the dashboard.
const TYPES: EmailOtpType[] = ['invite', 'magiclink', 'recovery', 'email'];

export async function GET(req: NextRequest) {
  const tokenHash = req.nextUrl.searchParams.get('token_hash');
  const type = req.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const nextParam = req.nextUrl.searchParams.get('next') ?? '/admin';
  const next = nextParam.startsWith('/admin') ? nextParam : '/admin';
  if (tokenHash && type && TYPES.includes(type)) {
    const { error } = await supabaseServer().auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, req.url));
  }
  const login = new URL('/admin/login', req.url);
  login.searchParams.set('error', 'link');
  return NextResponse.redirect(login);
}
