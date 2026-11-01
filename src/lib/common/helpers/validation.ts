/** @format */

/**
 * @fileOverview validation
 * @description Shared form-validation helpers. Defines `ValidationError` and
 * validation predicates (`requireText`, `requireIdentifier`,
 * `requirePositiveNumber`, `requireNonNegativeMinor`, `optionalText`) plus
 * `toUserMessage` for converting errors to user-safe strings. All messages are
 * safe to render directly in a form.
 *
 * @module src/lib/common/helpers/validation
 * @author Coderooz
 * @see {@link @/constants/basket.constants#LIMITS}
 */

import { LIMITS } from "@/constants/basket.constants";

/** A user-correctable problem. The message is safe to show in a form. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function requireText(
  value: string | undefined | null,
  label: string,
  maxLength: number = LIMITS.nameMaxLength,
): string {
  const cleaned = (value ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) throw new ValidationError(`Enter ${label}.`);
  if (cleaned.length > maxLength) {
    throw new ValidationError(`${label} must be ${maxLength} characters or fewer.`);
  }
  return cleaned;
}

export function requireIdentifier(
  value: string | undefined | null,
  label: string,
): string {
  const cleaned = (value ?? "").trim();
  if (!cleaned) throw new ValidationError(`Choose ${label}.`);
  return cleaned;
}

export function requirePositiveNumber(
  value: number | undefined | null,
  label: string,
): number {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${label} must be greater than zero.`);
  }
  return value;
}

export function requireNonNegativeMinor(
  value: number | undefined | null,
  label: string,
): number {
  if (value === undefined || value === null || !Number.isFinite(value) || value < 0) {
    throw new ValidationError(`Enter a valid ${label.toLowerCase()}.`);
  }
  return Math.round(value);
}

export function optionalText(
  value: string | undefined | null,
  maxLength = 500,
): string | undefined {
  const cleaned = (value ?? "").trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
}

export function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
