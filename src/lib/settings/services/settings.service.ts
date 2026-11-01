/** @format */

/**
 * @fileOverview settings.service
 * @description Persisted user settings stored in `app_meta`: theme mode,
 * launch flag, and selected list id. All values are JSON-serialized via the
 * local-store meta layer.
 *
 * @module src/lib/settings/services/settings.service
 * @author Coderooz
 * @see {@link @/db/local-store#getMeta}
 * @see {@link @/db/local-store#setMeta}
 */

import { META_KEYS, THEME_MODES, type ThemeMode } from "@/constants/basket.constants";
import { getMeta, setMeta } from "@/db/local-store";

function isThemeMode(value: unknown): value is ThemeMode {
  return (THEME_MODES as readonly unknown[]).includes(value);
}

export const settingsService = {
  async getThemeMode(): Promise<ThemeMode> {
    const stored = await getMeta<ThemeMode>(META_KEYS.themeMode);
    return isThemeMode(stored) ? stored : "system";
  },

  async setThemeMode(mode: ThemeMode): Promise<void> {
    await setMeta(META_KEYS.themeMode, mode);
  },

  async hasLaunched(): Promise<boolean> {
    return (await getMeta<boolean>(META_KEYS.hasLaunched)) === true;
  },

  async markLaunched(): Promise<void> {
    await setMeta(META_KEYS.hasLaunched, true);
  },

  async resetLaunchFlag(): Promise<void> {
    await setMeta(META_KEYS.hasLaunched, false);
  },

  async getSelectedListId(): Promise<string | undefined> {
    return getMeta<string>(META_KEYS.selectedListId);
  },

  async setSelectedListId(id: string | undefined): Promise<void> {
    await setMeta(META_KEYS.selectedListId, id ?? null);
  },
};
