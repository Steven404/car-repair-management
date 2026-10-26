import { loadEnvConfig } from '@next/env';

// Import this first in every script, before anything reads process.env. It
// loads the same .env files Next.js does; variables already set in the shell
// win, so `TURSO_DATABASE_URL=… pnpm user:add` targets another database.
loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });
