/** @format */

/**
 * @fileOverview text
 * @description Text utilities: normalised name keys (for product identity),
 * cleaned names, de-duplicated name lists, comma-list splitting, and
 * case-insensitive substring matching.
 *
 * @module src/utils/text
 * @author Coderooz
 */

export function normaliseNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Trim and collapse internal whitespace, keeping the user's casing. */
export function cleanName(name: string, maxLength = 100): string {
  return name.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

/**
 * Build a stable, de-duplicated list of display names.
 * Later occurrences win, so a renamed/most-recent spelling is shown while the
 * identity key stays the same.
 */
export function uniqueNames(values: readonly string[]): string[] {
  const byKey = new Map<string, string>();
  for (const value of values) {
    const cleaned = cleanName(value);
    if (!cleaned) continue;
    byKey.set(normaliseNameKey(cleaned), cleaned);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

export function splitCommaList(value: string): string[] {
  return uniqueNames(value.split(","));
}

export function includesQuery(
  haystack: readonly (string | undefined | null)[],
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return haystack.some((value) => (value ?? "").toLowerCase().includes(needle));
}
