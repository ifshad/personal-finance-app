"use client";

import { useState } from "react";
import Link from "next/link";
import { PeriodSelector } from "./period-selector";
import { DailyBarChart } from "@/components/charts/daily-bar-chart";
import { CategoryBreakdownList } from "@/components/charts/category-breakdown-list";
import { CHART_SERIES } from "@/components/charts/chart-colors";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { formatMoney } from "@/lib/format-money";
import { apiRequest } from "@/lib/api-client";
import type { PeriodRange } from "@/lib/period";
import { fillDateRangeSeries, fillMonthRangeSeries } from "@/lib/chart-data";
import type { ReportQuery } from "@/lib/validation/reports";
import type { ReportData, TrendSeries } from "@/server/services/reports.service";

type ReportsViewProps = {
  initialReport: ReportData;
  initialQuery: ReportQuery;
  currency: string;
};

/** Gap-fills a trend series to zero for every day/month in the range — not
 * just the ones with transactions — so a sparse period doesn't read as a
 * shorter one on the chart. */
function trendToPoints(
  trend: TrendSeries,
  range: PeriodRange,
): Array<{ label: string; amount: number }> {
  if (trend.granularity === "day") {
    return fillDateRangeSeries(
      trend.points.map((point) => ({ date: point.key, total: point.total })),
      range,
    );
  }
  return fillMonthRangeSeries(
    trend.points.map((point) => ({ month: point.key, total: point.total })),
    range,
  );
}

function formatRangeLabel(range: { start: string; end: string }): string {
  const format = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return range.start === range.end ? format(range.start) : `${format(range.start)} – ${format(range.end)}`;
}

export function ReportsView({ initialReport, initialQuery, currency }: ReportsViewProps) {
  const [query, setQuery] = useState<ReportQuery>(initialQuery);
  const [report, setReport] = useState<ReportData>(initialReport);
  const [isLoading, setIsLoading] = useState(false);

  async function handleQueryChange(nextQuery: ReportQuery) {
    setQuery(nextQuery);
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("periodType", nextQuery.periodType);
      if (nextQuery.year) params.set("year", String(nextQuery.year));
      if (nextQuery.month) params.set("month", String(nextQuery.month));
      if (nextQuery.half) params.set("half", String(nextQuery.half));
      if (nextQuery.dateFrom) params.set("dateFrom", nextQuery.dateFrom);
      if (nextQuery.dateTo) params.set("dateTo", nextQuery.dateTo);

      const { report: nextReport } = await apiRequest<{ report: ReportData }>(
        `/api/reports?${params.toString()}`,
      );
      setReport(nextReport);
    } finally {
      setIsLoading(false);
    }
  }

  const isSavingsPositive = !report.summary.savings.startsWith("-");
  const budget = report.budgetAnalysis;

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">{formatRangeLabel(report.range)}</p>
      </div>

      <PeriodSelector query={query} onChange={handleQueryChange} />

      <div className={isLoading ? "space-y-6 opacity-60" : "space-y-6"}>
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-semibold text-primary">
              {formatMoney(report.summary.income, currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Expense</p>
            <p className="text-lg font-semibold text-destructive">
              {formatMoney(report.summary.expense, currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Savings</p>
            <p className={`text-lg font-semibold ${isSavingsPositive ? "text-primary" : "text-destructive"}`}>
              {formatMoney(report.summary.savings, currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Savings rate</p>
            <p className="text-lg font-semibold text-foreground">
              {report.summary.savingsRate === null ? "—" : `${report.summary.savingsRate}%`}
            </p>
          </div>
        </div>

        {/* Expense analysis */}
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Expense analysis</p>
          <DailyBarChart
            data={trendToPoints(report.expenseAnalysis.trend, report.range)}
            currency={currency}
            color={CHART_SERIES.expense}
            seriesName="Expense"
          />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Average daily spending</p>
              <p className="font-medium text-foreground">
                {formatMoney(report.expenseAnalysis.averageDailySpending, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Highest spending day</p>
              <p className="font-medium text-foreground">
                {report.expenseAnalysis.highestSpendingDay
                  ? `${formatMoney(report.expenseAnalysis.highestSpendingDay.total, currency)} on ${report.expenseAnalysis.highestSpendingDay.date}`
                  : "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              By category
              {report.expenseAnalysis.highestCategory &&
                ` · highest: ${report.expenseAnalysis.highestCategory.categoryName}`}
            </p>
            <CategoryBreakdownList items={report.expenseAnalysis.breakdown} currency={currency} />
          </div>
        </div>

        {/* Income analysis */}
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Income analysis</p>
          <DailyBarChart
            data={trendToPoints(report.incomeAnalysis.trend, report.range)}
            currency={currency}
            color={CHART_SERIES.income}
            seriesName="Income"
          />
          <div>
            <p className="mb-2 text-xs text-muted-foreground">By source</p>
            <CategoryBreakdownList items={report.incomeAnalysis.breakdown} currency={currency} />
          </div>
        </div>

        {/* Budget analysis */}
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Budget vs actual</p>
            {budget && (
              <Badge variant={(budget.percentageUsed ?? 0) > 100 ? "destructive" : "secondary"}>
                {budget.percentageUsed ?? 0}%
              </Badge>
            )}
          </div>
          {budget ? (
            <>
              <Progress value={Math.min(budget.percentageUsed ?? 0, 100)}>
                <ProgressTrack>
                  <ProgressIndicator
                    className={(budget.percentageUsed ?? 0) > 100 ? "bg-destructive" : "bg-primary"}
                  />
                </ProgressTrack>
              </Progress>
              <ul className="space-y-2">
                {budget.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.categoryName}</span>
                    <span className={item.isOverBudget ? "text-destructive" : "text-muted-foreground"}>
                      {formatMoney(item.actualAmount, currency)} / {formatMoney(item.plannedAmount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href={`/budgets/${budget.id}`} className="text-xs text-primary hover:underline">
                View full budget
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No budget exists for this exact period.{" "}
              <Link href="/budgets" className="text-primary hover:underline">
                Create one
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
