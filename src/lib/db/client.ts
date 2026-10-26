import { drizzle } from 'drizzle-orm/libsql';
import { env } from '@/lib/env';
import * as schema from './schema';

/**
 * The one database connection: a local SQLite file in development, Turso over
 * HTTP in production. Also used by the scripts in `scripts/`, so it must not
 * import 'server-only'.
 */
export const db = drizzle({
  connection: { url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN },
  schema,
});

export type Database = typeof db;
