import { ApiError } from "@/lib/api-error";

/** Inclusive "YYYY-MM-DD" date range. No time-of-day or timezone component. */
export type PeriodRange = {
  start: string;
  end: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseIsoDate(dateString: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
}

/**
 * Days in a given month, computed via calendar arithmetic only (day 0 of
 * the next month == last day of this month). Deliberately does not go
 * through an instant/timezone conversion.
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Today's calendar date in the given IANA timezone, as "YYYY-MM-DD".
 * This is the ONLY place that touches an actual instant — every other
 * period calculation here works on plain year/month/day integers so it
 * can't be skewed by timezone conversion.
 */
export function getLocalDateString(timezone: string, instant: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function getTodayRange(localDate: string): PeriodRange {
  return { start: localDate, end: localDate };
}

/** Monday-to-Sunday week containing `localDate`. */
export function getCurrentWeekRange(localDate: string): PeriodRange {
  const { year, month, day } = parseIsoDate(localDate);
  // Date.UTC avoids any local-timezone DST weirdness in weekday calculation.
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun..6=Sat
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(Date.UTC(year, month - 1, day + mondayOffset));
  const sunday = new Date(Date.UTC(year, month - 1, day + mondayOffset + 6));
  return {
    start: formatIsoDate(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate()),
    end: formatIsoDate(sunday.getUTCFullYear(), sunday.getUTCMonth() + 1, sunday.getUTCDate()),
  };
}

export function getMonthRange(year: number, month: number): PeriodRange {
  return {
    start: formatIsoDate(year, month, 1),
    end: formatIsoDate(year, month, daysInMonth(year, month)),
  };
}

export function getCurrentMonthRange(localDate: string): PeriodRange {
  const { year, month } = parseIsoDate(localDate);
  return getMonthRange(year, month);
}

export function getPreviousMonthRange(localDate: string): PeriodRange {
  const { year, month } = parseIsoDate(localDate);
  return month === 1 ? getMonthRange(year - 1, 12) : getMonthRange(year, month - 1);
}

/** Shifts a (year, month) back by `count` months, e.g. (2026, 1, 2) -> (2025, 11). */
function shiftMonthKey(year: number, month: number, count: number): { year: number; month: number } {
  const zeroBasedAbsolute = year * 12 + (month - 1) - count;
  const shiftedYear = Math.floor(zeroBasedAbsolute / 12);
  const shiftedMonth = ((zeroBasedAbsolute % 12) + 12) % 12; // always 0..11, even for negative input
  return { year: shiftedYear, month: shiftedMonth + 1 };
}

/**
 * Range spanning the trailing `monthsCount` months up to and including the
 * month containing `localDate` — e.g. monthsCount=6 in August gives
 * March 1 through August 31. Used for monthly trend charts.
 */
export function getTrailingMonthsRange(localDate: string, monthsCount: number): PeriodRange {
  const { year, month } = parseIsoDate(localDate);
  const { year: startYear, month: startMonth } = shiftMonthKey(year, month, monthsCount - 1);
  return { start: getMonthRange(startYear, startMonth).start, end: getCurrentMonthRange(localDate).end };
}

/** "YYYY-MM" keys for the trailing `monthsCount` months, oldest first. */
export function getTrailingMonthKeys(localDate: string, monthsCount: number): string[] {
  const { year, month } = parseIsoDate(localDate);
  const keys: string[] = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const { year: y, month: m } = shiftMonthKey(year, month, i);
    keys.push(`${y}-${pad(m)}`);
  }
  return keys;
}

/** H1 = Jan-Jun, H2 = Jul-Dec (docs/02-financial-model.md §12). */
export function getHalfYearRange(year: number, half: 1 | 2): PeriodRange {
  return half === 1
    ? { start: formatIsoDate(year, 1, 1), end: formatIsoDate(year, 6, 30) }
    : { start: formatIsoDate(year, 7, 1), end: formatIsoDate(year, 12, 31) };
}

export function getYearRange(year: number): PeriodRange {
  return { start: formatIsoDate(year, 1, 1), end: formatIsoDate(year, 12, 31) };
}

export function getCustomRange(start: string, end: string): PeriodRange {
  if (start > end) {
    throw ApiError.validation("Start date must be on or before the end date");
  }
  return { start, end };
}

/** Number of calendar days in an inclusive range, e.g. same day == 1. */
export function daysInRange(range: PeriodRange): number {
  const start = parseIsoDate(range.start);
  const end = parseIsoDate(range.end);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
}

/** Days remaining in the range counting from (and including) `localDate`, min 1. */
export function remainingDaysInRange(range: PeriodRange, localDate: string): number {
  if (localDate > range.end) return 0;
  const effectiveStart = localDate > range.start ? localDate : range.start;
  return daysInRange({ start: effectiveStart, end: range.end });
}

/** "YYYY-MM" keys for every month touched by the range, oldest first. */
export function getMonthKeysInRange(range: PeriodRange): string[] {
  const start = parseIsoDate(range.start);
  const end = parseIsoDate(range.end);
  const keys: string[] = [];
  let year = start.year;
  let month = start.month;
  while (year < end.year || (year === end.year && month <= end.month)) {
    keys.push(`${year}-${pad(month)}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return keys;
}
