# Car Repair Management — v1 plan

A web app for an individual mechanic to keep each customer car's details and its full repair history.
Greek UI only. Laptop first; everything also works on a phone, where the main use is checking what was
done on a car.

Design: [Car Repair App canvas](https://claude.ai/code/artifact/09ffad2d-c749-4f0a-9374-01bad8f9a00f) —
five screens: Login, Vehicles (list + search), New vehicle, Vehicle page, New repair.

## Decisions

| Area             | Choice                                                         | Why                                                                                                |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Framework        | Next.js 16, App Router                                         | One codebase; Server Components read data, Server Actions write it. No `app/api`, no Express.      |
| Architecture     | Feature-based (`features/`), shared `components/ui` + `layout` | Each feature keeps its components, actions, queries and rules together. See Project structure.     |
| Language         | TypeScript, strict                                             |                                                                                                    |
| Database         | SQLite via libSQL: local file in dev, Turso in production      | Right size for one mechanic's data; Turso is reached over HTTP, so it works from Vercel functions. |
| ORM / migrations | Drizzle ORM + drizzle-kit, SQL migrations committed            | First-class Turso support; schema ports to Postgres if ever needed.                                |
| Passwords        | `bcryptjs`, cost 12                                            | Familiar; pure JS so nothing native to build on Vercel. Passwords over 72 bytes are rejected.      |
| Sessions         | Database sessions in an `httpOnly` cookie                      | Revocable (logout really ends it), unlike a JWT.                                                   |
| Rich text        | Tiptap 3 (StarterKit), stored as JSON, rendered on the server  | Only allowed nodes can ever render, so no HTML sanitising and no XSS from stored notes.            |
| Validation       | Zod 4, on the server in every action                           |                                                                                                    |
| Styling          | Tailwind CSS v4, design colours as `@theme` tokens             | Same setup as the portfolio.                                                                       |
| Icons            | `lucide-react`                                                 | The design's icons are Lucide (wrench, log-out, search, plus, pencil, trash).                      |
| Fonts            | Commissioner + Roboto Mono via `next/font`, `latin` + `greek`  | Without the Greek subset, Greek text falls back to another font.                                   |
| Tests            | Vitest (logic, auth, data) + one Playwright end-to-end flow    |                                                                                                    |
| Hosting (later)  | Vercel (app) + Turso (database), in matching EU regions        | Not set up in v1; nothing in v1 may need a writable disk at runtime.                               |
| Package manager  | pnpm                                                           |                                                                                                    |

## Scope

### In v1

The five designed screens, plus what the design implies but doesn't draw:

- **Login by email** — the design's "Όνομα χρήστη" field becomes "Email" (`type="email"`). A generic
  error for a wrong email or password, and a message when locked out by rate limiting.
- **Header** shows the mechanic's first and last name (e.g. "Στέφανος Μιχελάκης") where the design has
  `[ΟΝΟΜΑ ΣΥΝΕΡΓΕΙΟΥ]`.
- **Edit vehicle** — the New vehicle form, prefilled, titled "Επεξεργασία οχήματος".
- **Delete vehicle** — on the Edit vehicle page, below the form. Opens a confirmation dialog that names the
  car and says how many repairs are deleted with it.
- **Edit repair** — the New repair form, prefilled.
- **Delete repair** — the bin icon on a repair card opens a confirmation dialog.
- **Mileage on repairs** — an optional "Χιλιόμετρα" field next to the date, shown on the repair card as
  `124.500 km` (Greek grouping) when present.
- **Search covers brand, model, plate and owner** (the design searches brand and model only), and the
  matching parts of each card are highlighted. See Search.
- **States the design doesn't show:** no vehicles yet, inline form errors (red border + message under the
  field), duplicate VIN / plate, vehicle not found, pending buttons while saving.

### Not in v1

Registration, password-reset UI (done with a script), a customers table, costs or invoicing, photos,
dark mode, other languages, any UI for managing several mechanics (the schema already supports them).

## Data model

All IDs are random UUIDs (`crypto.randomUUID()`), so URLs don't reveal counts. Timestamps are stored as
integers (Unix ms).

```
users
  id              text  pk
  email           text  not null unique        -- trimmed + lowercased
  first_name      text  not null
  last_name       text  not null
  password_hash   text  not null
  created_at      int   not null

sessions
  id              text  pk                     -- SHA-256 of the cookie token, never the token itself
  user_id         text  not null → users.id  (on delete cascade)
  expires_at      int   not null
  created_at      int   not null
  index (user_id)

login_attempts                                 -- failed logins only, for rate limiting
  id              int   pk autoincrement
  email           text  not null
  ip              text  not null
  attempted_at    int   not null
  index (email, attempted_at), index (ip, attempted_at)

vehicles
  id              text  pk
  mechanic_id     text  not null → users.id  (on delete restrict)
  vin             text  not null               -- normalised, 17 chars
  plate           text  not null               -- display form, e.g. "ΙΚΥ 4521"
  plate_key       text  not null               -- comparison form, e.g. "ΙΚΥ4521"
  brand           text  not null
  model           text  not null
  displacement    text  not null               -- litres, normalised "1.6"
  engine_name     text  not null               -- "TDI"
  fuel            text  not null               -- 'diesel' | 'petrol'
  owner_name      text  not null
  created_at      int   not null
  updated_at      int   not null
  unique (mechanic_id, vin), unique (mechanic_id, plate_key)

repairs
  id              text  pk
  vehicle_id      text  not null → vehicles.id  (on delete cascade)
  performed_on    text  not null               -- 'YYYY-MM-DD'
  mileage_km      int   null
  notes           text  not null               -- Tiptap JSON
  created_at      int   not null
  updated_at      int   not null
  index (vehicle_id, performed_on)
```

VIN and plate are unique **per mechanic**, so two mechanics can both service the same car.

### Normalisation rules

- **Plate:** uppercase; remove spaces and dashes; map Latin lookalike letters to Greek
  (`A B E Z H I K M N O P T Y X` → `Α Β Ε Ζ Η Ι Κ Μ Ν Ο Ρ Τ Υ Χ`). That gives `plate_key`. If it matches the
  standard `ΑΑΑ0000` pattern, display it as `ΑΑΑ 0000`; otherwise display it as typed, uppercased.
  Plates typed on a Greek or a Latin keyboard then count as the same plate.
- **VIN:** uppercase; remove spaces; map Greek lookalike letters to Latin; must be exactly 17 characters
  from `A–H J–N P R–Z 0–9` (VINs never contain I, O or Q).
- **Displacement:** comma → dot; a number from 0.5 to 9.9 with at most one decimal.
- **Mileage:** digits only (dots and spaces ignored as typed separators); 0–2,000,000.
- **Email:** trim + lowercase.

## Authentication

- **Login** (Server Action): validate with Zod → look up the user by email → `bcrypt.compare`. When no user
  matches, compare against a dummy hash anyway so the response time doesn't reveal which emails exist.
  The same error ("Λάθος email ή κωδικός") either way.
- **Rate limit:** at most 5 failed attempts per email and 20 per IP in 15 minutes, counted in
  `login_attempts` (Vercel runs several instances, so memory can't hold the count). A successful login
  clears that email's failures; old rows are deleted as part of normal writes.
- **Session:** 32 random bytes, base64url, set as the `session` cookie (`httpOnly`, `Secure` in production,
  `SameSite=Lax`, `path=/`). The database stores only its SHA-256. Sessions last 30 days and are renewed to
  30 days when used with less than 15 days left. The database decides when a session ends; the cookie itself
  is kept for 400 days (the browser maximum), so renewing a session never needs a new cookie, which a page
  render couldn't set.
- **Checks:** `getCurrentUser()` / `requireUser()` (cached per request with React `cache()`) is called by
  the header's name (inside `<Suspense>`) **and** by every query and Server Action. It calls `connection()`
  before checking the session, because Next would otherwise try to prerender it per session for prefetching,
  and a session check reads the clock and may renew. `proxy.ts` only redirects visitors with no session
  cookie to `/login`, so they never get a page that would redirect anyway; it is never the only check. A
  stale cookie gets past it and is redirected by `requireUser()` instead. The login page sends a
  signed-in mechanic on to `/vehicles` itself: done in `proxy.ts`, a stale cookie would bounce between the
  two pages.
- **Logout** is a `<form>` with a POST action, not a link: Next prefetches links, and a GET logout would
  log people out on hover. It deletes the session row and the cookie.
- **Access control:** every data function takes the mechanic's id and filters by it (repairs through their
  vehicle). A vehicle or repair that doesn't exist and one that belongs to someone else both give a 404.
- **User scripts** (run with `tsx` against the database in `.env.local`, or one set in the shell, which wins;
  passwords asked for and typed hidden, never passed as arguments; piped input works too, one answer per
  line):
  - `pnpm user:add` — email, first name, last name, password (at least 10 characters, at most 72 bytes).
  - `pnpm user:set-password` — email, new password; also deletes that user's sessions.

## Routes

```
/login                                    Login
/                                         → redirects to /vehicles
/vehicles                                 Vehicle list + search   (?q= keeps the search in the URL)
/vehicles/new                             New vehicle
/vehicles/[id]                            Vehicle page + repair history
/vehicles/[id]/edit                       Edit vehicle + delete vehicle
/vehicles/[id]/repairs/new                New repair
/vehicles/[id]/repairs/[repairId]/edit    Edit repair
```

## Search

The vehicle list page loads all of the mechanic's vehicles in one query (with each one's repair count from
a single grouped join, not one query per car) and filters them in the browser as the mechanic types. The
list is ordered by most recent activity: the latest repair's date, or the day the car was added if it has
none.

**Why in the browser:** at 200 cars the list is roughly 40 KB of JSON before compression, and filtering it
takes well under a millisecond per keystroke, so there is no debounce and no server round trip. Even
5,000 cars stays comfortable. It would only need rethinking at tens of thousands, which one mechanic
won't reach. It also avoids SQLite's `LIKE`, which only ignores case for ASCII letters, not Greek.

**Fields:** brand, model, plate, owner. Not the VIN: it isn't shown on the card, so a match there couldn't
be highlighted. The hint under the field becomes "Ψάχνει σε μάρκα, μοντέλο, πινακίδα και ιδιοκτήτη." and
the placeholder "π.χ. Golf, ΙΚΥ 4521 ή Παπαδόπουλος".

**Matching** (`features/vehicles/utils/search.ts`, pure functions):

- The query is split into words; **every word must match at least one field** ("golf παπαδ" finds the Golf
  owned by Παπαδόπουλος).
- Both the query and the fields are **folded** the same way before comparing: NFD with accents removed,
  lowercased, final `ς` → `σ`, and Greek/Latin lookalike letters mapped to one form. So "γιωργος" matches
  "Γιώργος", and "iky" typed on a Latin keyboard matches the Greek plate "ΙΚΥ".
- On the plate, spaces and dashes are ignored, so "iky4521" matches "ΙΚΥ 4521".
- Folding builds an **index map** from each folded character back to its position in the original text.
  A match found in the folded text becomes a range in the original, which is what gets highlighted. Accents
  and ignored spaces can't shift the highlight off by a character.
- Folded fields are computed once per vehicle (`useMemo`), not on every keystroke.

**Highlighting** — `components/ui/Highlight.tsx` takes the text and the ranges and wraps the matched parts in
`<mark>` (overlapping ranges merged). It is the web version of the notes app's `HighlightedText`, but
driven by ranges rather than a regex built from the query, so a query like "1.6" needs no escaping.
Matches are highlighted in all four fields on the card, the plate badge included.

**URL:** the query is kept in `?q=` with `window.history.replaceState`. Next keeps `useSearchParams` in sync
with it without refetching the page, and back/refresh restore the search. The server reads `q` too, so the
first render is already filtered.

## Forms

Two Next 16 / React 19 behaviours shape the vehicle and repair forms:

- **Pages stay mounted after you leave them** (Cache Components keeps them hidden, with their state). So a
  successful save returns the new id instead of redirecting from the server; the form resets itself and
  then navigates. Otherwise "Νέο όχημα" would reopen showing the previous car. The edit form is keyed by
  the vehicle's `updatedAt`, so after a save it starts from the saved values.
- **React resets a `<form action={…}>` after every submission.** Controlled text inputs survive that, but
  controlled radios (the fuel choice) end up unchecked while their state still says diesel or petrol. The
  vehicle form therefore submits through `onSubmit` + `startTransition` instead of `action`. The login
  form keeps `action`: it is uncontrolled, and clearing the password after a failed attempt is wanted.

Server-side errors appear under their fields, and the cursor moves to the first field with an error.

**Ids are unique per instance.** The hidden pages stay in the document, so a fixed `id` (a field's, a
heading's) can appear twice, and a visible label could point at a hidden copy. Components use `useId()`;
async server components, which can't, build ids from the car's id (`history-title-<vehicleId>`). Only
`<main id="main">` repeats, and the skip link looks for the visible `<main>` itself.

**When a save can't reach the server** (no signal in the garage), the form or dialog says so ("Δεν
αποθηκεύτηκε / Δεν διαγράφηκε. Ελέγξτε τη σύνδεση…") and keeps what was typed. Pages that fail to load
show `error.tsx`, inside the app with the header and a "Δοκιμάστε ξανά" button.

## Project structure

Feature-based. `app/` holds routes only: each `page.tsx` is thin, checks the session and composes feature
components. Each feature owns its UI, Server Actions, queries and rules. `components/` holds what is shared
by several features and knows nothing about vehicles or repairs.

```
src/
  app/                                  routes only
    layout.tsx                          <html lang="el">, fonts, globals.css
    globals.css                         Tailwind + design tokens
    not-found.tsx
    (auth)/login/page.tsx
    (app)/layout.tsx                    AppHeader + session check
    (app)/vehicles/page.tsx
    (app)/vehicles/new/page.tsx
    (app)/vehicles/[id]/page.tsx
    (app)/vehicles/[id]/edit/page.tsx
    (app)/vehicles/[id]/repairs/new/page.tsx
    (app)/vehicles/[id]/repairs/[repairId]/edit/page.tsx
  proxy.ts

  components/
    ui/                                 generic building blocks, no domain knowledge
      Button.tsx  ButtonLink.tsx  IconButton.tsx
      TextField.tsx                     label + input + hint / error
      SegmentedControl.tsx              the fuel picker's radio-button style
      Dialog.tsx  ConfirmDialog.tsx     native <dialog>, ported from the portfolio
      Badge.tsx  EmptyState.tsx  Highlight.tsx
    layout/                             page chrome
      AppHeader.tsx                     logo, mechanic's name, nav, logout
      PageContainer.tsx                 max width + padding
      PageHeader.tsx                    back link / breadcrumb, title, subtitle, actions
      FormCard.tsx                      white card with the grey action footer

  features/
    auth/
      components/LoginForm.tsx  components/LogoutButton.tsx
      actions.ts                        login, logout ('use server')
      session.ts  password.ts  rate-limit.ts  current-user.ts
      validation.ts
    vehicles/
      components/
        Vehicles.tsx                    loads the list (server) + its loading fallback
        VehicleList.tsx                 title, search, results, empty states (client)
        VehicleCard.tsx  PlateBadge.tsx  FuelBadge.tsx
        VehicleForm.tsx  CardPreview.tsx
        VehicleSummary.tsx  VehicleDetails.tsx  VehicleFallbacks.tsx
        DeleteVehicleSection.tsx
      actions.ts                        Server Actions: parse the form, call a mutation
      queries.ts  mutations.ts          server-only reads and writes, mechanic from requireUser()
      validation.ts  labels.ts          Zod schema; Greek labels and display helpers
      utils/plate.ts  utils/vin.ts  utils/displacement.ts  utils/search.ts
    repairs/
      components/
        RepairEditor.tsx  EditorToolbar.tsx   Tiptap (client)
        RepairNotes.tsx                 static render of the stored JSON (server)
        RepairList.tsx  RepairCard.tsx  DateBlock.tsx
        RepairForm.tsx  DeleteRepairDialog.tsx
      actions.ts  queries.ts  mutations.ts  validation.ts
      utils/mileage.ts

  lib/                                  infrastructure shared by features
    db/schema.ts  db/client.ts
    env.ts                              validated environment variables
    text.ts                             folding + index map (used by search)
    date.ts                             Athens "today", el-GR formatting

scripts/  user-add.ts  user-set-password.ts  seed.ts
drizzle/  migrations
e2e/      Playwright
```

**Rules**

- `components/` never imports from `features/`.
- Features import from `components/` and `lib/`. The only feature-to-feature import is `repairs → vehicles`
  (the repair form shows the vehicle's plate and name). Pages that need both, like the vehicle page,
  compose them in `app/`.
- `queries.ts` files start with `import 'server-only'`. Each exported query gets the mechanic from
  `requireUser()` itself rather than taking an id, so no caller can ask for another mechanic's data (the
  Data Access Layer pattern from the Next.js docs). Tests stand in for `requireUser()`.
- A server component never imports a value from a `'use client'` file: it gets a client reference, not
  the value. Shared class names live in plain modules (`components/layout/navStyles.ts`).
- No barrel `index.ts` files: they mix server-only and client code in one import and make Next bundle more
  than a page needs.
- The schema stays in one file (`lib/db/schema.ts`): tables reference each other and drizzle-kit
  migrations read one schema.
- Unit tests sit next to the code they test (`plate.test.ts` beside `plate.ts`).

## Design implementation

### Tokens (from the design)

| Token          | Value     | Used for                                  |
| -------------- | --------- | ----------------------------------------- |
| `ground`       | `#F3F4F6` | page background, current-nav background   |
| `surface`      | `#FFFFFF` | cards, inputs, header                     |
| `surface-2`    | `#F9FAFB` | form footers, editor toolbar, card strips |
| `line`         | `#E5E7EB` | card borders                              |
| `line-soft`    | `#EEF0F3` | dividers inside cards                     |
| `field`        | `#D1D5DB` | input and secondary-button borders        |
| `fg`           | `#16181D` | text, logo tile                           |
| `fg-2`         | `#374151` | secondary text                            |
| `muted`        | `#5B6270` | hints, labels, meta                       |
| `placeholder`  | `#8A909C` | placeholders                              |
| `accent`       | `#1D4ED8` | primary buttons, links, focus rings       |
| `accent-hover` | `#1E3A8A` | hover on accent                           |
| `accent-soft`  | `#EAF0FD` | latest repair's date block, petrol badge  |
| `diesel`       | `#1F2937` | diesel badge                              |
| `danger`       | `#B91C1C` | required marks, errors, delete            |
| `danger-soft`  | `#FEF2F2` | delete hover                              |
| `highlight`    | `#FDE68A` | search matches (new; not in the design)   |

Radii: 14px cards, 10px inputs and buttons, 8px nav and icon buttons, 5px plate. Heights: 48px inputs,
46px buttons, 44px icon buttons (touch targets), 40px nav items. Content width 1280px (forms 920px).

### Phone layout (below 768px)

- Header: name stays; logout becomes an icon button with an `aria-label`.
- Vehicle list: one card per row; search full width.
- New / Edit vehicle: the card preview is hidden; fields stack.
- Vehicle page: the summary stacks, then history, then the details panel.
- Repair card: date block and notes side by side; edit and delete move under the notes.
- Editor toolbar wraps; its buttons stay 44px.

### Dates

Stored as `YYYY-MM-DD`. "Today" for a new repair is computed in `Europe/Athens`, not on the server's UTC
clock. Displayed with `el-GR` (date block: day, short month, year). The newest repair gets the blue date
block, as in the design.

## Environments

| Environment        | Database                                         |
| ------------------ | ------------------------------------------------ |
| Local dev          | `file:./local.db`, seeded with the design's cars |
| Tests (Vitest)     | in-memory libSQL, migrations applied per run     |
| Tests (Playwright) | `file:./e2e.db`, reset before each run           |
| Vercel previews    | separate Turso database (never production)       |
| Production         | Turso                                            |

Env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (empty for local files). `.env.example` is committed and
copied to `.env.local` for development; other `.env*` files are not committed. drizzle-kit and the scripts
load the same files Next.js does (`@next/env`).

**Foreign keys** are enforced by the local libSQL client (checked: a repair for a missing vehicle is refused,
deleting a vehicle cascades to its repairs). Turso isn't verified yet, so deleting a vehicle also deletes its
repairs explicitly, in the same batch, instead of relying on the cascade alone. Check `PRAGMA foreign_keys` on
Turso when hosting is set up.

## Tests

**Vitest**

- Plate, VIN, displacement and mileage normalisation.
- Search: every word must match; accents, case, final sigma and Greek/Latin plate letters ignored;
  highlight ranges land on the right characters in the original text, including across accents and the
  plate's space.
- Zod schemas: required fields, limits, error messages.
- Passwords: hash and verify; over 72 bytes rejected.
- Sessions: create, validate, expire, renew, delete; only the hash is stored.
- Rate limit: locks after 5 failures per email and 20 per IP; a success clears the email's failures.
- Data access: mechanic A can't read, edit or delete mechanic B's vehicles or repairs; deleting a vehicle
  deletes its repairs; duplicate VIN / plate per mechanic is refused, across mechanics allowed; a repair
  can't be reached through the wrong car.
- Repair notes: the server checks the editor's JSON against the editor's own schema (`getSchema` of the
  same extensions): headings, images, links (`javascript:` included) and broken structure are refused,
  unknown attributes dropped, the editor's trailing empty paragraph removed. Rendered to React elements,
  never HTML, with text escaped.
- Dates: "today" in Athens, also between midnight there and midnight UTC; the date never shifts on display.

**Playwright** (against a production build, on port 3100 with its own `e2e.db`), on a laptop-sized and a
phone-sized Chromium:

- Log in → add a vehicle (VIN in lowercase, plate in Latin letters, displacement with a comma) → find it
  from the list by its plate in Latin letters, highlighted → add a repair with mileage and bold text → see
  it on the vehicle page → log out → `/vehicles` redirects to login.

A GitHub Actions workflow runs lint, typecheck, the Prettier check, Vitest, the build and Playwright on
every push to `main` and every pull request.

## Milestones

Each one ends working and checked in the browser before the next starts. All seven are done (October 2026);
hosting is next.

1. **Scaffold** — Next.js, TypeScript, Tailwind tokens, fonts, ESLint/Prettier, the folder structure;
   `components/ui` primitives and `components/layout` (AppHeader, PageContainer, PageHeader, FormCard).
2. **Database** — schema, migrations, client, seed with the design's sample data, user scripts.
3. **Auth** — login page, sessions, rate limit, logout, `proxy.ts`, protected layout; unit tests.
4. **Vehicles** — list + search with highlights, new, vehicle page, edit, delete; normalisation, search
   and data-access tests.
5. **Repairs** — Tiptap editor, new / edit / delete, notes rendered on the vehicle page, mileage.
6. **Polish** — empty and error states, not-found, phone layout, keyboard and screen-reader pass.
7. **End-to-end + CI** — the Playwright flow and the GitHub Actions workflow.

Hosting (Vercel + Turso setup, regions, production migrations, creating the first real user) comes after v1.
