import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/client';
import { sessions, users, type User } from '@/lib/db/schema';
import { createTestUser, resetDatabase } from '@/test/db';
import { createSession, hashToken, invalidateSession, SESSION_DAYS, validateSessionToken } from './session';

const DAY_MS = 24 * 60 * 60 * 1000;
const START = new Date('2026-10-01T09:00:00Z');

const storedExpiry = async (token: string) =>
  (await db.query.sessions.findFirst({ where: eq(sessions.id, hashToken(token)) }))?.expiresAt;

describe('sessions', () => {
  let user: User;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(START);
    await resetDatabase();
    user = await createTestUser();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gives back the mechanic, without the password hash', async () => {
    const { token } = await createSession(user.id);
    expect(await validateSessionToken(token)).toEqual({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  });

  it('stores only a hash of the token', async () => {
    const { token } = await createSession(user.id);
    const [row] = await db.select().from(sessions);
    expect(row.id).not.toBe(token);
    expect(row.id).toBe(hashToken(token));
  });

  it('knows nothing of an unknown token', async () => {
    expect(await validateSessionToken('not-a-real-token')).toBeNull();
  });

  it('lasts 30 days, then is gone', async () => {
    const { token, expiresAt } = await createSession(user.id);
    expect(expiresAt.getTime()).toBe(START.getTime() + SESSION_DAYS * DAY_MS);

    vi.setSystemTime(expiresAt);
    expect(await validateSessionToken(token)).toBeNull();
    expect(await db.$count(sessions)).toBe(0);
  });

  it('is renewed to 30 days when used with less than 15 left', async () => {
    const { token, expiresAt } = await createSession(user.id);

    vi.setSystemTime(START.getTime() + 5 * DAY_MS); // 25 days left: not yet
    await validateSessionToken(token);
    expect(await storedExpiry(token)).toEqual(expiresAt);

    const day20 = START.getTime() + 20 * DAY_MS; // 10 days left
    vi.setSystemTime(day20);
    expect(await validateSessionToken(token)).not.toBeNull();
    expect(await storedExpiry(token)).toEqual(new Date(day20 + SESSION_DAYS * DAY_MS));
  });

  it('ends on logout', async () => {
    const { token } = await createSession(user.id);
    await invalidateSession(token);
    expect(await validateSessionToken(token)).toBeNull();
  });

  it('clears out expired sessions when a new one starts', async () => {
    await createSession(user.id);
    vi.setSystemTime(START.getTime() + 31 * DAY_MS);
    await createSession(user.id);
    expect(await db.$count(sessions)).toBe(1);
  });

  it('goes when the mechanic is deleted', async () => {
    await createSession(user.id);
    await db.delete(users).where(eq(users.id, user.id));
    expect(await db.$count(sessions)).toBe(0);
  });
});
