/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/components/common/ScreenContainer.tsx
 * @accessPath @/components/common/ScreenContainer
 * @description Structural screen wrapper (non-scrolling or scrolling). No design applied yet.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { cn } from "@/lib/utils";

interface ScreenContainerProps {
  children: ReactNode;
  /** Wrap content in a ScrollView (use for long / form screens). */
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * ScreenContainer
 * ---------------
 * A neutral layout wrapper. Intentionally carries no visual design — styling is
 * applied later. Screens should render their content inside this component so the
 * scroll / padding behaviour is decided in one place.
 */
export default function ScreenContainer({
  children,
  scroll = false,
  className,
  contentClassName,
}: ScreenContainerProps) {
  if (scroll) {
    return (
      <ScrollView
        className={cn("flex-1 bg-white", className)}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className={cn("p-4", contentClassName)}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <View className={cn("flex-1 bg-white p-4", className, contentClassName)}>
      {children}
    </View>
  );
}
