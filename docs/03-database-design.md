# Database Design

## 1. Database

Database: MySQL

Database access/query builder: Knex.js

Use Knex migrations for schema evolution.

Use appropriate indexes for user-scoped queries and reporting.

## 2. Design Principles

- Every user-owned entity contains `user_id`.
- Foreign keys should preserve referential integrity.
- Financial history must not be destroyed casually.
- Use active/deactivated state for entities that need to disappear from new entry forms.
- Store monetary values using an exact decimal type, not floating point.
- Store timestamps consistently.
- Dates used for financial periods should be handled deliberately and consistently.

## 3. users

Suggested columns:

- id
- email
- password_hash
- role_id
- is_active
- created_at
- updated_at

Constraints:

- email unique
- role foreign key
- active state

## 4. roles

Suggested columns:

- id
- name
- created_at
- updated_at

Initial roles can include:

- USER
- ADMIN

The ADMIN role exists for future authorization needs; an admin UI is not part of MVP.

## 5. user_profiles

Suggested columns:

- id
- user_id
- first_name
- last_name
- display_name
- phone nullable
- avatar_url nullable
- currency
- timezone
- created_at
- updated_at

`user_id` should be unique.

The profile is separate from authentication credentials.

## 6. accounts

Suggested columns:

- id
- user_id
- name
- account_type
- opening_balance
- is_active
- created_at
- updated_at

Potential account types:

- CASH
- BANK
- MOBILE_WALLET
- CARD
- OTHER

The exact enum/storage strategy can be finalized during implementation.

Indexes:

- `(user_id, is_active)`
- `(user_id, account_type)`

## 7. categories

Suggested columns:

- id
- user_id
- parent_id nullable
- name
- type
- icon nullable
- is_active
- created_at
- updated_at

`type`:

- INCOME
- EXPENSE

`parent_id` points to another category belonging to the same user.

Indexes:

- `(user_id, type, is_active)`
- `(user_id, parent_id)`

A uniqueness rule should prevent confusing duplicate names within the same user/parent/type context.

## 8. transactions

Suggested columns:

- id
- user_id
- type
- amount
- account_id nullable for transfer-specific modeling
- from_account_id nullable
- to_account_id nullable
- category_id nullable
- description nullable
- transaction_date
- notes nullable
- created_at
- updated_at

Types:

- INCOME
- EXPENSE
- TRANSFER

Recommended rules:

### INCOME

- account_id required
- category_id required and must be INCOME
- from/to account fields null

### EXPENSE

- account_id required
- category_id required and must be EXPENSE
- from/to account fields null

### TRANSFER

- from_account_id required
- to_account_id required
- category_id null
- account_id null
- source != destination

The exact schema may use a cleaner transfer representation if implementation benefits from it, but the business invariants must remain unchanged.

Indexes:

- `(user_id, transaction_date)`
- `(user_id, type, transaction_date)`
- `(user_id, account_id, transaction_date)`
- `(user_id, category_id, transaction_date)`
- transfer account indexes where applicable

Amount must use a precise DECIMAL type.

## 9. budgets

Suggested columns:

- id
- user_id
- name nullable
- period_start
- period_end
- created_at
- updated_at

A budget represents a planning period.

For MVP, monthly budgets are the primary use case.

Indexes:

- `(user_id, period_start, period_end)`

## 10. budget_items

Suggested columns:

- id
- budget_id
- category_id
- planned_amount
- created_at
- updated_at

Rules:

- category must belong to the same user as the budget
- category should normally be EXPENSE type
- one category should not appear twice in the same budget

Unique constraint:

`(budget_id, category_id)`

## 11. Optional financial settings

If required during implementation, a user-scoped settings table may hold:

- default currency
- default account
- default budget behavior
- dashboard preferences

Do not create a table simply because it might be useful later.

## 12. Referential Integrity

Where historical data depends on a record:

- prefer RESTRICT or soft deactivation over cascading deletion

For example, deleting a category should not cascade-delete transactions.

Deactivation is preferred.

## 13. User Ownership Rules

Every query for these entities must include authenticated user scope:

- accounts
- categories
- transactions
- budgets
- budget_items
- profiles
- financial settings

For child records, ownership must be validated through the parent as well.

Example:

A user cannot submit another user's `budget_id` and create a budget item under it.

## 14. Money

Use `DECIMAL`, for example:

`DECIMAL(15,2)`

Do not use JavaScript floating point arithmetic for authoritative financial calculations.

Where calculations cross API boundaries, normalize decimal values deliberately.

## 15. Dates and Time

Store transaction dates separately from audit timestamps where useful.

- `transaction_date` represents the financial date selected by the user.
- `created_at` and `updated_at` represent system timestamps.

The user's timezone should be respected when determining dashboard/report periods.

## 16. Seed Data

On registration, create user-specific default financial data as appropriate:

- default categories
- default subcategories
- optionally a starter account if product UX requires it

Default records must belong to the newly created user.

Never reuse another user's category/account IDs.

## 17. Migrations

All schema changes must be made through Knex migrations.

Migrations should be:

- ordered
- reversible where practical
- tested against a clean database
- tested against an existing development database

Do not manually edit production schema as part of normal development.
