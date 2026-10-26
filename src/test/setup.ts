import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll } from 'vitest';

// Every test file gets its own empty database, a temporary file with the real
// migrations applied. Set before anything imports lib/env.ts, which reads it
// once; the imports below are dynamic for that reason.
const dir = mkdtempSync(join(tmpdir(), 'car-repair-test-'));
process.env.TURSO_DATABASE_URL = `file:${join(dir, 'test.db')}`;
delete process.env.TURSO_AUTH_TOKEN;

beforeAll(async () => {
  const { migrate } = await import('drizzle-orm/libsql/migrator');
  const { db } = await import('@/lib/db/client');
  await migrate(db, { migrationsFolder: 'drizzle' });
});

afterAll(async () => {
  const { db } = await import('@/lib/db/client');
  db.$client.close();
  rmSync(dir, { recursive: true, force: true });
});
