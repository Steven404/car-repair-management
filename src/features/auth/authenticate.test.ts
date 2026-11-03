import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db/client';
import { loginAttempts, type User } from '@/lib/db/schema';
import { createTestUser, resetDatabase, TEST_PASSWORD } from '@/test/db';
import { authenticate } from './authenticate';
import * as password from './password';
import {
  MAX_FAILURES_PER_DEVICE,
  MAX_FAILURES_PER_EMAIL,
  MAX_FAILURES_PER_IP,
  recordFailedLogin,
  WINDOW_MS,
} from './rate-limit';
import { createTrustedDevice } from './trusted-device';

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

  it('cannot be passed in one burst of parallel wrong logins', async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => authenticate(user.email, 'wrong-password', IP)));
    expect(results.filter((r) => !r.ok && r.reason === 'invalid')).toHaveLength(MAX_FAILURES_PER_EMAIL);
    expect(results.filter((r) => !r.ok && r.reason === 'locked')).toHaveLength(10 - MAX_FAILURES_PER_EMAIL);
    expect(await db.$count(loginAttempts)).toBe(MAX_FAILURES_PER_EMAIL);
  });

  it('does not run the password check for a locked request', async () => {
    await failTimes(MAX_FAILURES_PER_EMAIL);
    const verify = vi.spyOn(password, 'verifyPassword');
    expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(false);
    expect(verify).not.toHaveBeenCalled();
    verify.mockRestore();
  });

  it('does not extend a lock by hammering it', async () => {
    await failTimes(MAX_FAILURES_PER_EMAIL);
    await authenticate(user.email, 'wrong-password', IP);
    expect(await db.$count(loginAttempts)).toBe(MAX_FAILURES_PER_EMAIL);
  });

  it('leaves no row behind after a successful login', async () => {
    expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(true);
    expect(await db.$count(loginAttempts)).toBe(0);
  });

  describe('with a trusted device', () => {
    const attackerFails = async (times: number, email = user.email) => {
      for (let i = 0; i < times; i++) await authenticate(email, 'wrong-password', '198.51.100.9');
    };

    it('lets the mechanic in while a stranger has the email locked', async () => {
      const device = await createTrustedDevice(user.id);
      await attackerFails(MAX_FAILURES_PER_EMAIL + 3);

      const result = await authenticate(user.email, TEST_PASSWORD, IP, device);
      expect(result.ok && result.trustedDevice).toBe(true);
    });

    it('keeps the email locked for a request without the device', async () => {
      await createTrustedDevice(user.id);
      await attackerFails(MAX_FAILURES_PER_EMAIL);

      const result = await authenticate(user.email, TEST_PASSWORD, IP);
      expect(!result.ok && result.reason).toBe('locked');
    });

    it(`locks one device after ${MAX_FAILURES_PER_DEVICE} failures, whatever happened to the email`, async () => {
      const device = await createTrustedDevice(user.id);
      const other = await createTrustedDevice(user.id);
      for (let i = 0; i < MAX_FAILURES_PER_DEVICE; i++) {
        expect(await authenticate(user.email, 'wrong-password', IP, device)).toEqual({ ok: false, reason: 'invalid' });
      }

      const locked = await authenticate(user.email, TEST_PASSWORD, IP, device);
      expect(locked).toEqual({ ok: false, reason: 'locked', retryAt: new Date(START.getTime() + WINDOW_MS) });
      // Its failures didn't lock the email for others, nor another device
      expect((await authenticate(user.email, TEST_PASSWORD, IP, other)).ok).toBe(true);
      expect((await authenticate(user.email, TEST_PASSWORD, IP)).ok).toBe(true);
    });

    it('cannot be passed in one burst of parallel wrong logins', async () => {
      const device = await createTrustedDevice(user.id);
      const results = await Promise.all(
        Array.from({ length: 10 }, () => authenticate(user.email, 'wrong-password', IP, device))
      );
      expect(results.filter((r) => !r.ok && r.reason === 'invalid')).toHaveLength(MAX_FAILURES_PER_DEVICE);
      expect(results.filter((r) => !r.ok && r.reason === 'locked')).toHaveLength(10 - MAX_FAILURES_PER_DEVICE);
    });

    it("ignores another user's device", async () => {
      const other = await createTestUser({ email: 'other@example.test' });
      const foreign = await createTrustedDevice(other.id);
      await attackerFails(MAX_FAILURES_PER_EMAIL);

      const result = await authenticate(user.email, TEST_PASSWORD, IP, foreign);
      expect(!result.ok && result.reason).toBe('locked');
    });

    it('ignores a made-up token, and an unknown email gives the plain answer', async () => {
      await attackerFails(MAX_FAILURES_PER_EMAIL);
      const locked = await authenticate(user.email, TEST_PASSWORD, IP, 'made-up-token');
      expect(!locked.ok && locked.reason).toBe('locked');

      const device = await createTrustedDevice(user.id);
      expect(await authenticate('nobody@example.test', 'x', IP, device)).toEqual({ ok: false, reason: 'invalid' });
    });

    it('ignores an expired device', async () => {
      const device = await createTrustedDevice(user.id);
      await attackerFails(MAX_FAILURES_PER_EMAIL);
      vi.setSystemTime(START.getTime() + 366 * 24 * 60 * 60 * 1000);
      // The failures have aged out too, so look at the device itself
      await attackerFails(MAX_FAILURES_PER_EMAIL);
      const result = await authenticate(user.email, TEST_PASSWORD, IP, device);
      expect(!result.ok && result.reason).toBe('locked');
    });

    it('still obeys the IP limit', async () => {
      const device = await createTrustedDevice(user.id);
      for (let i = 0; i < MAX_FAILURES_PER_IP; i++) await recordFailedLogin(`guess-${i}@example.test`, IP);
      expect((await authenticate(user.email, TEST_PASSWORD, IP, device)).ok).toBe(false);
    });

    it('clears the device and email failures after a successful login', async () => {
      const device = await createTrustedDevice(user.id);
      await attackerFails(2);
      await authenticate(user.email, 'wrong-password', IP, device);
      expect((await authenticate(user.email, TEST_PASSWORD, IP, device)).ok).toBe(true);
      expect(await db.$count(loginAttempts)).toBe(0);
    });
  });
});
