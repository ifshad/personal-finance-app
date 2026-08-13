"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { BudgetItemRow } from "./budget-item-row";
import { AddBudgetItemDialog } from "./add-budget-item-dialog";
import { EditBudgetItemDialog } from "./edit-budget-item-dialog";
import { formatMoney } from "@/lib/format-money";
import type { BudgetDto, BudgetItemDto } from "@/server/services/budgets.service";
import type { CategoryDto } from "@/server/services/categories.service";

type BudgetDetailViewProps = {
  budget: BudgetDto;
  categories: CategoryDto[];
  currency: string;
};

function formatPeriodLabel(periodStart: string): string {
  const date = new Date(`${periodStart}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function BudgetDetailView({ budget, categories, currency }: BudgetDetailViewProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItemDto | undefined>();

  const overallPercentage = budget.percentageUsed ?? 0;
  const isOverBudget = overallPercentage > 100;

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {budget.name || formatPeriodLabel(budget.periodStart)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatPeriodLabel(budget.periodStart)}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-foreground">
            {formatMoney(budget.totalActual, currency)}
          </span>
          <span className="text-sm text-muted-foreground">
            of {formatMoney(budget.totalPlanned, currency)}
          </span>
        </div>
        <Progress value={Math.min(overallPercentage, 100)}>
          <ProgressTrack>
            <ProgressIndicator className={isOverBudget ? "bg-destructive" : "bg-primary"} />
          </ProgressTrack>
        </Progress>
        <p className="text-xs text-muted-foreground">
          {isOverBudget
            ? `Over budget by ${formatMoney(budget.totalVariance.replace("-", ""), currency)}`
            : `${formatMoney(budget.totalVariance, currency)} remaining`}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Categories</h2>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add
          </Button>
        </div>

        {budget.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Add categories and planned amounts to start tracking this budget.
          </p>
        ) : (
          <ul className="space-y-2">
            {budget.items.map((item) => (
              <li key={item.id}>
                <BudgetItemRow item={item} currency={currency} onClick={() => setEditingItem(item)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddBudgetItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        budgetId={budget.id}
        categories={categories}
        existingCategoryIds={budget.items.map((item) => item.categoryId)}
      />
      <EditBudgetItemDialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => !open && setEditingItem(undefined)}
        budgetId={budget.id}
        item={editingItem}
      />
    </div>
  );
}
