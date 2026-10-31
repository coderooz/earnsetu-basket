/**
 * @format
 * @coderooz
 * @author Ranit Saha <coderooz.dev@gmail.com>
 * @filePath src/constants/pages.constants.ts
 * @accessPath @/constants/pages.constants
 * @description Constants and configuration values related to application pages and content management.
 * @created 2026-10-30
 * @lastModified 2026-10-30
 * @version 2.0.0
 */

/**
 * Supported page categories.
 *
 * These categories help organize static and informational pages.
 */
export const PAGE_TYPES = {
  LEGAL: "legal",
  POLICY: "policy",
  INFORMATIONAL: "informational",
  SUPPORT: "support",
  CUSTOM: "custom",
} as const;

/**
 * Common page identifiers.
 *
 * These are suggested identifiers for commonly used application pages.
 */
export const PAGE_IDENTIFIERS = {
  PRIVACY_POLICY: "privacy-policy",
  TERMS_AND_CONDITIONS: "terms-and-conditions",
  COOKIE_POLICY: "cookie-policy",
  REFUND_POLICY: "refund-policy",
  CANCELLATION_POLICY: "cancellation-policy",
  ABOUT_US: "about-us",
  CONTACT_US: "contact-us",
  HELP_AND_SUPPORT: "help-and-support",
} as const;

/**
 * Page publishing lifecycle.
 */
export const PAGE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

/**
 * Supported content formats.
 *
 * HTML is useful for rich-text page rendering.
 * Markdown is useful for portable content storage.
 * Plain text is useful for simple informational content.
 */
export const PAGE_CONTENT_FORMATS = {
  HTML: "html",
  MARKDOWN: "markdown",
  TEXT: "text",
} as const;

/**
 * Supported page visibility.
 */
export const PAGE_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  AUTHENTICATED: "authenticated",
} as const;

/**
 * Default page configuration.
 */
export const PAGE_DEFAULTS = {
  TYPE: PAGE_TYPES.CUSTOM,
  STATUS: PAGE_STATUS.DRAFT,
  CONTENT_FORMAT: PAGE_CONTENT_FORMATS.HTML,
  VISIBILITY: PAGE_VISIBILITY.PUBLIC,
  LOCALE: "en",
} as const;

/**
 * Default SEO configuration.
 */
export const PAGE_SEO_DEFAULTS = {
  INDEX: true,
  FOLLOW: true,
  OG_TYPE: "website",
} as const;

/**
 * Page validation limits.
 */
export const PAGE_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  SLUG_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  META_TITLE_MAX_LENGTH: 70,
  META_DESCRIPTION_MAX_LENGTH: 160,
  KEYWORDS_MAX_COUNT: 20,
  CONTENT_MAX_LENGTH: 1_000_000,
} as const;

/**
 * Type-safe values derived from constants.
 */
export type PageTypeValue = (typeof PAGE_TYPES)[keyof typeof PAGE_TYPES];

export type PageIdentifierValue =
  (typeof PAGE_IDENTIFIERS)[keyof typeof PAGE_IDENTIFIERS];

export type PageStatusValue = (typeof PAGE_STATUS)[keyof typeof PAGE_STATUS];

export type PageContentFormatValue =
  (typeof PAGE_CONTENT_FORMATS)[keyof typeof PAGE_CONTENT_FORMATS];

export type PageVisibilityValue =
  (typeof PAGE_VISIBILITY)[keyof typeof PAGE_VISIBILITY];
