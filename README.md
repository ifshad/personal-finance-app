# Personal Finance App

Mobile-first, multi-user personal finance app — income, expenses, transfers,
budgets, and insights. Built with Next.js, TypeScript, MySQL, and Knex.js.

See `CLAUDE.md` and `docs/` for the full product/technical spec that drives
this implementation.

## Prerequisites

- Node.js 20+
- Docker Desktop (for local MySQL) — or your own MySQL 8 instance

## Setup

1. Copy the env template and adjust if needed:

   ```bash
   cp .env.example .env.local
   ```

2. Start MySQL (local dev container):

   ```bash
   docker compose up -d
   ```

3. Install dependencies and run migrations:

   ```bash
   npm install
   npm run db:migrate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript checks
- `npm run lint` — ESLint
- `npm run db:migrate` / `db:migrate:rollback` / `db:migrate:status`
- `npm run db:migrate:make -- <name>` — create a new migration
- `npm run db:seed` / `db:seed:make -- <name>`

## Project structure

```
db/migrations/       Knex migrations (schema)
src/app/              Next.js routes (pages + API route handlers)
src/components/       UI components (shadcn/ui primitives + feature components)
src/server/
  auth/               Password hashing, JWT signing/verification, session helpers
  db/                 Knex client singleton
  repositories/       Thin data-access layer (one file per table)
  services/           Business/financial logic, reusable across routes
src/lib/               Shared client+server utilities (env, api client/response, validation)
```

## Status

MVP complete per `docs/05-implementation-plan.md`. A new user can register, log
in, complete their profile, create accounts and categories, record income/
expense/transfers, create a monthly budget and track it against real spending,
and view the dashboard and reports (daily/monthly/half-yearly/yearly, with
charts) — all fully isolated per user, mobile-first with a light/dark sea-green
theme.

Not built (explicitly out of MVP scope per `docs/01-product-requirements.md` §8):
admin panel, multi-currency, bank integrations/imports, recurring transactions,
financial goals, notifications, receipts/attachments.
