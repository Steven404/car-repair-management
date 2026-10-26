# Car Repair Management

A web app for an individual mechanic to keep each customer car's details and its repair history. Greek UI.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4. The full plan is in [docs/plan.md](docs/plan.md).

## Development

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000. The shared components are all on one page at http://localhost:3000/ui-kit
(development only).

| Script           | Does                                   |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Development server                     |
| `pnpm build`     | Production build                       |
| `pnpm lint`      | ESLint                                 |
| `pnpm typecheck` | Generates route types, then runs `tsc` |
| `pnpm format`    | Prettier, writing changes              |
