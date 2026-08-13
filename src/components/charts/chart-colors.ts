/**
 * Chart series colors, as CSS variable references — the actual light/dark
 * hex values live in globals.css so they swap with the theme automatically
 * (no client-side theme detection needed). Recharts accepts any CSS color
 * string for stroke/fill, including `var(...)`.
 *
 * Single-series charts (one thing being measured) use our own sea-green
 * brand tokens — there's no adjacent-series confusability to worry about.
 *
 * Multi-series charts (income vs expense, category breakdown) use the
 * dataviz skill's validated default categorical/diverging palette instead
 * of brand colors, because THIS is exactly the case the skill's colorblind-
 * safety checks (adjacent-pair CVD ΔE, normal-vision floor) are for. Income
 * vs expense is a polarity (money in vs money out), so it uses the
 * diverging blue↔red pair rather than green/red — red/green is the most
 * common form of color blindness, so pairing them for a two-series chart
 * is exactly the anti-pattern the skill warns about.
 */
export const CHART_SERIES = {
  income: "var(--chart-income)",
  expense: "var(--chart-expense)",
} as const;

/** Categorical slots 1-8 from the validated default palette (dataviz skill). */
export const CATEGORICAL_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

export const CHART_INK = {
  axis: "var(--muted-foreground)",
  grid: "var(--border)",
} as const;
