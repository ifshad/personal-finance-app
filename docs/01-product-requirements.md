# Product Requirements

## 1. Product Overview

Build a simple, modern, mobile-first personal finance application for multiple users.

The application allows each user to track personal income and expenses, manage financial accounts, create flexible budgets, transfer money between accounts, and understand financial behavior through real-time dashboards, charts, and reports.

The current Google Sheet is the conceptual starting point. It contains expenses such as house rent, service charge, electricity/current, office lunch, internet, parking, garage bill, bike fuel, daily spending, home internet/net bill, Shila-related expenses, bike maintenance, going home, parents, debt, savings, bazar, home appliances, shopping, toll, and Rajshahi/travel-related spending.

The application should preserve these useful concepts without forcing them into a rigid monthly spreadsheet.

## 2. Product Goal

The app should answer these questions quickly:

- How much money do I currently have?
- How much did I earn this month?
- How much did I spend this month?
- Where did my money go?
- How am I performing against my budget?
- How much can I safely spend?
- How much did I spend over the last month, six months, and year?
- Which categories are consuming the most money?
- How are income, expenses, and savings changing over time?

## 3. Users

The system is multi-user.

A user can:

- register
- log in
- complete/update a profile
- manage their own financial data
- create and manage their own accounts
- create and manage their own categories
- create budgets
- record income, expenses, and transfers
- view only their own financial insights

Users must never access another user's financial records.

## 4. Roles

The application supports predefined roles through JWT-based authentication and authorization.

MVP does not include an admin panel.

The architecture must leave room for future administrative functionality without requiring a rewrite of authentication/authorization.

## 5. MVP Features

### Authentication

- Registration
- Login
- JWT authentication
- Protected application routes/API endpoints
- Role-aware authorization
- Profile completion/update

### Accounts

Users can create financial accounts such as:

- Cash
- bKash
- Bank
- Card

Each account has an opening balance and a calculated/current balance.

Accounts can be deactivated without destroying historical transactions.

### Categories

Users have user-specific categories and optional subcategories.

Categories support:

- name
- type
- optional parent category
- active/inactive status
- optional icon

Inactive categories are hidden from new transaction entry but remain available for historical reporting.

### Transactions

Users can record:

- income
- expense
- transfer

Each transaction is user-owned.

Expenses and income are associated with an account. Transfers have a source account and destination account.

### Budgets

Users can create a monthly budget and assign planned amounts to categories.

Budget is a planning tool, not a hard spending restriction.

If actual spending exceeds the planned amount, the application reports the overage rather than requiring the user to modify historical transactions.

### Dashboard

Show real-time financial information including:

- current total balance
- monthly income
- monthly expenses
- monthly remaining balance
- budget progress
- safe-to-spend estimate
- recent transactions
- upcoming/committed budget information where applicable
- daily income chart
- daily expense chart
- monthly income vs expense chart
- category expense breakdown

### Reports

Support analysis over:

- daily
- weekly
- monthly
- half-yearly
- yearly
- custom periods where practical

Reports should include:

- total income
- total expense
- net balance/change
- savings
- savings rate
- category breakdown
- spending trends
- income trends
- budget vs actual

## 6. Existing Spreadsheet Concepts

The current spreadsheet contains the following baseline expense concepts:

- House Rent
- Service Charge
- Gas
- Current
- Office Lunch
- Internet
- Parking
- Garage Bill
- Mobile
- Bike Fuel
- Daily
- Net Bill (Home)
- Shila
- Bike Maintenance
- Going Home
- Ammu
- Abbu
- Debt
- Savings
- Date
- Bazar
- Shila Edu
- Home Appliance
- Extra
- Shila Shopping
- Toll
- Rajshahi
- My Shopping

These are source concepts, not necessarily the final database categories. The application should preserve their meaning while allowing a cleaner category/subcategory structure.

## 7. Design Philosophy

The system is transaction-first.

Transactions are the source of financial reality.

Budgets are plans and should be compared against transactions.

Do not build the system around manually changing monthly actuals.

## 8. MVP Exclusions

Do not build yet:

- admin dashboard
- multi-currency accounting
- investment portfolio management
- advanced accounting/ledger system
- bank API integrations
- automated bank statement imports
- AI financial advisor
- complex debt amortization
- payment processing
- social/shared family wallets

These may be considered later.

## 9. Future Direction

Possible future features include:

- admin panel
- recurring transactions
- financial goals
- debt management
- notifications/reminders
- attachments/receipts
- richer forecasting
- bank integrations
- export/import
- PWA/offline enhancements

Future functionality must not complicate the MVP unnecessarily.
