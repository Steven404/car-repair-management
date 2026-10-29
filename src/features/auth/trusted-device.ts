import { and, eq, gt, lt } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db/client';
import { trustedDevices, users } from '@/lib/db/schema';
import { hashToken } from './session';

const DAY_MS = 24 * 60 * 60 * 1000;

/** A device stops counting this long after its last successful login */
export const DEVICE_DAYS = 365;

/** Remembers this browser for the user and returns the token for the cookie. */
export async function createTrustedDevice(userId: string): Promise<string> {
  const now = Date.now();
  const token = randomBytes(32).toString('base64url');

  // Tidy up expired devices while we're here, like sessions
  await db.delete(trustedDevices).where(lt(trustedDevices.expiresAt, new Date(now)));
  await db.insert(trustedDevices).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(now + DEVICE_DAYS * DAY_MS),
  });
  return token;
}

/**
 * The device id for a cookie's token, if it is valid and belongs to the user
 * with this email; null for anything else. A token that is unknown, expired
 * or someone else's is treated like no cookie, and an unknown email costs the
 * same single query as a known one, so this reveals nothing about who exists.
 */
export async function findTrustedDevice(token: string | undefined, email: string): Promise<string | null> {
  if (!token) return null;
  const [row] = await db
    .select({ id: trustedDevices.id })
    .from(trustedDevices)
    .innerJoin(users, eq(users.id, trustedDevices.userId))
    .where(
      and(
        eq(trustedDevices.tokenHash, hashToken(token)),
        eq(users.email, email),
        gt(trustedDevices.expiresAt, new Date())
      )
    );
  return row?.id ?? null;
}

/** After a successful login from a trusted device: its year starts over. */
export async function renewTrustedDevice(deviceId: string): Promise<void> {
  await db
    .update(trustedDevices)
    .set({ expiresAt: new Date(Date.now() + DEVICE_DAYS * DAY_MS) })
    .where(eq(trustedDevices.id, deviceId));
}
