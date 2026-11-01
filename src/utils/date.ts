/** @format */

/**
 * @fileOverview date
 * @description Date helpers that derive calendar keys from the device's local
 * date (fixing the reference app's UTC off-by-one bug). Purchase timestamps are
 * stored at local noon so the stored ISO string maps back to the same calendar
 * day.
 *
 * Provides `toDateKey`, `todayDateKey`, `dateKeyOf`, `monthKeyOf`,
 * `currentMonthKey`, `atLocalNoon`, `formatDateLabel`, `formatLongDate`,
 * `formatMonthYear`, `daysInMonth`, `firstWeekdayOfMonth`, `todayParts`,
 * and `normaliseIsoTimestamp`.
 *
 * @module src/utils/date
 * @author Coderooz
 */

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateKey(): string {
  return toDateKey(new Date());
}

/** Calendar day (`YYYY-MM-DD`) of an ISO timestamp, in device local time. */
export function dateKeyOf(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso.slice(0, 10);
  return toDateKey(parsed);
}

/** Calendar month (`YYYY-MM`) of an ISO timestamp, in device local time. */
export function monthKeyOf(iso: string): string {
  return dateKeyOf(iso).slice(0, 7);
}

export function currentMonthKey(): string {
  return toDateKey(new Date()).slice(0, 7);
}

/** ISO timestamp at local noon for a `YYYY-MM-DD` key. */
export function atLocalNoon(dateKey: string): string {
  const parsed = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

export function formatDateLabel(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  } catch {
    return toDateKey(parsed);
  }
}

export function formatLongDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return toDateKey(date);
  }
}

export function formatMonthYear(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  try {
    return new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return `${monthIndex + 1}/${year}`;
  }
}

/** Days in a month (1-based month number). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Weekday index of the first day of a month (0 = Sunday). */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function todayParts(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/** Accepts a `YYYY-MM-DD` key or a full ISO timestamp; returns ISO or undefined. */
export function normaliseIsoTimestamp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}
