/** @format */

/**
 * Build-time configuration.
 *
 * Expo inlines `EXPO_PUBLIC_*` variables at bundle time, so this value is
 * static per build and never read from a secret store. When it is empty the app
 * runs in fully local mode.
 */
const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export const API_BASE_URL = rawBaseUrl.trim().replace(/\/+$/, "");

export const SYNC_ENABLED = API_BASE_URL.length > 0;

export const APP_VERSION = "2.0.0";

export const APP_SCHEMA_VERSION = 2;
