import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/client';
import { loginAttempts, type User } from '@/lib/db/schema';
import { createTestUser, resetDatabase, TEST_PASSWORD } from '@/test/db';
import { authenticate } from './authenticate';
import { MAX_FAILURES_PER_EMAIL, MAX_FAILURES_PER_IP, recordFailedLogin, WINDOW_MS } from './rate-limit';

const IP = '203.0.113.7';
const START = new Date('2026-10-01T09:00:00Z');

describe('authenticate', () => {
  let user: User;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(START);
    await resetDatabase();
    user = await createTestUser({ email: 'mechanic@example.test' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const failTimes = async (times: number, email = user.email) => {
    for (let i = 0; i < times; i++) {
      expect(await authenticate(email, 'wrong-password', IP)).toEqual({ ok: false, reason: 'invalid' });
    }
  };

  it('signs in with the right email and password', async () => {
    const result = await authenticate(user.email, TEST_PASSWORD, IP);
    expect(result.ok && result.user.id).toBe(user.id);
  });

  it('ignores case and spaces around the email', async () => {
    expect((await authenticate('  Mechanic@Example.TEST ', TEST_PASSWORD, IP)).ok).toBe(true);
  });

  it('gives the same answer for a wrong password and an unknown email, and counts both', async () => {
    expect(await authenticate(user.email, 'wrong-password', IP)).toEqual({ ok: false, reason: 'invalid' });
    expect(await authenticate('nobody@example.test', TEST_PASSWORD, IP)).toEqual({ ok: false, reason: 'invalid' });
    expect(await db.$count(loginAttempts)).toBe(2);
  });

  it(`locks an email after ${MAX_FAILURES_PER_EMAIL} failures, even with the right password`, async () => {
    await failTimes(MAX_FAILURES_PER_EMAIL);
    const result = await authenticate(user.email, TEST_PASSWORD, IP);
    expect(result).toEqual({ ok: false, reason: 'locked', retryAt: new Date(START.getTime() + WINDOW_MS) });
  });

  it('unlocks once the failures are older than 15 minutes', async () => {
    await failTimes(MAX_FAILURES_PER_EMAIL);
    vi.setSystemTime(START.getTime() + WINDOW_MS + 1000);
    expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(true);
  });

  it('forgets earlier failures after a successful login', async () => {
    await failTimes(MAX_FAILURES_PER_EMAIL - 1);
    expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(true);
    await failTimes(MAX_FAILURES_PER_EMAIL - 1);
    expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(true);
  });

  it(`locks an IP after ${MAX_FAILURES_PER_IP} failures across any emails`, async () => {
    for (let i = 0; i < MAX_FAILURES_PER_IP; i++) await recordFailedLogin(`guess-${i}@example.test`, IP);

    expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(false);
    expect((await authenticate(user.email, TEST_PASSWORD, '198.51.100.1')).ok).toBe(true);
  });
});
