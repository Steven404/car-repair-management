import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/lib/db/client';
import { sessions, trustedDevices } from '@/lib/db/schema';
import { createTestUser, resetDatabase, TEST_PASSWORD } from '@/test/db';
import { verifyPassword } from './password';
import { createSession } from './session';
import { createTrustedDevice } from './trusted-device';
import { createUser, findUserByEmail, setUserPassword } from './users';

const newUser = { firstName: 'Μαρία', lastName: 'Παππά', password: TEST_PASSWORD };

describe('createUser', () => {
  beforeEach(resetDatabase);

  it('stores the email trimmed and lowercased, and the names trimmed', async () => {
    const user = await createUser({ ...newUser, email: ' Maria@Example.TEST ', firstName: ' Μαρία ' });
    expect(user.email).toBe('maria@example.test');
    expect(user.firstName).toBe('Μαρία');
    expect(await findUserByEmail('MARIA@example.test')).toBeDefined();
  });

  it('refuses a second user with the same email, in any case', async () => {
    await createUser({ ...newUser, email: 'maria@example.test' });
    await expect(createUser({ ...newUser, email: 'MARIA@example.test' })).rejects.toThrow(/already exists/);
  });

  it('refuses something that is not an email', async () => {
    await expect(createUser({ ...newUser, email: 'maria' })).rejects.toThrow(/not an email/);
  });

  it('refuses a missing name', async () => {
    await expect(createUser({ ...newUser, email: 'maria@example.test', lastName: ' ' })).rejects.toThrow(/name/);
  });
});

describe('setUserPassword', () => {
  beforeEach(resetDatabase);

  it('changes the password and signs the mechanic out everywhere', async () => {
    const user = await createTestUser();
    await createSession(user.id);
    await createSession(user.id);

    const { sessionsEnded } = await setUserPassword(user.email, 'another-password');
    const updated = await findUserByEmail(user.email);

    expect(sessionsEnded).toBe(2);
    expect(await db.$count(sessions)).toBe(0);
    expect(await verifyPassword('another-password', updated!.passwordHash)).toBe(true);
    expect(await verifyPassword(TEST_PASSWORD, updated!.passwordHash)).toBe(false);
  });

  it("forgets the user's trusted devices, and only theirs", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    await createTrustedDevice(user.id);
    await createTrustedDevice(other.id);

    await setUserPassword(user.email, 'another-password');
    const left = await db.select({ userId: trustedDevices.userId }).from(trustedDevices);
    expect(left).toEqual([{ userId: other.id }]);
  });

  it('says so when no one has the email', async () => {
    await expect(setUserPassword('nobody@example.test', 'another-password')).rejects.toThrow(/No user/);
  });
});
