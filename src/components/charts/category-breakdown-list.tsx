import { formatMoney } from "@/lib/format-money";
import { CATEGORICAL_PALETTE } from "./chart-colors";
import type { CategoryBreakdownItem } from "@/server/services/category-breakdown.service";

const MAX_VISIBLE = 8;

type CategoryBreakdownListProps = {
  items: CategoryBreakdownItem[];
  currency: string;
};

/**
 * Directly-labeled horizontal bars rather than a pie/donut — every entry
 * shows its own name and amount, so identity never depends on color alone.
 * Beyond 8 categories the rest fold into "Other" (dataviz skill: a 9th
 * series is never a generated hue).
 */
export function CategoryBreakdownList({ items, currency }: CategoryBreakdownListProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No expenses recorded for this period yet.
      </p>
    );
  }

  const visible = items.slice(0, MAX_VISIBLE);
  const rest = items.slice(MAX_VISIBLE);
  const maxAmount = Math.max(...items.map((item) => Number(item.total)));

  const rows = [...visible];
  if (rest.length > 0) {
    const otherTotal = rest.reduce((sum, item) => sum + Number(item.total), 0);
    rows.push({ categoryId: -1, categoryName: "Other", total: otherTotal.toFixed(2) });
  }

  return (
    <ul className="space-y-3">
      {rows.map((item, index) => {
        const amount = Number(item.total);
        const widthPercent = maxAmount > 0 ? Math.max((amount / maxAmount) * 100, 4) : 0;
        const color = CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length];

        return (
          <li key={item.categoryId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{item.categoryName}</span>
              <span className="text-muted-foreground">{formatMoney(item.total, currency)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${widthPercent}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
