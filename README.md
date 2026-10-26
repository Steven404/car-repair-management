# Car Repair Management

A web app for an individual mechanic to keep each customer car's details and its repair history. Greek UI.

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

| Script                   | Does                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `pnpm dev`               | Development server                                                          |
| `pnpm build`             | Production build                                                            |
| `pnpm lint`              | ESLint                                                                      |
| `pnpm typecheck`         | Generates route types, then runs `tsc`                                      |
| `pnpm format`            | Prettier, writing changes                                                   |
| `pnpm db:generate`       | A migration from changes to `src/lib/db/schema.ts`                          |
| `pnpm db:migrate`        | Applies pending migrations                                                  |
| `pnpm db:studio`         | Drizzle Studio, to browse the database                                      |
| `pnpm db:seed`           | Empties the local database and fills it with sample data (local files only) |
| `pnpm user:add`          | Adds a mechanic                                                             |
| `pnpm user:set-password` | Sets a new password and signs that mechanic out everywhere                  |
