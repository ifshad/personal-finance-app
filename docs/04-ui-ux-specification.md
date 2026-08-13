# UI / UX Specification

## 1. Design Direction

The application is mobile-first.

It should feel like a modern personal finance mobile app, not a desktop spreadsheet squeezed into a phone.

Primary visual identity:

- sea green
- lighter complementary sea-green/tinted surfaces
- dark theme with deep/darker versions of the same palette
- no pure white UI/background

Avoid excessive visual clutter.

## 2. Navigation

Mobile-first bottom navigation:

- Home
- Budget
- Add
- Reports
- Me

The Add action should be visually prominent.

Desktop/tablet layouts can adapt to a sidebar/top navigation later while preserving the same information architecture.

## 3. Authentication Screens

### Register

Fields:

- name/profile basics as appropriate
- email
- password
- password confirmation

Show clear validation.

### Login

Fields:

- email
- password

Include useful error states without revealing sensitive authentication details.

### Profile Completion

After registration, let the user complete/update profile information and initial financial preferences.

## 4. Dashboard

Dashboard is the primary daily-use screen.

### Header

Show:

- current period/month
- greeting
- user display name

### Financial summary

Show:

- total current balance
- income for selected period
- expense for selected period
- savings/net change

### Safe-to-spend

Prominent card showing an estimated safe daily spending amount.

Clearly distinguish this estimate from actual account balance.

### Budget progress

Show:

- total planned
- total actual
- percentage used
- remaining/over budget

### Recent transactions

Show a compact list.

Each item should show:

- category/icon
- description
- date/time
- amount
- income/expense visual treatment
- account where useful

### Charts

Dashboard should support:

1. Daily expense
2. Daily income
3. Monthly income vs expense
4. Expense by category

Charts must remain readable on small screens.

## 5. Add Transaction

This is one of the most important screens.

The user should be able to create an ordinary transaction quickly.

Start with a clear type selection:

- Expense
- Income
- Transfer

### Expense fields

- amount
- category
- account
- date
- description
- note optional

### Income fields

- amount
- income category
- account
- date
- description
- note optional

### Transfer fields

- amount
- from account
- to account
- date
- description
- note optional

For transfer, do not show expense/income category.

Prevent selecting the same account as both source and destination.

## 6. Transactions Screen

Chronological list with grouping by date.

Provide:

- search where useful
- date filtering
- type filtering
- category filtering
- account filtering
- amount display

Tap an item to:

- view details
- edit
- delete, subject to historical integrity rules

Use confirmation for destructive operations.

## 7. Budget Screen

Allow user to:

- select period
- create budget
- add category planned amounts
- edit planned amounts
- view actual spending
- view variance
- see over-budget categories

Example:

`Food — Planned 3,000 / Actual 3,450 / -450`

Do not block spending because of budget overage.

## 8. Reports Screen

Provide a period selector:

- Week
- Month
- Half-year
- Year
- Custom

Show:

### Summary

- income
- expense
- savings
- savings rate
- net change

### Expense analysis

- category distribution
- trend
- average daily spending
- highest spending category
- highest spending day

### Income analysis

- income trend
- income category/source breakdown

### Budget analysis

- planned vs actual
- category variance

## 9. Accounts Screen

Show account cards/list:

- account name
- type
- current balance
- active/inactive state

Allow:

- create
- edit
- deactivate
- view account transactions

Do not allow account deactivation to erase history.

## 10. Categories Screen

Show category hierarchy.

Example:

```text
Housing
  Rent
  Service Charge

Transport
  Bike Fuel
  Maintenance
  Parking
  Toll
```

Allow:

- create
- edit
- deactivate
- reactivate
- optional icon

Inactive categories should be visually distinguishable.

## 11. Profile / Settings

Sections may include:

- profile
- security/password
- accounts
- categories
- financial preferences
- appearance
- currency/timezone

## 12. Empty States

Every primary screen needs a useful empty state.

Examples:

No accounts:

`Create your first account to start tracking your money.`

No transactions:

`No transactions yet. Add your first income or expense.`

No budget:

`Create a monthly budget to compare your plan with actual spending.`

## 13. Loading States

Use skeletons/spinners appropriately.

Do not show blank screens while dashboard data loads.

## 14. Error States

Errors should be understandable and actionable.

Do not expose raw database errors or stack traces.

## 15. Forms

Use:

- consistent field labels
- inline validation
- numeric amount formatting
- appropriate mobile keyboards
- disabled/loading submit state
- clear success feedback

## 16. Color Semantics

Use the sea-green design system as the base.

Financial semantic colors can be layered on top:

- income/surplus: positive semantic treatment
- expense: negative semantic treatment
- warning/over budget: warning treatment

Do not let semantic colors destroy the primary sea-green visual identity.

## 17. Responsive Design

MVP priority:

1. mobile
2. tablet
3. desktop

On larger screens:

- use wider content areas
- allow dashboard cards to form grids
- allow tables/list views where helpful

Do not redesign the product into a separate desktop application.

## 18. Accessibility

Use:

- semantic HTML
- keyboard-accessible controls
- visible focus states
- sufficient contrast
- labels for form controls
- accessible chart summaries where practical

## 19. Component Philosophy

Use shadcn/ui primitives consistently.

Create reusable components for:

- amount display
- financial summary cards
- transaction row
- category selector
- account selector
- budget progress
- chart containers
- empty states
- confirmation dialogs

Avoid duplicating nearly identical UI components.
