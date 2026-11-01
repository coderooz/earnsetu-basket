/** @format */

import type { BasketResource } from "@/types/basket.types";

/** Units offered by the browser application, in the same order. */
export const BASKET_UNITS = [
  "pcs",
  "kg",
  "g",
  "l",
  "ml",
  "packet",
  "pack",
  "box",
  "bottle",
  "dozen",
  "unit",
] as const;

export type BasketUnit = (typeof BASKET_UNITS)[number];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Card",
  "Bank transfer",
  "Credit",
  "Other",
] as const;

export const SHOP_CATEGORIES = [
  "Grocery",
  "Supermarket",
  "Vegetable shop",
  "Pharmacy",
  "Electronics",
  "Clothing",
  "Hardware",
  "Restaurant",
  "Other",
] as const;

export const DEFAULT_SHOP_CATEGORY: (typeof SHOP_CATEGORIES)[number] = "Grocery";

export const DEFAULT_UNIT: BasketUnit = "pcs";

/** Meta keys persisted in `app_meta`. */
export const META_KEYS = {
  theme: "basket-theme",
  themeMode: "basket-theme-mode",
  selectedListId: "selectedListId",
  hasLaunched: "hasLaunched",
  lastSyncedAt: "lastSyncedAt",
  authSession: "auth.session",
  onboardingVersion: "onboarding.version",
} as const;

export const API_ROUTES = {
  sync: "/api/basket/sync",
  resource: (resource: BasketResource) => `/api/basket/${resource}`,
  health: "/api/_healthcheck",
} as const;

export const LIMITS = {
  nameMaxLength: 100,
  remotePageSize: 100,
  /** Defensive cap so a broken cursor cannot loop forever. */
  remoteMaxPages: 50,
  syncRequestTimeoutMs: 15_000,
  searchDebounceMs: 150,
} as const;

export const SYNC_MESSAGES = {
  notConfigured:
    "Cloud sync is not configured for this build. Everything stays on this device.",
  noSession:
    "Sign-in is not connected yet. Your data is saved on this device.",
  offline: "You are offline. Changes will sync when a connection returns.",
  allSynced: "All changes are synchronized.",
  waiting: "Some changes are waiting to sync.",
  authFailed: "Cloud sign-in expired. Sign in again to resume sync.",
  rejected:
    "The server rejected some changes. They are kept on this device so nothing is lost.",
} as const;

export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];
