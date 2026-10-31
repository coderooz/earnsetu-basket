/**
 * @format
 * @coderooz
 * @author Ranit Saha <coderooz.dev@gmail.com>
 * @filePath src/constants/product.constants.ts
 * @accessPath @/constants/product.constants
 * @description Constants and configuration values related to products and the product catalogue.
 * @created 2026-10-30
 * @lastModified 2026-10-30
 * @version 2.0.0
 */

/**
 * Product lifecycle status.
 */
export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  DISCONTINUED: "discontinued",
} as const;

/**
 * Product classification.
 */
export const PRODUCT_TYPES = {
  GENERAL: "general",
  GROCERY: "grocery",
  FOOD: "food",
  BEVERAGE: "beverage",
  HOUSEHOLD: "household",
  PERSONAL_CARE: "personal_care",
  ELECTRONICS: "electronics",
  CLOTHING: "clothing",
  MEDICINE: "medicine",
  OTHER: "other",
} as const;

/**
 * Supported product measurement units.
 *
 * These are catalogue-level units, not purchase quantities.
 */
export const PRODUCT_UNITS = {
  ML: "ml",
  L: "l",
  MG: "mg",
  G: "g",
  KG: "kg",
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
 * Product unit display labels.
 */
export const PRODUCT_UNIT_LABELS = {
  [PRODUCT_UNITS.ML]: "Millilitres",
  [PRODUCT_UNITS.L]: "Litres",
  [PRODUCT_UNITS.MG]: "Milligrams",
  [PRODUCT_UNITS.G]: "Grams",
  [PRODUCT_UNITS.KG]: "Kilograms",
  [PRODUCT_UNITS.PCS]: "Pieces",
  [PRODUCT_UNITS.PACKET]: "Packets",
  [PRODUCT_UNITS.PACK]: "Packs",
  [PRODUCT_UNITS.BOX]: "Boxes",
  [PRODUCT_UNITS.BOTTLE]: "Bottles",
  [PRODUCT_UNITS.CAN]: "Cans",
  [PRODUCT_UNITS.DOZEN]: "Dozens",
  [PRODUCT_UNITS.BUNDLE]: "Bundles",
  [PRODUCT_UNITS.UNIT]: "Units",
} as const;

/**
 * Product image types.
 */
export const PRODUCT_IMAGE_TYPES = {
  PRIMARY: "primary",
  GALLERY: "gallery",
  THUMBNAIL: "thumbnail",
} as const;

/**
 * Product visibility.
 */
export const PRODUCT_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

/**
 * Product sorting options.
 */
export const PRODUCT_SORT_OPTIONS = {
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  PRICE_LOW_TO_HIGH: "price_low_to_high",
  PRICE_HIGH_TO_LOW: "price_high_to_low",
  NEWEST: "newest",
  OLDEST: "oldest",
} as const;

/**
 * Default product configuration.
 */
export const PRODUCT_DEFAULTS = {
  STATUS: PRODUCT_STATUS.ACTIVE,
  TYPE: PRODUCT_TYPES.GENERAL,
  UNIT: PRODUCT_UNITS.UNIT,
  VISIBILITY: PRODUCT_VISIBILITY.PRIVATE,
  CURRENCY: "INR",
} as const;

/**
 * Product validation limits.
 */
export const PRODUCT_LIMITS = {
  NAME_MAX_LENGTH: 200,
  SLUG_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  SKU_MAX_LENGTH: 100,
  BARCODE_MAX_LENGTH: 100,
  BRAND_MAX_LENGTH: 100,
  TAGS_MAX_COUNT: 30,
  IMAGES_MAX_COUNT: 10,
} as const;

/**
 * Type-safe values derived from constants.
 */
export type ProductStatusValue =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export type ProductTypeValue =
  (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];

export type ProductUnitValue =
  (typeof PRODUCT_UNITS)[keyof typeof PRODUCT_UNITS];

export type ProductImageTypeValue =
  (typeof PRODUCT_IMAGE_TYPES)[keyof typeof PRODUCT_IMAGE_TYPES];

export type ProductVisibilityValue =
  (typeof PRODUCT_VISIBILITY)[keyof typeof PRODUCT_VISIBILITY];

export type ProductSortValue =
  (typeof PRODUCT_SORT_OPTIONS)[keyof typeof PRODUCT_SORT_OPTIONS];
