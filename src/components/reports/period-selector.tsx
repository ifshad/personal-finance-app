"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportQuery } from "@/lib/validation/reports";

type PeriodSelectorProps = {
  query: ReportQuery;
  onChange: (query: ReportQuery) => void;
};

const PERIOD_LABELS: Record<ReportQuery["periodType"], string> = {
  today: "Today",
  week: "Week",
  month: "Month",
  "half-year": "Half-year",
  year: "Year",
  custom: "Custom",
};

const currentYear = new Date().getFullYear();

export function PeriodSelector({ query, onChange }: PeriodSelectorProps) {
  const [customFrom, setCustomFrom] = useState(query.dateFrom ?? "");
  const [customTo, setCustomTo] = useState(query.dateTo ?? "");

  function handlePeriodTypeChange(periodType: ReportQuery["periodType"]) {
    onChange({ periodType });
  }

  return (
    <div className="space-y-3">
      <Tabs
        value={query.periodType}
        onValueChange={(value) => handlePeriodTypeChange(value as ReportQuery["periodType"])}
      >
        <TabsList className="w-full flex-wrap">
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="flex-1">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {query.periodType === "month" && (
        <Input
          type="month"
          value={
            query.year && query.month
              ? `${query.year}-${String(query.month).padStart(2, "0")}`
              : ""
          }
          onChange={(event) => {
            const [year, month] = event.target.value.split("-").map(Number);
            onChange({ periodType: "month", year, month });
          }}
        />
      )}

      {query.periodType === "half-year" && (
        <div className="flex gap-2">
          <Input
            type="number"
            className="flex-1"
            value={query.year ?? currentYear}
            onChange={(event) =>
              onChange({ periodType: "half-year", year: Number(event.target.value), half: query.half ?? 1 })
            }
          />
          <Select
            value={String(query.half ?? 1)}
            onValueChange={(value) =>
              onChange({ periodType: "half-year", year: query.year ?? currentYear, half: value === "2" ? 2 : 1 })
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 (Jan-Jun)</SelectItem>
              <SelectItem value="2">H2 (Jul-Dec)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {query.periodType === "year" && (
        <Input
          type="number"
          value={query.year ?? currentYear}
          onChange={(event) => onChange({ periodType: "year", year: Number(event.target.value) })}
        />
      )}

      {query.periodType === "custom" && (
        <div className="flex flex-wrap items-end gap-2">
          <Input
            type="date"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
            className="flex-1"
          />
          <Input
            type="date"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => onChange({ periodType: "custom", dateFrom: customFrom, dateTo: customTo })}
            disabled={!customFrom || !customTo}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
