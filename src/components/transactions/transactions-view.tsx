"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionRow } from "./transaction-row";
import { TransactionFormSheet } from "./transaction-form-sheet";
import { apiRequest } from "@/lib/api-client";
import type { AccountWithBalance } from "@/server/services/accounts.service";
import type { CategoryDto } from "@/server/services/categories.service";
import type { TransactionDto } from "@/server/services/transactions.service";
import type { TransactionType } from "@/types/db";

type TransactionsListResult = {
  transactions: TransactionDto[];
  page: number;
  pageSize: number;
  total: number;
};

type TransactionsViewProps = {
  initial: TransactionsListResult;
  accounts: AccountWithBalance[];
  categories: CategoryDto[];
  currency: string;
};

const TYPE_FILTERS: Array<{ value: TransactionType | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
  { value: "TRANSFER", label: "Transfer" },
];

function groupByDate(transactions: TransactionDto[]): Array<[string, TransactionDto[]]> {
  const groups = new Map<string, TransactionDto[]>();
  for (const transaction of transactions) {
    const existing = groups.get(transaction.transactionDate) ?? [];
    existing.push(transaction);
    groups.set(transaction.transactionDate, existing);
  }
  return Array.from(groups.entries());
}

function formatDateHeading(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function TransactionsView({
  initial,
  accounts,
  categories,
  currency,
}: TransactionsViewProps) {
  const [transactions, setTransactions] = useState(initial.transactions);
  const [page, setPage] = useState(initial.page);
  const [total, setTotal] = useState(initial.total);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | undefined>();

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  async function loadPage(nextPage: number, filter: TransactionType | "ALL", replace: boolean) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), pageSize: "20" });
      if (filter !== "ALL") params.set("type", filter);

      const result = await apiRequest<TransactionsListResult>(
        `/api/transactions?${params.toString()}`,
      );
      setTransactions((prev) => (replace ? result.transactions : [...prev, ...result.transactions]));
      setPage(result.page);
      setTotal(result.total);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(value: string | null) {
    const filter = (value ?? "ALL") as TransactionType | "ALL";
    setTypeFilter(filter);
    void loadPage(1, filter, true);
  }

  function handleSaved() {
    void loadPage(1, typeFilter, true);
  }

  const groups = groupByDate(transactions);
  const hasMore = transactions.length < total;

  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Transactions</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus />
          Add
        </Button>
      </div>

      <Select value={typeFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_FILTERS.map((filter) => (
            <SelectItem key={filter.value} value={filter.value}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {transactions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No transactions yet. Add your first income or expense.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(([date, items]) => (
            <div key={date} className="space-y-2">
              <h2 className="text-xs font-medium text-muted-foreground">
                {formatDateHeading(date)}
              </h2>
              <ul className="space-y-1.5">
                {items.map((transaction) => (
                  <li key={transaction.id}>
                    <TransactionRow
                      transaction={transaction}
                      currency={currency}
                      accountNames={accountsById}
                      categoryNames={categoriesById}
                      onClick={() => setEditingTransaction(transaction)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => void loadPage(page + 1, typeFilter, false)}
            >
              {isLoading ? "Loading…" : "Load more"}
            </Button>
          )}
        </div>
      )}

      <TransactionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        accounts={accounts}
        categories={categories}
        onSaved={handleSaved}
      />
      <TransactionFormSheet
        open={Boolean(editingTransaction)}
        onOpenChange={(open) => !open && setEditingTransaction(undefined)}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        onSaved={handleSaved}
      />
    </div>
  );
}
