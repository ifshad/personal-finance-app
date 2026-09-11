# Personal Finance App

A mobile-first, multi-user personal finance platform — accounts, transactions, transfers, budgets, and financial insights — built to replace a personal Google Sheet with a real, financially-correct application.

---

## 1. Why this exists

I was tracking rent, utilities, bike fuel, family expenses, and savings in a Google Sheet — useful, but rigid: no real balances, no cross-month trends, no enforcement of "don't double-count a transfer," and no way to answer "how much can I safely spend today?" without doing mental math.

This project rebuilds those same financial concepts (housing, transport, family, debt, savings) as a proper transaction-first system with correct double-entry-style transfers, per-user data isolation, and real-time dashboards — while deliberately staying scoped as an MVP rather than growing into a speculative feature pile.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, route handlers as the API layer) |
| Language | TypeScript (strict) |
| Database | MySQL 8 |
| Query builder | Knex.js — no ORM, raw SQL control with query-builder ergonomics |
| Auth | JWT (via `jose`), httpOnly cookies, bcrypt password hashing |
| Styling / UI | Tailwind CSS + shadcn/ui (Radix-based primitives) |
| Forms | react-hook-form + Zod schema validation |
| Charts | Recharts |
| Process management | PM2 (`ecosystem.config.js`) for production |
| Local infra | Docker Compose (MySQL) |

No ORM was introduced — schema evolves through versioned Knex migrations, and all queries go through a thin repository layer, keeping SQL explicit and auditable.

## 3. Architecture

Strict layering, one direction of dependency, so financial logic never leaks into the UI and route handlers never touch SQL directly:

```
src/app/api/**/route.ts      → HTTP layer: auth check, input parsing, calls one service
src/server/services/         → business/financial logic (pure where possible, unit-testable)
src/server/repositories/     → one file per table, Knex query builder only
src/server/db/client.ts      → single Knex connection instance
src/server/auth/             → JWT sign/verify, password hashing, session/cookie helpers
src/lib/validation/          → Zod schemas shared by API routes and client forms
src/components/              → presentation only — no business logic
db/migrations/               → schema history (Knex, timestamped, reversible)
```

Every request follows the same path: **route → `requireUser()` → validate with Zod → service → repository → MySQL.** Route handlers never query the database directly, and services never trust anything the client sent about *who* the user is.

### Auth flow

```
requireUser(request)
  → read httpOnly cookie
  → verify JWT signature/expiry (jose)
  → return { userId, email, role }
```

`userId` from this verified context — never a client-supplied field — is the *only* value ever used to scope a query. This one function is the sole source of "who is asking" for every protected route in the app.

## 4. Multi-tenant data isolation

The single hardest non-negotiable requirement: **user A must never read, modify, or aggregate user B's data** — not accounts, categories, transactions, budgets, or reports.

Every repository function takes `userId` as a required parameter and folds it into the `WHERE` clause — there is no code path that fetches a financial row by ID alone:

```ts
async function requireOwnedAccount(userId: number, accountId: number): Promise<AccountRow> {
  const account = await findAccountByIdForUser(accountId, userId); // userId in WHERE
  if (!account) throw ApiError.validation("Account not found");
  return account;
}
```

Nested ownership is checked too — e.g. adding a budget item validates that *both* the budget and the category belong to the authenticated user before the insert happens, not just the top-level resource.

## 5. Financial domain model

Transaction-first design: **transactions are the source of truth; budgets are plans compared against them — never the other way around.**

### Three transaction types, one table, enforced at two layers

| Type | Effect |
|---|---|
| `INCOME` | increases an account balance |
| `EXPENSE` | decreases an account balance |
| `TRANSFER` | moves money between two of the user's own accounts — **not** income, **not** expense, never double-counted in reports |

The service layer validates the shape per type (income/expense need `account_id` + `category_id`; transfers need `from_account_id`/`to_account_id` and nothing else). The database repeats the same invariant as a `CHECK` constraint, as defense in depth:

```sql
CHECK (
  (type IN ('INCOME','EXPENSE')
    AND account_id IS NOT NULL AND category_id IS NOT NULL
    AND from_account_id IS NULL AND to_account_id IS NULL)
  OR
  (type = 'TRANSFER'
    AND account_id IS NULL AND category_id IS NULL
    AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL
    AND from_account_id <> to_account_id)
)
```

Even a bug that bypassed application-level validation could not write a structurally invalid transaction.

### Exact decimal money — no floating point, anywhere

MySQL returns `DECIMAL` columns as strings via `mysql2`. Rather than parsing those into JS `number` (and reintroducing float error into balances), every financial calculation goes through a single `Money` value object backed by `BigInt` minor units (cents):

```ts
export class Money {
  private readonly minorUnits: bigint;
  static fromDecimalString(value: string): Money { /* "123.45" → 12345n */ }
  add(other: Money): Money { return new Money(this.minorUnits + other.minorUnits); }
  toDecimalString(): string { /* 12345n → "123.45" */ }
}
```

Balances, budget variance, savings, and safe-to-spend all compose from this one class — arithmetic bugs from `0.1 + 0.2`-style float error are structurally impossible.

### Safe-to-spend — one formula, one place

> `(total balance − remaining committed budget) / days remaining in period`, floored at zero

Implemented once as a pure, unit-testable function (`calculateSafeToSpend`) and called by the dashboard — never re-derived inline in a component, so the number can't drift between screens.

### Historical integrity

- Categories and accounts are **deactivated**, never hard-deleted, once they're referenced by a transaction (`is_active` flag; foreign keys use `RESTRICT`, not `CASCADE`, for these references).
- Editing a transaction that references an inactive account/category is still allowed *without changing it* — but switching to a *different* account/category requires it to be active. This preserves old records while keeping new entry clean.
- Changing a budget never rewrites past transactions; actuals are always computed live from real transaction data for that period.

## 6. Database design

MySQL, 8 tables, all schema changes via Knex migrations:

```
roles ──< users ──< user_profiles
              │
              ├──< accounts ──┐
              ├──< categories │  (self-referential parent_id for subcategories)
              ├──< transactions  (account_id/category_id OR from/to_account_id, per type)
              └──< budgets ──< budget_items >── categories
```

Highlights:
- `DECIMAL(15,2)` for every monetary column — never float.
- Composite indexes matched to real query patterns: `(user_id, transaction_date)`, `(user_id, type, transaction_date)`, `(user_id, category_id, transaction_date)`, etc., so dashboard/report aggregation stays index-backed as transaction volume grows.
- `CHECK` constraints for non-negative balances, positive transaction amounts, valid budget period ordering, and the transaction type-shape rule above.
- One budget per exact `(user_id, period_start, period_end)` — prevents silently duplicate "monthly" budgets.

## 7. Feature set (MVP)

- **Auth** — registration, login, JWT sessions in httpOnly cookies, profile completion
- **Accounts** — Cash / Bank / Mobile Wallet / Card, opening balance, deactivation without losing history
- **Categories** — user-specific, optional subcategories, income/expense typed, active/inactive
- **Transactions** — income, expense, transfer; fast mobile-first entry sheet; filter by type/account/category/date; edit/delete with ownership + historical-integrity rules enforced
- **Budgets** — monthly planning per category, live actual-vs-planned, variance %, over-budget states that *inform* rather than block
- **Dashboard** — current balance, period income/expense/savings, safe-to-spend, budget progress, recent transactions, daily and category charts
- **Reports** — daily / weekly / monthly / half-yearly / yearly / custom, income & expense trends, category breakdown, savings rate, budget vs. actual
- **Theming** — sea-green visual identity in light and dark mode (no pure white surfaces anywhere), shadcn/ui throughout, mobile bottom-nav with a prominent "Add" action

Deliberately **not** built yet (documented as future scope, not silently dropped): admin panel, multi-currency, bank integrations/imports, recurring transactions, financial goals, notifications, receipt attachments.

## 8. Engineering practices

- **Validation everywhere** — every API input parsed through a Zod schema before it reaches a service; the same schemas back client-side form validation.
- **Consistent error handling** — a single `ApiError` type maps to structured HTTP responses (validation / auth / forbidden / not found / conflict); no raw SQL errors or stack traces ever reach the client.
- **Server-side aggregation** — reports and dashboards aggregate in SQL/service code, not by shipping full transaction history to the browser; transaction lists are paginated.
- **Small, verifiable phases** — built phase-by-phase (foundation → auth → accounts/categories → transactions → budgets → dashboard → reports → visual polish → hardening), each phase left in a fully working, type-checked, linted, and build-clean state before moving on.
- **Documentation-driven** — product requirements, financial model, database design, UI/UX spec, and implementation plan were all written as source-of-truth docs *before* implementation, so financial behavior (e.g. "how is a transfer different from an expense?") was decided deliberately rather than improvised in code.

## 9. Deployment

- Local dev: Docker Compose for MySQL + `next dev`.
- Production: `next build` + Knex migrations run explicitly on deploy, then PM2 (`ecosystem.config.js`) manages the `next start` process — PM2 handles process supervision only, never the build/migrate steps.
- Environment-driven config (DB credentials, JWT secret, cookie `secure` flag) — nothing sensitive committed to source control.

---

*Stack: Next.js · TypeScript · MySQL · Knex.js · Tailwind CSS · shadcn/ui · JWT*
