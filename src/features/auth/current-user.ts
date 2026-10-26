import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { cache } from 'react';
import { SESSION_COOKIE } from './cookie';
import { validateSessionToken, type SessionUser } from './session';

/**
 * The signed-in mechanic, or null. Checked against the database, once per
 * request however many components ask. It reads a cookie, so whatever calls
 * it renders at request time, inside <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Next can prerender a page per session, ahead of a click. Checking a session
  // compares its expiry with the current time and may renew it, so it waits
  // for the real request.
  await connection();
  return validateSessionToken(token);
});

/**
 * The signed-in mechanic; anyone else is sent to the login page. Every page,
 * query and Server Action that touches a mechanic's data goes through this:
 * proxy.ts only checks that a cookie exists.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
