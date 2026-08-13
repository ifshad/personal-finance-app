import {
  daysInRange,
  getCurrentMonthRange,
  getCurrentWeekRange,
  getCustomRange,
  getHalfYearRange,
  getLocalDateString,
  getMonthRange,
  getTodayRange,
  getYearRange,
  parseIsoDate,
  type PeriodRange,
} from "@/lib/period";
import type { ReportQuery } from "@/lib/validation/reports";
import {
  sumTransactionAmount,
  sumTransactionsByDate,
  sumTransactionsByMonth,
} from "@/server/repositories/transactions.repository";
import { findBudgetForPeriod, type BudgetDto } from "./budgets.service";
import { getCategoryBreakdown, type CategoryBreakdownItem } from "./category-breakdown.service";
import { Money } from "./money";

// Above this many days, a trend chart switches from daily to monthly points
// so it doesn't try to plot hundreds of bars.
const DAILY_GRANULARITY_LIMIT_DAYS = 45;

export type TrendSeries = {
  granularity: "day" | "month";
  points: Array<{ key: string; total: string }>;
};

export type ExpenseAnalysis = {
  breakdown: CategoryBreakdownItem[];
  trend: TrendSeries;
  averageDailySpending: string;
  highestCategory: CategoryBreakdownItem | null;
  highestSpendingDay: { date: string; total: string } | null;
};

export type IncomeAnalysis = {
  breakdown: CategoryBreakdownItem[];
  trend: TrendSeries;
};

export type ReportSummary = {
  income: string;
  expense: string;
  savings: string;
  savingsRate: number | null;
};

export type ReportData = {
  range: PeriodRange;
  summary: ReportSummary;
  expenseAnalysis: ExpenseAnalysis;
  incomeAnalysis: IncomeAnalysis;
  budgetAnalysis: BudgetDto | null;
};

export function resolveReportRange(query: ReportQuery, localDate: string): PeriodRange {
  switch (query.periodType) {
    case "today":
      return getTodayRange(localDate);
    case "week":
      return getCurrentWeekRange(localDate);
    case "half-year": {
      const year = query.year ?? parseIsoDate(localDate).year;
      const half = query.half === 2 ? 2 : 1;
      return getHalfYearRange(year, half);
    }
    case "year":
      return getYearRange(query.year ?? parseIsoDate(localDate).year);
    case "custom":
      // reportQuerySchema's refine() guarantees these are present for "custom".
      return getCustomRange(query.dateFrom!, query.dateTo!);
    case "month":
    default:
      return query.year && query.month
        ? getMonthRange(query.year, query.month)
        : getCurrentMonthRange(localDate);
  }
}

async function getTrend(
  userId: number,
  type: "INCOME" | "EXPENSE",
  range: PeriodRange,
): Promise<{ trend: TrendSeries; dailyRows: Array<{ date: string; total: string }> }> {
  const dailyRows = await sumTransactionsByDate(userId, {
    type,
    dateFrom: range.start,
    dateTo: range.end,
  });

  if (daysInRange(range) <= DAILY_GRANULARITY_LIMIT_DAYS) {
    return {
      dailyRows,
      trend: { granularity: "day", points: dailyRows.map((row) => ({ key: row.date, total: row.total })) },
    };
  }

  const monthlyRows = await sumTransactionsByMonth(userId, {
    type,
    dateFrom: range.start,
    dateTo: range.end,
  });
  return {
    dailyRows,
    trend: { granularity: "month", points: monthlyRows.map((row) => ({ key: row.month, total: row.total })) },
  };
}

export async function getReportData(
  userId: number,
  timezone: string,
  query: ReportQuery,
): Promise<ReportData> {
  const localDate = getLocalDateString(timezone);
  const range = resolveReportRange(query, localDate);

  const [
    incomeStr,
    expenseStr,
    expenseBreakdown,
    incomeBreakdown,
    { trend: expenseTrend, dailyRows: dailyExpenseRows },
    { trend: incomeTrend },
    budgetAnalysis,
  ] = await Promise.all([
    sumTransactionAmount(userId, { type: "INCOME", dateFrom: range.start, dateTo: range.end }),
    sumTransactionAmount(userId, { type: "EXPENSE", dateFrom: range.start, dateTo: range.end }),
    getCategoryBreakdown(userId, "EXPENSE", range.start, range.end),
    getCategoryBreakdown(userId, "INCOME", range.start, range.end),
    getTrend(userId, "EXPENSE", range),
    getTrend(userId, "INCOME", range),
    findBudgetForPeriod(userId, range.start, range.end),
  ]);

  const income = Money.fromDecimalString(incomeStr);
  const expense = Money.fromDecimalString(expenseStr);
  const savings = income.subtract(expense);
  const savingsRate = income.isZero()
    ? null
    : Math.round((savings.toNumber() / income.toNumber()) * 1000) / 10;

  const days = daysInRange(range);
  const averageDailySpending = (expense.toNumber() / days).toFixed(2);

  const highestSpendingDay = dailyExpenseRows.reduce<{ date: string; total: string } | null>(
    (max, row) =>
      !max || Money.fromDecimalString(row.total).compare(Money.fromDecimalString(max.total)) > 0
        ? row
        : max,
    null,
  );

  return {
    range,
    summary: { income: income.toDecimalString(), expense: expense.toDecimalString(), savings: savings.toDecimalString(), savingsRate },
    expenseAnalysis: {
      breakdown: expenseBreakdown,
      trend: expenseTrend,
      averageDailySpending,
      highestCategory: expenseBreakdown[0] ?? null,
      highestSpendingDay,
    },
    incomeAnalysis: {
      breakdown: incomeBreakdown,
      trend: incomeTrend,
    },
    budgetAnalysis,
  };
}
