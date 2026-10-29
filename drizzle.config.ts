import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

// The same .env files `next dev` reads (never .env.production*), so drizzle-kit targets the dev database
loadEnvConfig(process.cwd(), true);

export default defineConfig({
  dialect: 'turso',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
});
