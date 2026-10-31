/**
 * @format
 * @coderooz
 * @author Ranit Saha <coderooz.dev@gmail.com>
 * @filePath src/constants/shops.constants.ts
 * @accessPath @/constants/shops.constants
 * @description Constants and configuration values related to shops and shop management.
 * @created 2026-10-30
 * @lastModified 2026-10-30
 * @version 2.0.0
 */

/**
 * Shop lifecycle status.
 */
export const SHOP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  CLOSED: "closed",
} as const;

/**
 * Shop classification.
 */
export const SHOP_TYPES = {
  GENERAL: "general",
  GROCERY: "grocery",
  SUPERMARKET: "supermarket",
  DEPARTMENTAL: "departmental",
  PHARMACY: "pharmacy",
  RESTAURANT: "restaurant",
  ELECTRONICS: "electronics",
  CLOTHING: "clothing",
  HARDWARE: "hardware",
  WHOLESALE: "wholesale",
  OTHER: "other",
} as const;

/**
 * Contact information types.
 */
export const SHOP_CONTACT_TYPES = {
  PHONE: "phone",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
} as const;

/**
 * Address types.
 */
export const SHOP_ADDRESS_TYPES = {
  PRIMARY: "primary",
  BILLING: "billing",
  DELIVERY: "delivery",
  BRANCH: "branch",
} as const;

/**
 * Shop ownership/relationship classification.
 *
 * These describe how the user maintains the shop entry.
 * They do not imply official merchant registration.
 */
export const SHOP_RELATION_TYPES = {
  PERSONAL: "personal",
  FAVORITE: "favorite",
  FREQUENT: "frequent",
  OTHER: "other",
} as const;

/**
 * Shop sorting options.
 */
export const SHOP_SORT_OPTIONS = {
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  NEWEST: "newest",
  OLDEST: "oldest",
  NEAREST: "nearest",
} as const;

/**
 * Default shop configuration.
 */
export const SHOP_DEFAULTS = {
  STATUS: SHOP_STATUS.ACTIVE,
  TYPE: SHOP_TYPES.GENERAL,
  RELATION: SHOP_RELATION_TYPES.PERSONAL,
  COUNTRY_CODE: "IN",
} as const;

/**
 * Shop validation limits.
 */
export const SHOP_LIMITS = {
  NAME_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  PHONE_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 254,
  ADDRESS_MAX_LENGTH: 300,
  POSTAL_CODE_MAX_LENGTH: 20,
  CONTACTS_MAX_COUNT: 10,
  ADDRESSES_MAX_COUNT: 10,
} as const;

/**
 * Type-safe values derived from constants.
 */
export type ShopStatusValue = (typeof SHOP_STATUS)[keyof typeof SHOP_STATUS];

export type ShopTypeValue = (typeof SHOP_TYPES)[keyof typeof SHOP_TYPES];

export type ShopContactTypeValue =
  (typeof SHOP_CONTACT_TYPES)[keyof typeof SHOP_CONTACT_TYPES];

export type ShopAddressTypeValue =
  (typeof SHOP_ADDRESS_TYPES)[keyof typeof SHOP_ADDRESS_TYPES];

export type ShopRelationTypeValue =
  (typeof SHOP_RELATION_TYPES)[keyof typeof SHOP_RELATION_TYPES];

export type ShopSortValue =
  (typeof SHOP_SORT_OPTIONS)[keyof typeof SHOP_SORT_OPTIONS];
