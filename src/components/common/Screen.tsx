/** @format */

/**
 * @fileOverview Screen
 * @description Base page wrapper using SafeAreaView. Excludes the bottom
 * inset by default (owned by the tab bar); opt in via `includeBottomInset`.
 * Applies the EarnSetu background color.
 *
 * @module src/components/common/Screen
 * @author Coderooz
 */

import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";

interface ScreenProps {
  children: ReactNode;
  className?: string;
  /** Bottom edge is normally owned by the tab bar. */
  includeBottomInset?: boolean;
}

export function Screen({
  children,
  className,
  includeBottomInset = false,
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={
        includeBottomInset
          ? ["top", "left", "right", "bottom"]
          : ["top", "left", "right"]
      }
      className={cn("flex-1 bg-stone-50 dark:bg-neutral-950", className)}
    >
      {children}
    </SafeAreaView>
  );
}
