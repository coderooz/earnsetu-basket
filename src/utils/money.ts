/** @format */

/**
 * @fileOverview money
 * @description Money utilities using integer minor units (paise/cents) to avoid
 * floating-point error. Converts between major and minor units, parses user
 * price input, and formats minor units as a currency string via `Intl.NumberFormat`
 * with a deterministic fallback.
 *
 * Default currency is INR. All planning prices are optional and stored as minor
 * units.
 *
 * @module src/utils/money
 * @author Coderooz
 * @see {@link @/constants/basket.constants#DEFAULT_CURRENCY}
 */

import { DEFAULT_CURRENCY } from "@/constants/basket.constants";

const FALLBACK_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/** Convert a user-entered major-unit amount (e.g. `60.25`) to minor units. */
export function toMinorUnits(value: number): number {
  return Math.round(value * 100);
}

/** Convert minor units back to a plain major-unit number for form editing. */
export function fromMinorUnits(minor: number | undefined | null): number | null {
  if (minor === undefined || minor === null || !Number.isFinite(minor)) {
    return null;
  }
  return minor / 100;
}

/**
 * Parse a price input into minor units.
 * Returns `null` for empty or invalid input so callers can treat it as
 * "not provided" (all planning prices are optional).
 */
export function parseAmountInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const value = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(value) || value < 0) return null;
  return toMinorUnits(value);
}

function fallbackFormat(minor: number, currency: string): string {
  const symbol = FALLBACK_SYMBOLS[currency] ?? currency + " ";
  const amount = (Math.abs(minor) / 100).toFixed(2);
  const [whole, decimals] = amount.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = minor < 0 ? "-" : "";
  return `${sign}${symbol}${grouped}.${decimals}`;
}

/**
 * Format integer minor units as a currency string.
 * Uses `Intl` when the runtime provides it (Hermes ships full ICU on both
 * platforms) and falls back to a deterministic formatter otherwise.
 */
export function formatMoney(
  minor: number | undefined | null,
  currency: string = DEFAULT_CURRENCY,
): string {
  const value = Number.isFinite(minor ?? NaN) ? (minor as number) : 0;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value / 100);
  } catch {
    return fallbackFormat(value, currency);
  }
}
