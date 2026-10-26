import { createUser } from '@/features/auth/users';
import { db } from '@/lib/db/client';
import { loginAttempts, repairs, sessions, users, vehicles, type User } from '@/lib/db/schema';

/** Empties every table, children first. For a beforeEach. */
export async function resetDatabase(): Promise<void> {
  for (const table of [repairs, vehicles, sessions, loginAttempts, users]) await db.delete(table);
}

export const TEST_PASSWORD = 'test-password-1';

let count = 0;

/** A mechanic with TEST_PASSWORD and a unique email unless one is given. */
export async function createTestUser(overrides: { email?: string; firstName?: string } = {}): Promise<User> {
  count += 1;
  return createUser({
    email: overrides.email ?? `mechanic-${count}@example.test`,
    firstName: overrides.firstName ?? 'Στέφανος',
    lastName: 'Μιχελάκης',
    password: TEST_PASSWORD,
  });
}
