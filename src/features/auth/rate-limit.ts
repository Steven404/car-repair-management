import { and, desc, eq, gt, lt, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { loginAttempts } from '@/lib/db/schema';

// Failed logins are counted in the database: Vercel runs several instances,
// so a count kept in memory would only see some of them.

export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_EMAIL = 5;
export const MAX_FAILURES_PER_IP = 20;

/**
 * When a locked-out caller may try again: once the oldest failure that counts
 * towards the limit leaves the window. Null when not locked.
 */
async function lockedUntil(match: SQL, max: number): Promise<number | null> {
  const recent = await db
    .select({ at: loginAttempts.attemptedAt })
    .from(loginAttempts)
    .where(and(match, gt(loginAttempts.attemptedAt, new Date(Date.now() - WINDOW_MS))))
    .orderBy(desc(loginAttempts.attemptedAt))
    .limit(max);

  return recent.length < max ? null : recent[max - 1].at.getTime() + WINDOW_MS;
}

/** Null if this email and IP may try to log in now, otherwise when they may. */
export async function loginRetryAt(email: string, ip: string): Promise<Date | null> {
  const [byEmail, byIp] = await Promise.all([
    lockedUntil(eq(loginAttempts.email, email), MAX_FAILURES_PER_EMAIL),
    lockedUntil(eq(loginAttempts.ip, ip), MAX_FAILURES_PER_IP),
  ]);
  const until = Math.max(byEmail ?? 0, byIp ?? 0);
  return until ? new Date(until) : null;
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  const now = Date.now();
  // Rows older than the window no longer count for anything
  await db.delete(loginAttempts).where(lt(loginAttempts.attemptedAt, new Date(now - WINDOW_MS)));
  await db.insert(loginAttempts).values({ email, ip, attemptedAt: new Date(now) });
}

/** After a successful login: the email's earlier failures were the mechanic mistyping. */
export async function clearFailedLogins(email: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.email, email));
}
