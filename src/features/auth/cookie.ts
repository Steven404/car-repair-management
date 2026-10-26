// Shared by the login action, getCurrentUser and proxy.ts. No database
// imports here: proxy.ts only checks that the cookie is there.

export const SESSION_COOKIE = 'session';

/**
 * The cookie outlives any session: the database decides when a session ends
 * (see session.ts), and renewing it there then needs no new cookie. 400 days
 * is the longest browsers keep one.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 400 * 24 * 60 * 60,
} as const;
