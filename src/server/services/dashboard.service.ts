import {
  getCurrentMonthRange,
  getLocalDateString,
  getTrailingMonthKeys,
  getTrailingMonthsRange,
} from "@/lib/period";
import { findAccountsByUser } from "@/server/repositories/accounts.repository";
import {
  sumTransactionAmount,
  sumTransactionsByDate,
  sumTransactionsByMonth,
} from "@/server/repositories/transactions.repository";
import { getAccountBalances, getTotalBalance } from "./balances.service";
import { findBudgetForPeriod, type BudgetDto } from "./budgets.service";
import { getCategoryBreakdown, type CategoryBreakdownItem } from "./category-breakdown.service";
import { Money } from "./money";
import { getSafeToSpendForUser, type SafeToSpendResult } from "./safe-to-spend.service";
import { listTransactionsForUser, type TransactionDto } from "./transactions.service";

const TREND_MONTHS = 6;

export type MonthlyTrendPoint = {
  month: string; // "YYYY-MM"
  income: string;
  expense: string;
};

export type DashboardData = {
  monthRange: { start: string; end: string };
  totalBalance: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySavings: string;
  budget: BudgetDto | null;
  safeToSpend: SafeToSpendResult;
  recentTransactions: TransactionDto[];
  dailyIncome: Array<{ date: string; total: string }>;
  dailyExpense: Array<{ date: string; total: string }>;
  monthlyTrend: MonthlyTrendPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
};

export async function getDashboardData(userId: number, timezone: string): Promise<DashboardData> {
  const localDate = getLocalDateString(timezone);
  const monthRange = getCurrentMonthRange(localDate);
  const trendRange = getTrailingMonthsRange(localDate, TREND_MONTHS);
  const trendMonthKeys = getTrailingMonthKeys(localDate, TREND_MONTHS);

  const accounts = await findAccountsByUser(userId);
  const balances = await getAccountBalances(userId, accounts);
  const totalBalance = getTotalBalance(accounts, balances);

  const [
    monthlyIncomeStr,
    monthlyExpenseStr,
    budget,
    safeToSpend,
    recent,
    dailyIncome,
    dailyExpense,
    monthlyIncomeByMonth,
    monthlyExpenseByMonth,
    categoryBreakdown,
  ] = await Promise.all([
    sumTransactionAmount(userId, {
      type: "INCOME",
      dateFrom: monthRange.start,
      dateTo: monthRange.end,
    }),
    sumTransactionAmount(userId, {
      type: "EXPENSE",
      dateFrom: monthRange.start,
      dateTo: monthRange.end,
    }),
    findBudgetForPeriod(userId, monthRange.start, monthRange.end),
    getSafeToSpendForUser(userId, timezone),
    listTransactionsForUser(userId, { page: 1, pageSize: 5 }),
    sumTransactionsByDate(userId, {
      type: "INCOME",
      dateFrom: monthRange.start,
      dateTo: monthRange.end,
    }),
    sumTransactionsByDate(userId, {
      type: "EXPENSE",
      dateFrom: monthRange.start,
      dateTo: monthRange.end,
    }),
    sumTransactionsByMonth(userId, {
      type: "INCOME",
      dateFrom: trendRange.start,
      dateTo: trendRange.end,
    }),
    sumTransactionsByMonth(userId, {
      type: "EXPENSE",
      dateFrom: trendRange.start,
      dateTo: trendRange.end,
    }),
    getCategoryBreakdown(userId, "EXPENSE", monthRange.start, monthRange.end),
  ]);

  const monthlyIncome = Money.fromDecimalString(monthlyIncomeStr);
  const monthlyExpense = Money.fromDecimalString(monthlyExpenseStr);

  const incomeByMonth = new Map(monthlyIncomeByMonth.map((row) => [row.month, row.total]));
  const expenseByMonth = new Map(monthlyExpenseByMonth.map((row) => [row.month, row.total]));
  const monthlyTrend: MonthlyTrendPoint[] = trendMonthKeys.map((month) => ({
    month,
    income: incomeByMonth.get(month) ?? "0.00",
    expense: expenseByMonth.get(month) ?? "0.00",
  }));

  return {
    monthRange,
    totalBalance: totalBalance.toDecimalString(),
    monthlyIncome: monthlyIncome.toDecimalString(),
    monthlyExpense: monthlyExpense.toDecimalString(),
    monthlySavings: monthlyIncome.subtract(monthlyExpense).toDecimalString(),
    budget,
    safeToSpend,
    recentTransactions: recent.transactions,
    dailyIncome,
    dailyExpense,
    monthlyTrend,
    categoryBreakdown,
  };
}
