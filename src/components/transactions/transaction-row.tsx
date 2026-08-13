import { formatMoney } from "@/lib/format-money";
import type { TransactionDto } from "@/server/services/transactions.service";

type TransactionRowProps = {
  transaction: TransactionDto;
  currency: string;
  accountName: (id: number | null) => string;
  categoryName: (id: number | null) => string;
  onClick: () => void;
};

const AMOUNT_STYLES: Record<TransactionDto["type"], string> = {
  INCOME: "text-primary",
  EXPENSE: "text-destructive",
  TRANSFER: "text-muted-foreground",
};

const AMOUNT_PREFIX: Record<TransactionDto["type"], string> = {
  INCOME: "+",
  EXPENSE: "-",
  TRANSFER: "",
};

export function TransactionRow({
  transaction,
  currency,
  accountName,
  categoryName,
  onClick,
}: TransactionRowProps) {
  const title =
    transaction.type === "TRANSFER"
      ? `${accountName(transaction.fromAccountId)} → ${accountName(transaction.toAccountId)}`
      : categoryName(transaction.categoryId);

  const subtitle =
    transaction.description ||
    (transaction.type === "TRANSFER" ? "Transfer" : accountName(transaction.accountId));

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span className={`shrink-0 pl-3 text-sm font-semibold ${AMOUNT_STYLES[transaction.type]}`}>
        {AMOUNT_PREFIX[transaction.type]}
        {formatMoney(transaction.amount, currency)}
      </span>
    </button>
  );
}
