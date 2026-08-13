"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_INK, CHART_SERIES } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

export type TrendPoint = {
  label: string; // x-axis tick, e.g. "Mar" or "Aug 5"
  income: number;
  expense: number;
};

type IncomeExpenseTrendChartProps = {
  data: TrendPoint[];
  currency: string;
};

export function IncomeExpenseTrendChart({ data, currency }: IncomeExpenseTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_INK.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          content={(props) => <ChartTooltip {...props} currency={currency} />}
          cursor={{ fill: "var(--muted)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: CHART_INK.axis }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="income" name="Income" fill={CHART_SERIES.income} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill={CHART_SERIES.expense} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
