import type { User } from '@/lib/db/schema';
import { verifyPassword } from './password';
import { clearFailedLogins, loginRetryAt, recordFailedLogin } from './rate-limit';
import { findUserByEmail, normalizeEmail } from './users';

export type AuthResult =
  { ok: true; user: User } | { ok: false; reason: 'invalid' } | { ok: false; reason: 'locked'; retryAt: Date };

// A bcrypt hash (same cost as real ones) of a random string nobody knows. A
// login with an unknown email is checked against it, so it takes as long as
// a wrong password and the response time doesn't reveal which emails exist.
const DUMMY_HASH = '$2b$12$lRWrn17T6wp/qLOwXBy1gO5Hteook5DbXMBQ4c/PPrBhF9j1EOutG';

/** Checks an email and password, with rate limiting. Setting the session cookie is the caller's job. */
export async function authenticate(emailInput: string, password: string, ip: string): Promise<AuthResult> {
  const email = normalizeEmail(emailInput);

  const retryAt = await loginRetryAt(email, ip);
  if (retryAt) return { ok: false, reason: 'locked', retryAt };

  const user = await findUserByEmail(email);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    await recordFailedLogin(email, ip);
    return { ok: false, reason: 'invalid' };
  }

  await clearFailedLogins(email);
  return { ok: true, user };
}
