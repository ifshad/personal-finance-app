/** Row shapes as stored in MySQL, matching the migrations in db/migrations. */

export type RoleRow = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UserProfileRow = {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  currency: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
};

export type AccountType = "CASH" | "BANK" | "MOBILE_WALLET" | "CARD" | "OTHER";

export type AccountRow = {
  id: number;
  user_id: number;
  name: string;
  account_type: AccountType;
  opening_balance: string; // DECIMAL(15,2) comes back from mysql2 as a string
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CategoryType = "INCOME" | "EXPENSE";

export type CategoryRow = {
  id: number;
  user_id: number;
  parent_id: number | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type TransactionRow = {
  id: number;
  user_id: number;
  type: TransactionType;
  amount: string; // DECIMAL(15,2) as a string
  account_id: number | null;
  category_id: number | null;
  from_account_id: number | null;
  to_account_id: number | null;
  description: string | null;
  notes: string | null;
  transaction_date: string; // DATE column, returned as "YYYY-MM-DD"
  created_at: Date;
  updated_at: Date;
};

export type BudgetRow = {
  id: number;
  user_id: number;
  name: string | null;
  period_start: string; // DATE, "YYYY-MM-DD"
  period_end: string;
  created_at: Date;
  updated_at: Date;
};

export type BudgetItemRow = {
  id: number;
  budget_id: number;
  category_id: number;
  planned_amount: string; // DECIMAL(15,2) as a string
  created_at: Date;
  updated_at: Date;
};
