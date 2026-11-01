/** @format */

/**
 * @fileOverview ThemeProvider
 * @description Manages the application's appearance theme (system, light, dark)
 * using `Appearance.setColorScheme()` so NativeWind's `dark:` variant reads the
 * platform appearance. The persisted theme mode is read from `app_meta` on mount
 * and written back whenever the user changes it.
 *
 * @module src/context/ThemeProvider
 * @author Coderooz
 * @see {@link @/constants/basket.constants#THEME_MODES}
 * @see {@link @/lib/settings/services/settings.service}
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, useColorScheme } from "react-native";

import type { ThemeMode } from "@/constants/basket.constants";
import { settingsService } from "@/lib/settings/services/settings.service";

/**
 * @interface ThemeContextValue
 * @description Value exposed by {@link ThemeProvider}.
 * @property {ThemeMode} mode - The currently selected theme mode.
 * @property {boolean} isDark - Whether the resolved scheme is dark.
 * @property {(mode: ThemeMode) => Promise<void>} setMode - Persists and applies a new theme mode.
 */
interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * @function ThemeProvider
 * @description React context provider that initializes the theme from persisted
 * meta, applies it via `Appearance.setColorScheme`, and exposes `setMode` to
 * consumers. "system" clears the override so the device preference is followed.
 *
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Child components.
 * @returns {JSX.Element} A `ThemeContext.Provider` element.
 *
 * @example
 * <ThemeProvider>
 *   <AppNavigator />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    let active = true;
    settingsService
      .getThemeMode()
      .then((stored) => {
        if (!active) return;
        setModeState(stored);
        Appearance.setColorScheme(stored === "system" ? "auto" : stored);
      })
      .catch(() => {
        // A theme read failure must never block the app; keep the system mode.
      });
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    Appearance.setColorScheme(next === "system" ? "auto" : next);
    await settingsService.setThemeMode(next);
  }, []);

  const value = useMemo(
    () => ({ mode, isDark: systemScheme === "dark", setMode }),
    [mode, setMode, systemScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * @function useThemeMode
 * @description Consumes the theme context. Throws if used outside a
 * `ThemeProvider`.
 *
 * @returns {ThemeContextValue} The theme context value.
 * @throws {Error} When used outside `ThemeProvider`.
 */
export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider.");
  }
  return context;
}
