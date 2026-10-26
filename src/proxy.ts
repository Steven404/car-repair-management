import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/features/auth/cookie';

/**
 * A quick check before any page renders: no session cookie, straight to the
 * login page, without first sending a page that would only redirect. Whether
 * the session is real is checked against the database by every page and
 * action (requireUser in features/auth/current-user.ts), never here.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  // Everything except the login page, the dev-only UI kit, Next's own files
  // and files with an extension (icons, fonts)
  matcher: ['/((?!login|ui-kit|_next/|.*\\..*).*)'],
};
