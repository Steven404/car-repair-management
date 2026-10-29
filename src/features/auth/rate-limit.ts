import { and, desc, eq, gt, isNull, lt, or, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { loginAttempts } from '@/lib/db/schema';

// Login attempts are counted in the database: Vercel runs several instances,
// so a count kept in memory would only see some of them.

export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_EMAIL = 5;
export const MAX_FAILURES_PER_IP = 20;
export const MAX_FAILURES_PER_DEVICE = 5;

/** Longest IP we store: an IPv6 address is at most 45 characters, the rest is junk from a forged header */
const MAX_IP_LENGTH = 64;

/**
 * When a locked-out caller may try again: once the oldest of the `max` attempts
 * before this one leaves the window. Null if fewer than `max` came before it.
 */
async function lockedUntil(match: SQL, max: number, attemptId: number): Promise<number | null> {
  const earlier = await db
    .select({ at: loginAttempts.attemptedAt })
    .from(loginAttempts)
    .where(and(match, lt(loginAttempts.id, attemptId), gt(loginAttempts.attemptedAt, new Date(Date.now() - WINDOW_MS))))
    .orderBy(desc(loginAttempts.attemptedAt))
    .limit(max);

  return earlier.length < max ? null : earlier[max - 1].at.getTime() + WINDOW_MS;
}

/**
 * Counts a login attempt and says whether it may go ahead. The attempt is
 * written BEFORE the check, so parallel requests all see each other's rows:
 * ids are ordered, and only the first `max` attempts in the window get through.
 * Checking first and writing after the (slow) password compare would let a
 * whole burst pass the check together.
 *
 * Who is limited depends on the cookie. Without a trusted device the email
 * is, so guessing at one account is capped; but then a stranger who knows the
 * email could keep the real mechanic locked out for good. A request carrying
 * a valid trusted-device cookie for that email's user is limited per device
 * instead, and its failures don't count against the email: the mechanic's own
 * browser gets through while strangers stay locked, and a stolen cookie still
 * only buys MAX_FAILURES_PER_DEVICE guesses per window. The IP limit
 * applies to everyone.
 *
 * Null if allowed: the row stays, and counts as a failure unless the login
 * succeeds (then clearFailedLogins removes it). Otherwise when to try again;
 * the row of a refused attempt is removed so hammering a locked account
 * doesn't extend the lock.
 */
export async function beginLoginAttempt(
  email: string,
  ipInput: string,
  deviceId: string | null = null
): Promise<Date | null> {
  const ip = ipInput.slice(0, MAX_IP_LENGTH);
  const now = Date.now();
  // Rows older than the window no longer count for anything
  await db.delete(loginAttempts).where(lt(loginAttempts.attemptedAt, new Date(now - WINDOW_MS)));
  const [{ id }] = await db
    .insert(loginAttempts)
    .values({ email, ip, deviceId, attemptedAt: new Date(now) })
    .returning({ id: loginAttempts.id });

  const [byIdentity, byIp] = await Promise.all([
    deviceId
      ? lockedUntil(eq(loginAttempts.deviceId, deviceId), MAX_FAILURES_PER_DEVICE, id)
      : // Device attempts don't count here, so a stolen cookie can't lock the email
        lockedUntil(and(eq(loginAttempts.email, email), isNull(loginAttempts.deviceId))!, MAX_FAILURES_PER_EMAIL, id),
    lockedUntil(eq(loginAttempts.ip, ip), MAX_FAILURES_PER_IP, id),
  ]);
  const until = Math.max(byIdentity ?? 0, byIp ?? 0);
  if (!until) return null;

  await db.delete(loginAttempts).where(eq(loginAttempts.id, id));
  return new Date(until);
}

/** Records a failure directly, without the limit check. */
export async function recordFailedLogin(email: string, ip: string, deviceId: string | null = null): Promise<void> {
  await db.insert(loginAttempts).values({ email, ip: ip.slice(0, MAX_IP_LENGTH), deviceId, attemptedAt: new Date() });
}

/** After a successful login: the email's and the device's earlier failures were the mechanic mistyping. */
export async function clearFailedLogins(email: string, deviceId: string | null = null): Promise<void> {
  const match = deviceId
    ? or(eq(loginAttempts.email, email), eq(loginAttempts.deviceId, deviceId))!
    : eq(loginAttempts.email, email);
  await db.delete(loginAttempts).where(match);
}
