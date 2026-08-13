# Implementation Plan

## 1. Implementation Goal

Build the MVP in small phases.

Do not attempt the entire application in one generation.

Each phase should leave the project in a runnable state.

## 2. Phase 0 — Project Foundation

Set up:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- project structure
- environment configuration
- MySQL connection
- Knex.js
- migration system
- basic error handling
- formatting/lint/type checking

Deliverable:

Application starts successfully and database connection/migration workflow works.

## 3. Phase 1 — Authentication and User Foundation

Implement:

- users table
- roles table
- user profiles
- registration
- password hashing
- login
- JWT creation/validation
- protected routes/API
- role-aware authorization
- logout/token invalidation strategy appropriate to the chosen JWT architecture
- profile completion/update

Tests:

- register
- login
- invalid credentials
- protected endpoint without auth
- protected endpoint with valid auth
- user ownership isolation

## 4. Phase 2 — Accounts and Categories

Implement:

- accounts schema/API/UI
- categories schema/API/UI
- subcategory hierarchy
- active/inactive behavior
- default user-specific category seeding
- account opening balance
- account deactivation

Tests:

- user A cannot access user B's account
- user A cannot access user B's category
- inactive categories cannot be selected for new transactions
- historical references remain valid

## 5. Phase 3 — Core Transactions

Implement:

- transaction schema
- income
- expense
- transfer
- validation
- balance calculations
- transaction list
- transaction detail/edit/delete
- mobile-first add transaction flow

Tests:

### Income

Income increases account balance and income reports.

### Expense

Expense decreases account balance and expense reports.

### Transfer

Transfer decreases source and increases destination.

Transfer does not affect total wealth, income, expense, or savings.

### Ownership

A user cannot manipulate another user's transactions or accounts.

## 6. Phase 4 — Budgets

Implement:

- budget schema
- monthly budget creation
- budget items
- category planned amounts
- actual spending calculation
- variance
- budget progress UI
- over-budget states

Tests:

- budget only includes the correct user
- actual spending is restricted to the budget period
- category totals are correct
- overspending does not block transactions
- transfer does not count toward expense budget

## 7. Phase 5 — Dashboard

Implement:

- current balance
- period income
- period expense
- savings/net change
- budget progress
- safe-to-spend calculation
- recent transactions
- daily expense chart
- daily income chart
- monthly income vs expense chart
- category expense chart

Centralize calculations in reusable server-side financial services.

Do not calculate financial totals independently inside each UI component.

## 8. Phase 6 — Reports and Analytics

Implement:

- period selector
- monthly reports
- yearly reports
- half-year reports
- custom period where practical
- expense trends
- income trends
- category breakdown
- savings
- savings rate
- budget vs actual

Ensure charts consume already validated/aggregated API data.

## 9. Phase 7 — UX and Visual Polish

Implement the final visual system:

- sea-green theme
- lighter complementary surfaces
- dark theme
- no pure white
- mobile bottom navigation
- responsive desktop layout
- loading states
- empty states
- error states
- form validation
- accessible controls
- consistent icons and spacing

## 10. Phase 8 — Hardening

Review:

### Security

- JWT validation
- password hashing
- authorization
- user ownership
- input validation
- SQL injection protection through Knex parameterization/query builder
- safe error responses
- secret management

### Financial correctness

- decimal handling
- transfer correctness
- account balance correctness
- budget correctness
- period boundary correctness
- timezone behavior

### UX

- mobile usability
- slow network behavior
- loading/error states
- form recovery
- destructive action confirmations

## 11. Testing Strategy

At minimum test the financial domain thoroughly.

### Unit tests

- balance calculation
- income calculation
- expense calculation
- transfer calculation
- budget actual
- budget variance
- savings
- savings rate
- safe-to-spend

### Integration/API tests

- authentication
- ownership isolation
- account CRUD
- category CRUD
- transaction CRUD
- transfer flow
- budget flow

### Important isolation test

Create two users.

Create records for both.

Verify user A can never retrieve, edit, delete, or aggregate user B's data.

## 12. API/Service Organization

Keep a clear separation between:

- route/controller layer
- authentication/authorization
- validation
- business/financial services
- database/query layer
- presentation/UI

The exact folder structure can follow the project's Next.js architecture, but financial calculations should have reusable service functions.

## 13. Error Handling

Return consistent API errors.

Examples:

- validation error
- authentication error
- authorization error
- not found
- conflict
- internal server error

Do not expose SQL/database implementation details to users.

## 14. Performance

Dashboard/report queries may aggregate large transaction sets.

Use:

- proper indexes
- user/date/category/account composite indexes
- server-side aggregation
- pagination for transaction lists
- avoid loading all historical transactions into the browser

Do not optimize prematurely with caching if correct indexed queries are sufficient.

## 15. Definition of Done

MVP is done when a new user can:

1. Register.
2. Log in.
3. Complete their profile.
4. Create or configure accounts.
5. Have/use user-specific categories.
6. Record income.
7. Record expenses.
8. Transfer money between Bank, bKash, Cash, etc.
9. See correct account balances.
10. Create a monthly budget.
11. See actual spending against the budget.
12. See over-budget categories without breaking the system.
13. View a useful dashboard.
14. View daily/monthly/yearly/half-yearly insights.
15. View charts.
16. View transaction history.
17. Manage accounts/categories.
18. Use the application comfortably on a mobile device.
19. Use dark and light themes within the defined sea-green design system.
20. Have complete isolation from every other user's financial data.

## 16. Implementation Discipline

Do not:

- build an admin panel during MVP
- invent unsupported financial rules
- replace the agreed tech stack
- add an ORM
- introduce unnecessary dependencies
- hardcode user-specific IDs
- mix users' data
- treat transfers as expenses
- use floating point for authoritative money calculations
- delete historical financial data because a category/account was deactivated
- implement future features before MVP is stable

When a requirement is unclear, ask for clarification before making a financial/business assumption.
