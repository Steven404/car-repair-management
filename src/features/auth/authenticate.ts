import type { User } from '@/lib/db/schema';
import { verifyPassword } from './password';
import { beginLoginAttempt, clearFailedLogins } from './rate-limit';
import { findTrustedDevice, renewTrustedDevice } from './trusted-device';
import { findUserByEmail, normalizeEmail } from './users';

export type AuthResult =
  | { ok: true; user: User; trustedDevice: boolean }
  | { ok: false; reason: 'invalid' }
  | { ok: false; reason: 'locked'; retryAt: Date };

// A bcrypt hash (same cost as real ones) of a random string nobody knows. A
// login with an unknown email is checked against it, so it takes as long as
// a wrong password and the response time doesn't reveal which emails exist.
const DUMMY_HASH = '$2b$12$lRWrn17T6wp/qLOwXBy1gO5Hteook5DbXMBQ4c/PPrBhF9j1EOutG';

/**
 * Checks an email and password, with rate limiting. `deviceToken` is the
 * trusted-device cookie, if the request has one. Setting the cookies is the
 * caller's job: `trustedDevice` says whether the token was valid, so it knows
 * whether a new device cookie is due.
 */
export async function authenticate(
  emailInput: string,
  password: string,
  ip: string,
  deviceToken?: string
): Promise<AuthResult> {
  const email = normalizeEmail(emailInput);

  // A token that isn't valid for this email's user is the same as no token
  const deviceId = await findTrustedDevice(deviceToken, email);

  // Counts this attempt and checks the limit in one go, before the slow compare
  const retryAt = await beginLoginAttempt(email, ip, deviceId);
  if (retryAt) return { ok: false, reason: 'locked', retryAt };

  const user = await findUserByEmail(email);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  // The attempt is already recorded, so a failure has nothing left to write
  if (!user || !valid) {
    return { ok: false, reason: 'invalid' };
  }

  await clearFailedLogins(email, deviceId);
  if (deviceId) await renewTrustedDevice(deviceId);
  return { ok: true, user, trustedDevice: deviceId !== null };
}
