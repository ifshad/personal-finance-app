"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_INK } from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

export type DailyPoint = {
  label: string; // e.g. "1", "2", ... day of month
  amount: number;
};

type DailyBarChartProps = {
  data: DailyPoint[];
  currency: string;
  color: string;
  seriesName: string;
};

export function DailyBarChart({ data, currency, color, seriesName }: DailyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_INK.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={typeof data[0]?.label === "string" ? 4 : undefined}
        />
        <YAxis hide />
        <Tooltip
          content={(props) => <ChartTooltip {...props} currency={currency} />}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar dataKey="amount" name={seriesName} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
