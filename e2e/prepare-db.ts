import { rmSync } from 'node:fs';
import { E2E_DATABASE_URL, E2E_MECHANIC } from './mechanic';

// Run by playwright.config.ts before it starts the server: a fresh e2e.db
// with the real migrations and one mechanic. Imports that read the
// environment are dynamic, so they see the URL set here.

async function main() {
  process.env.TURSO_DATABASE_URL = E2E_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;

  const file = E2E_DATABASE_URL.slice('file:'.length);
  for (const suffix of ['', '-journal', '-wal', '-shm']) rmSync(`${file}${suffix}`, { force: true });

  const { migrate } = await import('drizzle-orm/libsql/migrator');
  const { db } = await import('@/lib/db/client');
  const { createUser } = await import('@/features/auth/users');

  await migrate(db, { migrationsFolder: 'drizzle' });
  await createUser(E2E_MECHANIC);
  db.$client.close();
  console.log(`e2e database ready: ${E2E_DATABASE_URL}, ${E2E_MECHANIC.email}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
