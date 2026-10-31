/**
 * @format
 * @coderooz
 * @author Ranit Saha <coderooz.dev@gmail.com>
 * @filePath src/constants/purchases.constants.ts
 * @accessPath @/constants/purchases.constants
 * @description Constants and configuration values related to purchases.
 * @created 2026-10-30
 * @lastModified 2026-10-30
 * @version 2.0.0
 */

/**
 * Supported purchase measurement units.
 *
 * These values describe how a product is measured or packaged.
 * Keep the keys stable because they may be persisted in the database.
 */
export const PURCHASE_UNITS = {
  ML: "ml",
  L: "l",
  G: "g",
  KG: "kg",
  MG: "mg",
  PCS: "pcs",
  PACKET: "packet",
  PACK: "pack",
  BOX: "box",
  BOTTLE: "bottle",
  CAN: "can",
  DOZEN: "dozen",
  BUNDLE: "bundle",
  UNIT: "unit",
} as const;

/**
 * Display labels for supported purchase units.
 */
export const PURCHASE_UNIT_LABELS = {
  [PURCHASE_UNITS.ML]: "Millilitres",
  [PURCHASE_UNITS.L]: "Litres",
  [PURCHASE_UNITS.G]: "Grams",
  [PURCHASE_UNITS.KG]: "Kilograms",
  [PURCHASE_UNITS.MG]: "Milligrams",
  [PURCHASE_UNITS.PCS]: "Pieces",
  [PURCHASE_UNITS.PACKET]: "Packets",
  [PURCHASE_UNITS.PACK]: "Packs",
  [PURCHASE_UNITS.BOX]: "Boxes",
  [PURCHASE_UNITS.BOTTLE]: "Bottles",
  [PURCHASE_UNITS.CAN]: "Cans",
  [PURCHASE_UNITS.DOZEN]: "Dozens",
  [PURCHASE_UNITS.BUNDLE]: "Bundles",
  [PURCHASE_UNITS.UNIT]: "Units",
} as const;

/**
 * Purchase lifecycle states.
 *
 * PLANNED: Purchase is intended but has not been completed.
 * COMPLETED: Actual purchase has been recorded.
 * CANCELLED: The purchase intention/record was cancelled.
 * RETURNED: A completed purchase was returned.
 *
 * Note: A shopping-list item's checked state is not represented here.
 */
export const PURCHASE_STATUS = {
  PLANNED: "planned",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURNED: "returned",
} as const;

/**
 * Purchase status display labels.
 */
export const PURCHASE_STATUS_LABELS = {
  [PURCHASE_STATUS.PLANNED]: "Planned",
  [PURCHASE_STATUS.COMPLETED]: "Completed",
  [PURCHASE_STATUS.CANCELLED]: "Cancelled",
  [PURCHASE_STATUS.RETURNED]: "Returned",
} as const;

/**
 * Purchase action types.
 *
 * Useful for activity logs, audit history, and UI action tracking.
 */
export const PURCHASE_ACTIONS = {
  CREATED: "created",
  UPDATED: "updated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURNED: "returned",
} as const;

/**
 * Supported purchase sorting options.
 */
export const PURCHASE_SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  PRICE_LOW_TO_HIGH: "price_low_to_high",
  PRICE_HIGH_TO_LOW: "price_high_to_low",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
} as const;

/**
 * Default purchase configuration.
 */
export const PURCHASE_DEFAULTS = {
  STATUS: PURCHASE_STATUS.COMPLETED,
  UNIT: PURCHASE_UNITS.UNIT,
  CURRENCY: "INR",
} as const;

/**
 * Purchase validation limits.
 */
export const PURCHASE_LIMITS = {
  PRODUCT_NAME_MAX_LENGTH: 150,
  NOTES_MAX_LENGTH: 1000,
  MIN_QUANTITY: 0.001,
  MAX_QUANTITY: 1_000_000,
  MIN_PRICE: 0,
} as const;

/**
 * Type-safe values derived from constants.
 */
export type PurchaseUnitValue =
  (typeof PURCHASE_UNITS)[keyof typeof PURCHASE_UNITS];

export type PurchaseStatusValue =
  (typeof PURCHASE_STATUS)[keyof typeof PURCHASE_STATUS];

export type PurchaseActionValue =
  (typeof PURCHASE_ACTIONS)[keyof typeof PURCHASE_ACTIONS];

export type PurchaseSortValue =
  (typeof PURCHASE_SORT_OPTIONS)[keyof typeof PURCHASE_SORT_OPTIONS];
