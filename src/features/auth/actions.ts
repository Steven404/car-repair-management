'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fieldErrors } from '@/lib/forms';
import { authenticate } from './authenticate';
import { DEVICE_COOKIE, DEVICE_COOKIE_OPTIONS, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from './cookie';
import { pickClientIp } from './client-ip';
import { createSession, invalidateSession } from './session';
import { createTrustedDevice } from './trusted-device';
import { loginSchema } from './validation';

export interface LoginState {
  /** Typed back into the field after a failed attempt */
  email: string;
  error?: string;
  fieldErrors?: { email?: string; password?: string };
}

async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  return pickClientIp(requestHeaders.get('x-vercel-forwarded-for'), requestHeaders.get('x-forwarded-for'));
}

function lockedMessage(retryAt: Date): string {
  const minutes = Math.max(1, Math.ceil((retryAt.getTime() - Date.now()) / 60_000));
  return `Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε ${minutes} ${minutes === 1 ? 'λεπτό' : 'λεπτά'}.`;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const parsed = loginSchema.safeParse({ email, password: formData.get('password') ?? '' });
  if (!parsed.success) return { email, fieldErrors: fieldErrors(parsed.error) };

  const cookieStore = await cookies();
  const deviceToken = cookieStore.get(DEVICE_COOKIE)?.value;

  const result = await authenticate(parsed.data.email, parsed.data.password, await clientIp(), deviceToken);
  if (!result.ok) {
    // One message for a wrong email and a wrong password: which emails exist isn't for strangers to find out
    return { email, error: result.reason === 'locked' ? lockedMessage(result.retryAt) : 'Λάθος email ή κωδικός.' };
  }

  // Signing in again from a browser that still holds a session must not leave the old one valid
  const oldSession = cookieStore.get(SESSION_COOKIE)?.value;
  if (oldSession) await invalidateSession(oldSession);

  const { token } = await createSession(result.user.id);
  cookieStore.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);

  // A new device is remembered from here on; a known one just has its year extended
  if (deviceToken && result.trustedDevice) cookieStore.set(DEVICE_COOKIE, deviceToken, DEVICE_COOKIE_OPTIONS);
  else cookieStore.set(DEVICE_COOKIE, await createTrustedDevice(result.user.id), DEVICE_COOKIE_OPTIONS);
  redirect('/vehicles');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await invalidateSession(token);
  cookieStore.delete(SESSION_COOKIE);
  // The device cookie stays: signing out doesn't make this browser a stranger. Only a password reset revokes it.
  redirect('/login');
}
