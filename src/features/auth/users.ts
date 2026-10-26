import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { sessions, users, type User } from '@/lib/db/schema';
import { hashPassword } from './password';

// Creating users and resetting passwords, for the scripts in `scripts/`: there
// is no sign-up or reset page. Errors are for the person running the script.

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.email, normalizeEmail(email)) });
}

interface NewUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export async function createUser(input: NewUser): Promise<User> {
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!z.email().safeParse(email).success) throw new Error(`"${input.email}" is not an email address.`);
  if (!firstName || !lastName) throw new Error('First and last name are both required.');
  if (await findUserByEmail(email)) throw new Error(`A user with the email ${email} already exists.`);

  const passwordHash = await hashPassword(input.password);
  const [user] = await db.insert(users).values({ email, firstName, lastName, passwordHash }).returning();
  return user;
}

/** Sets a new password and signs the user out everywhere. */
export async function setUserPassword(email: string, password: string): Promise<{ user: User; sessionsEnded: number }> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error(`No user with the email ${normalizeEmail(email)}.`);

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  const ended = await db.delete(sessions).where(eq(sessions.userId, user.id)).returning({ id: sessions.id });
  return { user, sessionsEnded: ended.length };
}
