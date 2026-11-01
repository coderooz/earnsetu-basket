/** @format */

/**
 * @fileOverview auth.repository
 * @description Persistence for the auth session. Sessions live in `app_meta`
 * today; swapping this repository for a secure store (iOS Keychain / Android
 * Keystore) is an isolated change because nothing above this layer knows where
 * the token is kept.
 *
 * @module src/lib/auth/repositories/auth.repository
 * @author Coderooz
 * @see {@link @/db/local-store#getMeta}
 * @see {@link @/db/local-store#setMeta}
 * @see {@link @/db/local-store#removeMeta}
 */

import { META_KEYS } from "@/constants/basket.constants";
import { getMeta, removeMeta, setMeta } from "@/db/local-store";
import type { AuthSession } from "@/types/sync.types";

/**
 * @constant {Object} authRepository
 * @description Repository for reading/saving/clearing the auth session.
 * @property {() => Promise<AuthSession|undefined>} getSession - Reads the session from `app_meta`.
 * @property {(session: AuthSession) => Promise<void>} saveSession - Persists the session.
 * @property {() => Promise<void>} clearSession - Removes the session.
 */
export const authRepository = {
  /**
   * @function authRepository.getSession
   * @returns {Promise<AuthSession|undefined>} The stored session, or `undefined`.
   */
  getSession(): Promise<AuthSession | undefined> {
    return getMeta<AuthSession>(META_KEYS.authSession);
  },

  /**
   * @function authRepository.saveSession
   * @param {AuthSession} session - The session to persist.
   * @returns {Promise<void>}
   */
  async saveSession(session: AuthSession): Promise<void> {
    await setMeta(META_KEYS.authSession, session);
  },

  /**
   * @function authRepository.clearSession
   * @returns {Promise<void>}
   */
  async clearSession(): Promise<void> {
    await removeMeta(META_KEYS.authSession);
  },
};
