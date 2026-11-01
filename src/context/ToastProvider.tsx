/** @format */

/**
 * @fileOverview ToastProvider
 * @description Manages ephemeral toast notifications shown at the bottom of the
 * screen. Toasts are auto-dismissed after 3.2 seconds and respect safe-area
 * insets so they never overlap the navigation bar or home indicator.
 *
 * @module src/context/ToastProvider
 * @author Coderooz
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";

/**
 * @type {("default"|"success"|"error")}
 * @description The visual tone of a toast notification.
 */
type ToastTone = "default" | "success" | "error";

/**
 * @interface ToastState
 * @description A single toast entry.
 * @property {number} id - Unique identifier (timestamp-based).
 * @property {string} message - The text to display.
 * @property {ToastTone} tone - The visual tone.
 */
interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

/**
 * @interface ToastContextValue
 * @description Value exposed by {@link ToastProvider}.
 * @property {(message: string, tone?: ToastTone) => void} showToast - Displays a toast notification.
 */
interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_CLASS: Record<ToastTone, string> = {
  default: "bg-stone-900 dark:bg-neutral-100",
  success: "bg-green-800",
  error: "bg-red-700",
};

const TONE_TEXT: Record<ToastTone, string> = {
  default: "text-white dark:text-stone-900",
  success: "text-white",
  error: "text-white",
};

/**
 * @function ToastProvider
 * @description React context provider that renders toasts and exposes `showToast`.
 * Toasts appear at the bottom of the screen above the tab bar safe area inset.
 *
 * @param {Object} props - Component props.
 * @param {ReactNode} props.children - Child components.
 * @returns {JSX.Element} A `ToastContext.Provider` element.
 *
 * @example
 * <ToastProvider>
 *   <AppNavigator />
 * </ToastProvider>
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "default") => {
    if (!message.trim()) return;
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <View className="flex-1">
        {children}
        {toast ? (
          <View
            pointerEvents="none"
            className="absolute inset-x-4 items-center"
            style={{ bottom: Math.max(insets.bottom, 12) + 72 }}
          >
            <View
              accessibilityLiveRegion="polite"
              className={cn(
                "max-w-md rounded-xl px-4 py-3 shadow-lg",
                TONE_CLASS[toast.tone],
              )}
            >
              <Text className={cn("text-center text-sm font-medium", TONE_TEXT[toast.tone])}>
                {toast.message}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

/**
 * @function useToast
 * @description Consumes the toast context. Throws if used outside a `ToastProvider`.
 *
 * @returns {ToastContextValue} The toast context value.
 * @throws {Error} When used outside `ToastProvider`.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}
