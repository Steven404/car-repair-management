# Car Repair Management

A web app for mechanics to keep each customer car's details and its repair history. Greek UI.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4. The full plan is in [docs/plan.md](docs/plan.md).

## Development

```bash
pnpm install
cp .env.example .env.local   # a local SQLite file, local.db
pnpm db:migrate              # creates the tables
pnpm db:seed                 # the design's sample cars; sign-in details are at the top of scripts/seed.ts
pnpm dev
```

Then open http://localhost:3000. The shared components are all on one page at http://localhost:3000/ui-kit
(development only).

There is no sign-up page. Mechanics are added from the command line, against the database in `.env.local`
or one set in the shell:

```bash
pnpm user:add
```

```bash
pnpm user:set-password
```

| Script                   | Does                                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm dev`               | Development server                                                       |
| `pnpm build`             | Production build                                                         |
| `pnpm lint`              | ESLint                                                                   |
| `pnpm test`              | Unit tests (Vitest), each file on its own temporary database             |
| `pnpm test:watch`        | The same, rerunning on changes                                           |
| `pnpm typecheck`         | Generates route types, then runs `tsc`                                   |
| `pnpm format`            | Prettier, writing changes                                                |
| `pnpm db:generate`       | A migration from changes to `src/lib/db/schema.ts`                       |
| `pnpm db:migrate`        | Applies pending migrations                                               |
| `pnpm db:studio`         | Drizzle Studio, to browse the database                                   |
| `pnpm db:seed`           | Empties the database and fills it with sample data (asks first on Turso) |
| `pnpm user:add`          | Adds a mechanic                                                          |
| `pnpm user:set-password` | Sets a new password and signs that mechanic out everywhere               |
| `pnpm test:e2e`          | End-to-end tests (Playwright) against the production build               |

## Dev deployment

The `dev` branch deploys to Vercel, on its own Turso database (never production). Set its URL and token in
the shell to migrate and seed it; the seed asks you to type the database's name before it deletes anything:

```bash
TURSO_DATABASE_URL="libsql://…" TURSO_AUTH_TOKEN="…" pnpm db:migrate
```

```bash
TURSO_DATABASE_URL="libsql://…" TURSO_AUTH_TOKEN="…" pnpm db:seed
```

## End-to-end tests

One flow, on a laptop-sized and a phone-sized Chromium: sign in, add a car, find it by its plate, add a
repair with mileage and bold text, sign out ([e2e/repair-flow.spec.ts](e2e/repair-flow.spec.ts)). It runs
against a production build on port 3100 with its own database, `e2e.db`, recreated each run with one test
mechanic, so it never touches the dev server or `local.db`.

```bash
pnpm exec playwright install chromium   # once
```

```bash
pnpm build && pnpm test:e2e
```

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every push to `main` and every pull request:
lint, typecheck, Prettier check, unit tests, production build, then the end-to-end tests. When something
fails, the Playwright report is kept as a download on the run for a week.
