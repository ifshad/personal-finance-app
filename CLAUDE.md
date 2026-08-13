# Personal Finance App — AI Agent Instructions

## Project

Build a mobile-first, multi-user personal finance application for tracking income, expenses, account balances, budgets, transfers, and financial insights.

The application replaces a personal Google Sheet with a proper application while preserving the useful financial concepts from the existing sheet.

## Technology

- Next.js
- TypeScript
- MySQL
- Knex.js
- Tailwind CSS
- shadcn/ui
- JWT authentication
- Role-based authorization
- Mobile-first responsive design

Do not introduce another ORM or replace Knex.js unless explicitly requested.

## Source of Truth

Read the documentation in this order before implementing substantial functionality:

1. `docs/01-product-requirements.md`
2. `docs/02-financial-model.md`
3. `docs/03-database-design.md`
4. `docs/04-ui-ux-specification.md`
5. `docs/05-implementation-plan.md`

The implementation must follow these documents. If a requirement is unclear or contradictory, stop and ask rather than inventing financial behavior.

## Critical Rules

### User ownership

Every user-owned financial entity must be scoped to `user_id`.

Never allow one authenticated user to read, modify, delete, or aggregate another user's:

- accounts
- categories
- transactions
- budgets
- budget items
- financial settings
- reports derived from those records

Do not trust a client-supplied `user_id` for authorization. Derive the authenticated user from the JWT/session context.

### Financial integrity

- Income increases an account balance.
- Expense decreases an account balance.
- Transfer moves money between two accounts.
- Transfers are NOT income and NOT expenses.
- Never count the same transfer twice.
- Historical transactions must remain valid when categories/accounts are deactivated.
- Prefer deactivation/soft removal over destructive deletion for entities referenced by historical financial data.
- Do not silently alter historical financial records when a user changes a budget.

### UI

- Mobile-first.
- Sea-green visual identity with a lighter complementary tone.
- Dark theme uses the same visual family with darker surfaces.
- Do not use pure white as the UI/background color.
- Use shadcn/ui components consistently.
- Keep frequent actions, especially adding a transaction, extremely fast.

### Scope

This is an MVP.

Do not build an admin panel yet.
Do not add speculative features merely because they could be useful.
Future ideas should remain documented as future scope.

## Development Workflow

Implement in small, verifiable phases.

For each phase:

1. Read the relevant documentation.
2. Implement only that phase.
3. Run type checking/lint/tests/build where applicable.
4. Fix errors introduced by the phase.
5. Do not perform unrelated refactors.
6. Confirm the phase is stable before moving forward.

## Hard Rules

- Never touch git. Do not run `git add`, `git commit`, `git push`, or any other git command that changes repo state. Leave version control entirely to the user.
- Follow SOLID, DRY, and OOP principles. Keep code simple and readable — do not over-engineer or over-abstract.
- After implementing a module/phase, run the build (and type check/lint) and fix any resulting build errors before considering the phase done.

## Coding Principles

- Keep financial/business logic out of presentation components.
- Validate all API inputs.
- Use server-side authorization for every protected operation.
- Use database constraints and indexes to protect data integrity.
- Keep calculations deterministic and testable.
- Avoid hardcoded category IDs, role IDs, or account IDs.
- Avoid duplicated calculation logic across dashboard and reports.
- Centralize reusable financial calculations.
- Use migrations for database changes.
- Do not store secrets in source control.

## Expected Result

The finished MVP should let multiple registered users independently:

- authenticate
- complete a profile
- manage accounts
- manage categories/subcategories
- record income
- record expenses
- transfer money between accounts
- create and monitor budgets
- view current balances
- view monthly/yearly/half-yearly financial insights
- view charts and reports


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
