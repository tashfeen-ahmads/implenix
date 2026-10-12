import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Guards the team dashboard. Refreshes the Supabase session cookie and
// sends signed-out visitors to /admin/login. Team membership itself is
// checked in the admin layout (and enforced by RLS on every query).
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLogin =
    req.nextUrl.pathname.startsWith('/admin/login') ||
    req.nextUrl.pathname.startsWith('/admin/auth');
  // Not configured yet: let the admin pages render their setup notice.
  if (!url || !key) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const login = req.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(login);
  }
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
