"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateBudgetDialog } from "./create-budget-dialog";
import { formatMoney } from "@/lib/format-money";
import type { BudgetDto } from "@/server/services/budgets.service";

type BudgetsViewProps = {
  budgets: BudgetDto[];
  currency: string;
};

function formatPeriodLabel(periodStart: string): string {
  const date = new Date(`${periodStart}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function BudgetsView({ budgets, currency }: BudgetsViewProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Budgets</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Create
        </Button>
      </div>

      {budgets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Create a monthly budget to compare your plan with actual spending.
        </p>
      ) : (
        <ul className="space-y-2">
          {budgets.map((budget) => (
            <li key={budget.id}>
              <Link
                href={`/budgets/${budget.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {budget.name || formatPeriodLabel(budget.periodStart)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(budget.totalActual, currency)} of{" "}
                    {formatMoney(budget.totalPlanned, currency)}
                  </p>
                </div>
                {budget.percentageUsed !== null && (
                  <Badge variant={budget.percentageUsed > 100 ? "destructive" : "secondary"}>
                    {budget.percentageUsed}%
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateBudgetDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
