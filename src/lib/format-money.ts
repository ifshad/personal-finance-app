/**
 * Display-only formatting for an already-computed decimal string (e.g.
 * "1500.00"). Never use this for calculation — see src/server/services/money.ts
 * for exact arithmetic. `Number()` here only feeds Intl's formatter.
 */
export function formatAmount(decimalString: string): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(decimalString));
}

export function formatMoney(decimalString: string, currency: string): string {
  return `${currency} ${formatAmount(decimalString)}`;
}
