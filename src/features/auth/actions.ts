'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fieldErrors } from '@/lib/forms';
import { authenticate } from './authenticate';
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from './cookie';
import { createSession, invalidateSession } from './session';
import { loginSchema } from './validation';

export interface LoginState {
  /** Typed back into the field after a failed attempt */
  email: string;
  error?: string;
  fieldErrors?: { email?: string; password?: string };
}

/** Vercel sets x-forwarded-for to the visitor's address; locally there is none. */
async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

function lockedMessage(retryAt: Date): string {
  const minutes = Math.max(1, Math.ceil((retryAt.getTime() - Date.now()) / 60_000));
  return `Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε ${minutes} ${minutes === 1 ? 'λεπτό' : 'λεπτά'}.`;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const parsed = loginSchema.safeParse({ email, password: formData.get('password') ?? '' });
  if (!parsed.success) return { email, fieldErrors: fieldErrors(parsed.error) };

  const result = await authenticate(parsed.data.email, parsed.data.password, await clientIp());
  if (!result.ok) {
    // One message for a wrong email and a wrong password: which emails exist isn't for strangers to find out
    return { email, error: result.reason === 'locked' ? lockedMessage(result.retryAt) : 'Λάθος email ή κωδικός.' };
  }

  const { token } = await createSession(result.user.id);
  (await cookies()).set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  redirect('/vehicles');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await invalidateSession(token);
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}
