import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

// The same .env files Next.js reads, so drizzle-kit targets the same database as the app
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: 'turso',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
});
