import { redirect } from 'next/navigation';
import { getCurrentUser } from '../current-user';

/**
 * On the login page: a mechanic who is already signed in goes to the app.
 * proxy.ts can't do this, because it only sees that a cookie exists, and a
 * stale cookie would bounce between the two pages. Render inside <Suspense>.
 */
export async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect('/vehicles');
  return null;
}
