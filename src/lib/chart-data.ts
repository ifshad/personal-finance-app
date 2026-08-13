/** Display-only helpers for turning aggregate rows into chart-ready points. */

import { getMonthKeysInRange, parseIsoDate, type PeriodRange } from "./period";

type DateTotal = { date: string; total: string };
type MonthTotal = { month: string; total: string };

function addOneDay(dateString: string): string {
  const { year, month, day } = parseIsoDate(dateString);
  const next = new Date(year, month - 1, day + 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}

/** Fills every day in the range with 0 where no transactions exist, so a chart shows the full range. */
export function fillDateRangeSeries(
  rows: DateTotal[],
  range: PeriodRange,
): Array<{ label: string; amount: number }> {
  const totals = new Map(rows.map((row) => [row.date, Number(row.total)]));

  const points: Array<{ label: string; amount: number }> = [];
  let current = range.start;
  // Same day-count cap the app enforces nowhere else explicitly, but a
  // custom report range is user-typed — guard against a pathological range
  // producing an unbounded loop.
  let guard = 0;
  while (current <= range.end && guard < 3660) {
    points.push({ label: String(parseIsoDate(current).day), amount: totals.get(current) ?? 0 });
    current = addOneDay(current);
    guard += 1;
  }
  return points;
}

export function monthKeyToLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

/** Fills every month in the range with 0 where no transactions exist. */
export function fillMonthRangeSeries(
  rows: MonthTotal[],
  range: PeriodRange,
): Array<{ label: string; amount: number }> {
  const totals = new Map(rows.map((row) => [row.month, Number(row.total)]));
  return getMonthKeysInRange(range).map((key) => ({
    label: monthKeyToLabel(key),
    amount: totals.get(key) ?? 0,
  }));
}
