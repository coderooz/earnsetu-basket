/** @format */

/**
 * @fileOverview auth.service
 * @description Account integration for EarnSetu Basket. The browser build
 * relied on `@appdeploy/client` for sign-in, which does not exist in this
 * repository and no OAuth client id has been supplied, so the native app ships
 * without an auth provider. The sync client activates as soon as a session is
 * supplied by a real provider via `connectSession`.
 *
 * Notes:
 *   - Sessions are persisted in `app_meta` (see `authRepository`); swapping to
 *     iOS Keychain / Android Keystore is an isolated change.
 *   - `getSession` auto-clears expired sessions.
 *
 * @module src/lib/auth/services/auth.service
 * @author Coderooz
 * @see {@link @/lib/auth/repositories/auth.repository}
 * @see {@link @/types/sync.types#AuthSession}
 */

import { ValidationError } from "@/lib/common/helpers/validation";
import type { AuthSession } from "@/types/sync.types";

import { authRepository } from "../repositories/auth.repository";

/**
 * @constant {Object} authService
 * @description Auth service exposing session read/connect/sign-out.
 * @property {() => Promise<AuthSession|undefined>} getSession - Returns the
 *   stored session, clearing it if expired.
 * @property {(session: AuthSession) => Promise<AuthSession>} connectSession -
 *   Validates and persists a session (entry point for a future provider).
 * @property {() => Promise<void>} signOut - Clears the stored session.
 */
export const authService = {
  /**
   * @function authService.getSession
   * @returns {Promise<AuthSession|undefined>} The stored session, or `undefined` if none or expired.
   */
  async getSession(): Promise<AuthSession | undefined> {
    const session = await authRepository.getSession();
    if (!session?.token) return undefined;
    if (session.expiresAt) {
      const expiry = new Date(session.expiresAt).getTime();
      if (Number.isFinite(expiry) && expiry <= Date.now()) {
        await authRepository.clearSession();
        return undefined;
      }
    }
    return session;
  },

  /**
   * @function authService.connectSession
   * @description Entry point for a future provider (Clerk, OAuth, custom
   * backend). Validates the minimum shape before persisting.
   * @param {AuthSession} session - The session to connect.
   * @returns {Promise<AuthSession>} The persisted session.
   * @throws {ValidationError} If the session lacks a user id or token.
   */
  async connectSession(session: AuthSession): Promise<AuthSession> {
    if (!session.userId?.trim() || !session.token?.trim()) {
      throw new ValidationError("A session needs a user id and a token.");
    }
    await authRepository.saveSession(session);
    return session;
  },

  /**
   * @function authService.signOut
   * @returns {Promise<void>}
   */
  async signOut(): Promise<void> {
    await authRepository.clearSession();
  },
};
