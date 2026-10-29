import { loadEnvConfig } from '@next/env';

// Import this first in every script, before anything reads process.env. It
// loads the same .env files `next dev` does (.env.development.local, .env.local,
// .env.development, .env), never the .env.production* ones, so a pulled production
// env file can't point a script at production. Variables already set in the shell
// win, so `TURSO_DATABASE_URL=… pnpm user:add` targets another database.
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });
