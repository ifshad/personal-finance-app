# Financial Model

## 1. Fundamental Principle

The financial model is transaction-first.

A budget represents a user's plan.

A transaction represents what actually happened.

Never modify historical transactions simply to make a budget look correct.

## 2. Transaction Types

There are exactly three primary transaction types in the MVP:

### INCOME

Money enters the user's financial accounts.

Example:

`Salary -> Bank +45,000`

Income:

- increases the selected account balance
- contributes to income reports
- contributes to savings/net-change calculations

### EXPENSE

Money leaves one of the user's accounts.

Example:

`bKash -> Bike Fuel -500`

Expense:

- decreases the selected account balance
- contributes to expense reports
- contributes to budget actuals when category-linked

### TRANSFER

Money moves between two accounts owned by the same user.

Example:

`Bank -> bKash 5,000`

Transfer:

- decreases the source account
- increases the destination account
- does not increase income
- does not increase expense
- must not be counted twice in analytics

## 3. Accounts

An account represents a place where the user holds money.

Examples:

- Cash
- bKash
- Bank
- Credit/Debit Card where applicable

Each account has:

- user ownership
- name
- account type
- opening balance
- active/inactive state
- timestamps

Current balance is derived from the opening balance plus/minus relevant transactions.

Conceptually:

`Current Balance = Opening Balance + Income - Expense - Transfers Out + Transfers In`

## 4. Account Transfer

A transfer requires:

- source account
- destination account
- amount
- transaction date
- optional description/note

Source and destination must belong to the authenticated user.

Source and destination must not be the same account.

Example:

Initial:

- Bank = 30,000
- bKash = 5,000
- Cash = 2,000

Transfer:

- Bank -> bKash = 10,000

After:

- Bank = 20,000
- bKash = 15,000
- Cash = 2,000

Total remains 37,000.

## 5. Income

Income should be recorded as transactions rather than a special static user field.

Examples:

- Salary
- Freelance income
- Bonus
- Other income

Income categories should be type `INCOME`.

## 6. Expense

Expenses must have:

- account
- amount
- category
- date
- optional description/note

Expense categories should be type `EXPENSE`.

## 7. Categories

Categories are user-specific.

A category can optionally have a parent category.

Example:

`Transport`
- Bike Fuel
- Maintenance
- Parking
- Toll

`Family`
- Ammu
- Abbu
- Shila
- Shila Education
- Shila Shopping

Categories must support an `is_active` boolean.

Rules:

- active categories appear in new transaction forms
- inactive categories are hidden from new entry
- historical transactions retain their category reference
- reports continue to include historical transactions under inactive categories
- do not destructively delete a category that is referenced by transactions

Category type should distinguish income and expense categories.

## 8. Budget

A budget is a user's spending plan for a period, normally a calendar month.

A budget contains category-level planned amounts.

Example:

- Housing = 6,600
- Food = 3,000
- Transport = 4,000
- Shopping = 1,500

Actual category spending is calculated from expense transactions in that budget period.

Budget variance:

`Variance = Planned Amount - Actual Amount`

Positive variance means remaining planned amount.

Negative variance means over budget.

Budget overage does not block transactions.

## 9. Budget Flexibility

A user may overspend.

The application should show:

- planned
- actual
- remaining/variance
- percentage used
- over-budget state

Do not force the user to increase the budget just because spending exceeded it.

This allows the application to reveal real behavior over time.

## 10. Savings

Savings is not treated as an ordinary expense category.

Basic MVP savings can be calculated as:

`Savings = Total Income - Total Expenses`

For a period:

`Savings Rate = Savings / Total Income * 100`

Transfers between a user's own accounts do not affect savings.

If a future feature needs explicit savings goals or earmarking, that should be modeled separately.

## 11. Balance

There are two useful concepts:

### Account balance

The amount currently held in one account.

### Total balance

The sum of current balances of all active user accounts.

Transfers do not change total balance.

Income increases total balance.

Expenses decrease total balance.

## 12. Reporting Periods

The application should support:

- today
- current week
- current month
- previous month
- half-year
- year
- custom date range

For half-year reporting:

- H1 = January through June
- H2 = July through December

## 13. Dashboard Calculations

### Monthly income

Sum of INCOME transactions within the selected month.

### Monthly expense

Sum of EXPENSE transactions within the selected month.

### Monthly savings

`Monthly Income - Monthly Expense`

### Budget actual

Sum of expense transactions for the budget category within the budget period.

### Budget percentage

`Actual / Planned * 100`

Handle zero planned amount safely.

## 14. Safe-to-Spend

Safe-to-spend is an informational estimate, not an accounting balance.

A basic MVP version should consider:

- current total available balance
- remaining planned budget/committed spending
- remaining days in the period

The exact formula should be implemented in one reusable financial service/module and covered by tests.

Do not duplicate slightly different safe-to-spend calculations across dashboard components.

If required inputs are unavailable, show an explanatory fallback rather than a misleading number.

## 15. Recurring/Committed Expenses

The current spreadsheet includes recurring-style expenses such as rent, internet, service charge, etc.

MVP may represent these as normal budget items/transactions.

A fully automated recurring transaction engine can be future scope unless implementation is straightforward and explicitly approved.

## 16. Debt

Debt is a financial concept in the existing sheet.

For MVP, debt payments can be tracked as ordinary expense transactions under a Debt category.

Do not build a complex debt-accounting system yet.

## 17. Historical Integrity

Never rewrite historical financial records because:

- a category was renamed
- a category was deactivated
- a budget changed
- an account was deactivated

Historical records should remain reportable.

## 18. Ownership and Authorization

Every financial query must be constrained by authenticated `user_id`.

Never query a transaction/account/category/budget solely by its public ID without also enforcing ownership.

This rule applies to:

- read
- create
- update
- delete
- aggregate
- report
- dashboard calculations
