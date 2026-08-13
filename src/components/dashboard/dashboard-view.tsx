import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { IncomeExpenseTrendChart } from "@/components/charts/income-expense-trend-chart";
import { DailyBarChart } from "@/components/charts/daily-bar-chart";
import { CategoryBreakdownList } from "@/components/charts/category-breakdown-list";
import { CHART_SERIES } from "@/components/charts/chart-colors";
import { formatMoney } from "@/lib/format-money";
import { fillDateRangeSeries, monthKeyToLabel } from "@/lib/chart-data";
import type { AccountWithBalance } from "@/server/services/accounts.service";
import type { CategoryDto } from "@/server/services/categories.service";
import type { DashboardData } from "@/server/services/dashboard.service";

type DashboardViewProps = {
  data: DashboardData;
  currency: string;
  periodLabel: string;
  greetingName: string;
  accounts: AccountWithBalance[];
  categories: CategoryDto[];
};

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "income" | "expense" }) {
  const toneClass =
    tone === "income" ? "text-primary" : tone === "expense" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export function DashboardView({
  data,
  currency,
  periodLabel,
  greetingName,
  accounts,
  categories,
}: DashboardViewProps) {
  const dailyIncomePoints = fillDateRangeSeries(data.dailyIncome, data.monthRange);
  const dailyExpensePoints = fillDateRangeSeries(data.dailyExpense, data.monthRange);
  const trendPoints = data.monthlyTrend.map((point) => ({
    label: monthKeyToLabel(point.month),
    income: Number(point.income),
    expense: Number(point.expense),
  }));
  const accountNames = new Map(accounts.map((account) => [account.id, account.name]));
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  const isSavingsPositive = !data.monthlySavings.startsWith("-");

  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6 p-4 pb-24">
      <div>
        <p className="text-sm text-muted-foreground">{periodLabel}</p>
        <h1 className="text-xl font-semibold text-foreground">Hi, {greetingName}</h1>
      </div>

      {accounts.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Create your first account to start tracking your money.
          </p>
          <Button render={<Link href="/accounts" />}>Add an account</Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total balance</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatMoney(data.totalBalance, currency)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Income" value={formatMoney(data.monthlyIncome, currency)} tone="income" />
            <StatCard label="Expense" value={formatMoney(data.monthlyExpense, currency)} tone="expense" />
            <StatCard
              label="Savings"
              value={formatMoney(data.monthlySavings, currency)}
              tone={isSavingsPositive ? "income" : "expense"}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Safe to spend</p>
            {data.safeToSpend.available ? (
              <>
                <p className="text-2xl font-semibold text-foreground">
                  {formatMoney(data.safeToSpend.amountPerDay, currency)}
                  <span className="text-sm font-normal text-muted-foreground"> / day</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.safeToSpend.basis === "balance_and_budget"
                    ? `Based on your balance and remaining budget, over ${data.safeToSpend.remainingDays} days left this month.`
                    : `Based on your balance only (no budget set), over ${data.safeToSpend.remainingDays} days left this month.`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{data.safeToSpend.reason}</p>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Budget progress</p>
              {data.budget && (
                <Badge variant={data.budget.percentageUsed && data.budget.percentageUsed > 100 ? "destructive" : "secondary"}>
                  {data.budget.percentageUsed ?? 0}%
                </Badge>
              )}
            </div>
            {data.budget ? (
              <>
                <Progress value={Math.min(data.budget.percentageUsed ?? 0, 100)}>
                  <ProgressTrack>
                    <ProgressIndicator
                      className={
                        (data.budget.percentageUsed ?? 0) > 100 ? "bg-destructive" : "bg-primary"
                      }
                    />
                  </ProgressTrack>
                </Progress>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatMoney(data.budget.totalActual, currency)} spent</span>
                  <span>{formatMoney(data.budget.totalPlanned, currency)} planned</span>
                </div>
                <Button variant="outline" size="sm" render={<Link href={`/budgets/${data.budget.id}`} />}>
                  View budget
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Create a monthly budget to compare your plan with actual spending.
                </p>
                <Button size="sm" render={<Link href="/budgets" />}>
                  Create budget
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Income vs expense</p>
            <IncomeExpenseTrendChart data={trendPoints} currency={currency} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">Daily income</p>
              <DailyBarChart
                data={dailyIncomePoints}
                currency={currency}
                color={CHART_SERIES.income}
                seriesName="Income"
              />
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">Daily expense</p>
              <DailyBarChart
                data={dailyExpensePoints}
                currency={currency}
                color={CHART_SERIES.expense}
                seriesName="Expense"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Where your money went</p>
            <CategoryBreakdownList items={data.categoryBreakdown} currency={currency} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Recent transactions</p>
              <Link href="/transactions" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            {data.recentTransactions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No transactions yet. Add your first income or expense.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.recentTransactions.map((transaction) => (
                  <li key={transaction.id}>
                    <TransactionRow
                      transaction={transaction}
                      currency={currency}
                      accountNames={accountNames}
                      categoryNames={categoryNames}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
