// Money helpers. All amounts are integer MINOR units — never floats.

/** Number of decimal places per ISO currency. RWF/UGX/BIF have none. */
const CURRENCY_EXPONENT: Record<string, number> = {
  RWF: 0,
  UGX: 0,
  BIF: 0,
  KES: 2,
  TZS: 2,
  USD: 2,
  EUR: 2,
};

export function currencyExponent(currency: string): number {
  return CURRENCY_EXPONENT[currency.toUpperCase()] ?? 2;
}

/** Format integer minor units for display, e.g. formatMoney(5000, "RWF") → "RWF 5,000". */
export function formatMoney(minor: number, currency: string): string {
  if (!Number.isInteger(minor)) throw new Error("Money amounts must be integers (minor units)");
  const exp = currencyExponent(currency);
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const divisor = 10 ** exp;
  const major = Math.floor(abs / divisor);
  const fraction = abs % divisor;
  const majorStr = major.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = exp > 0 ? `${majorStr}.${fraction.toString().padStart(exp, "0")}` : majorStr;
  return `${negative ? "-" : ""}${currency.toUpperCase()} ${body}`;
}

/** Parse a user-typed major-unit amount ("5,000" or "12.50") into integer minor units without floats. */
export function parseMoneyInput(value: string, currency: string): number | null {
  const exp = currencyExponent(currency);
  const cleaned = value.replace(/[,\s]/g, "").trim();
  const pattern = exp > 0 ? new RegExp(`^\\d+(\\.\\d{1,${exp}})?$`) : /^\d+$/;
  if (!pattern.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const minor = BigInt(whole) * BigInt(10 ** exp) + BigInt((frac + "0".repeat(exp)).slice(0, exp) || "0");
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(minor);
}

/** Convert minor units back to an editable major-unit string (for admin forms). */
export function minorToInput(minor: number, currency: string): string {
  const exp = currencyExponent(currency);
  if (exp === 0) return String(minor);
  const divisor = 10 ** exp;
  return `${Math.floor(minor / divisor)}.${(minor % divisor).toString().padStart(exp, "0")}`;
}
