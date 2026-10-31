/**
 * @format
 * @coderooz
 * @author Ranit Saha <coderooz.dev@gmail.com>
 * @filePath src/constants/user.constants.ts
 * @accessPath @/constants/user.constants
 * @description Constants and configuration values related to users and user management.
 * @created 2026-10-30
 * @lastModified 2026-10-30
 * @version 2.0.0
 */

/**
 * User account lifecycle status.
 */
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

/**
 * User account roles.
 *
 * These are application-level roles, not authentication-provider roles.
 */
export const USER_ROLES = {
  OWNER: "owner",
  MEMBER: "member",
  ADMIN: "admin",
} as const;

/**
 * Supported contact methods.
 */
export const USER_CONTACT_TYPES = {
  PHONE: "phone",
  EMAIL: "email",
} as const;

/**
 * Supported gender values.
 *
 * Optional profile information. Do not require this field.
 */
export const USER_GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer_not_to_say",
} as const;

/**
 * Supported theme preferences.
 */
export const USER_THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

/**
 * Supported application languages.
 */
export const USER_LOCALES = {
  ENGLISH: "en",
  ENGLISH_INDIA: "en-IN",
  HINDI: "hi",
  ASSAMESE: "as",
} as const;

/**
 * Default user configuration.
 */
export const USER_DEFAULTS = {
  STATUS: USER_STATUS.ACTIVE,
  ROLE: USER_ROLES.MEMBER,
  THEME: USER_THEME.SYSTEM,
  LOCALE: USER_LOCALES.ENGLISH_INDIA,
  COUNTRY_CODE: "IN",
  CURRENCY: "INR",
} as const;

/**
 * User validation limits.
 */
export const USER_LIMITS = {
  FIRST_NAME_MAX_LENGTH: 100,
  MIDDLE_NAME_MAX_LENGTH: 100,
  LAST_NAME_MAX_LENGTH: 100,
  DISPLAY_NAME_MAX_LENGTH: 150,
  PHONE_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 254,
} as const;

/**
 * Type-safe values derived from constants.
 */
export type UserStatusValue = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type UserContactTypeValue =
  (typeof USER_CONTACT_TYPES)[keyof typeof USER_CONTACT_TYPES];

export type UserGenderValue = (typeof USER_GENDER)[keyof typeof USER_GENDER];

export type UserThemeValue = (typeof USER_THEME)[keyof typeof USER_THEME];

export type UserLocaleValue = (typeof USER_LOCALES)[keyof typeof USER_LOCALES];
