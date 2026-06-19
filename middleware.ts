import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Quick edge-level bounce for unauthenticated visitors poking at
// /admin/dashboard. This only checks that *a* cookie is present -- the
// real verification (isAdmin(), via HMAC comparison) happens again in
// each page and API route, since that check needs Node's crypto module.
export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
