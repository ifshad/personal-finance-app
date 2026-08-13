import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format-money";
import type { BudgetItemDto } from "@/server/services/budgets.service";

type BudgetItemRowProps = {
  item: BudgetItemDto;
  currency: string;
  onClick: () => void;
};

export function BudgetItemRow({ item, currency, onClick }: BudgetItemRowProps) {
  const percentage = item.percentageUsed ?? 0;
  const barValue = Math.min(percentage, 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full space-y-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{item.categoryName}</span>
        {item.isOverBudget ? (
          <Badge variant="destructive">Over budget</Badge>
        ) : item.percentageUsed !== null ? (
          <span className="text-xs text-muted-foreground">{item.percentageUsed}%</span>
        ) : null}
      </div>
      <Progress value={barValue}>
        <ProgressTrack>
          <ProgressIndicator
            className={item.isOverBudget ? "bg-destructive" : "bg-primary"}
          />
        </ProgressTrack>
      </Progress>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatMoney(item.actualAmount, currency)} spent</span>
        <span>{formatMoney(item.plannedAmount, currency)} planned</span>
      </div>
    </button>
  );
}
