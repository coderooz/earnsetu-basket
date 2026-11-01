/** @format */

/**
 * @fileOverview cn
 * @description Class-name joiner for NativeWind. Joins truthy class names into
 * a single string (NativeWind accepts a plain string).
 *
 * @module src/utils/cn
 * @author Coderooz
 */

export function cn(
  ...values: (string | false | null | undefined)[]
): string {
  return values.filter(Boolean).join(" ");
}
