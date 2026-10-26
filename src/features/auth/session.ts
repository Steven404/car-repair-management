import { createHash, randomBytes } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { sessions, users } from '@/lib/db/schema';

const DAY_MS = 24 * 60 * 60 * 1000;

/** A session ends after this many days without use */
export const SESSION_DAYS = 30;

/** Used with fewer days than this left, a session is pushed back to SESSION_DAYS */
const RENEW_BELOW_DAYS = 15;

/** What the app knows about the signed-in mechanic; nothing secret */
export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** The database keeps only this, so a leaked copy of it can't be used as a cookie. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Starts a session and returns the token for the cookie. */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const now = Date.now();
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(now + SESSION_DAYS * DAY_MS);

  // Tidy up expired sessions while we're here; the table stays tiny
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date(now)));
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  return { token, expiresAt };
}

/**
 * The mechanic a cookie's token belongs to, or null for an unknown or expired
 * session. Using a session that is past half its life renews it, so a
 * mechanic who opens the app at least every few weeks stays signed in.
 */
export async function validateSessionToken(token: string): Promise<SessionUser | null> {
  const id = hashToken(token);
  const [row] = await db
    .select({
      expiresAt: sessions.expiresAt,
      user: { id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName },
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id));

  if (!row) return null;

  const now = Date.now();
  if (row.expiresAt.getTime() <= now) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  if (row.expiresAt.getTime() - now < RENEW_BELOW_DAYS * DAY_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(now + SESSION_DAYS * DAY_MS) })
      .where(eq(sessions.id, id));
  }
  return row.user;
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
}
