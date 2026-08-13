/**
 * Exact decimal money arithmetic, backed by integer minor units (cents).
 *
 * MySQL's DECIMAL(15,2) columns come back from mysql2 as strings, not JS
 * numbers — this class is the one place that turns those strings into
 * something we can safely add/subtract without floating point error, and
 * back into a canonical "123.45" string for storage/display. Every
 * financial calculation (balances, budgets, reports, safe-to-spend) should
 * go through this instead of `parseFloat`/`Number` arithmetic.
 */
export class Money {
  private readonly minorUnits: bigint;

  private constructor(minorUnits: bigint) {
    this.minorUnits = minorUnits;
  }

  static zero(): Money {
    return new Money(0n);
  }

  /** Parses a decimal string like "1234.50", "-12", or "0.1". */
  static fromDecimalString(value: string): Money {
    const trimmed = value.trim();
    const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
    if (!match) {
      throw new Error(`Invalid decimal amount: "${value}"`);
    }

    const [, sign, whole, fraction = ""] = match;
    const paddedFraction = fraction.padEnd(2, "0");
    const minorUnits = BigInt(whole + paddedFraction) * (sign === "-" ? -1n : 1n);
    return new Money(minorUnits);
  }

  /** Accepts a value already known to be a valid decimal string or number. */
  static from(value: string | number): Money {
    return Money.fromDecimalString(String(value));
  }

  add(other: Money): Money {
    return new Money(this.minorUnits + other.minorUnits);
  }

  subtract(other: Money): Money {
    return new Money(this.minorUnits - other.minorUnits);
  }

  isNegative(): boolean {
    return this.minorUnits < 0n;
  }

  isPositive(): boolean {
    return this.minorUnits > 0n;
  }

  isZero(): boolean {
    return this.minorUnits === 0n;
  }

  compare(other: Money): -1 | 0 | 1 {
    if (this.minorUnits === other.minorUnits) return 0;
    return this.minorUnits > other.minorUnits ? 1 : -1;
  }

  /** Canonical "123.45" / "-12.00" string, suitable for storage/API responses. */
  toDecimalString(): string {
    const negative = this.minorUnits < 0n;
    const absUnits = negative ? -this.minorUnits : this.minorUnits;
    const whole = absUnits / 100n;
    const fraction = absUnits % 100n;
    const sign = negative && absUnits !== 0n ? "-" : "";
    return `${sign}${whole}.${fraction.toString().padStart(2, "0")}`;
  }

  /**
   * Lossy conversion for contexts where a plain number is fine (e.g. chart
   * data). Never use this output for further authoritative calculation.
   */
  toNumber(): number {
    return Number(this.toDecimalString());
  }
}

export function sumMoney(values: Money[]): Money {
  return values.reduce((total, value) => total.add(value), Money.zero());
}
