/** @format */

import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { IconButton } from "./IconButton";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  /** Hides the title (e.g. on Home where the greeting is the title). */
  hideTitle?: boolean;
  children?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  actions,
  hideTitle = false,
  children,
}: ScreenHeaderProps) {
  return (
    <View className="gap-2 px-4 pb-2 pt-2">
      <View className="flex-row items-center gap-2">
        {onBack ? (
          <IconButton
            icon={ArrowLeft}
            variant="bare"
            onPress={onBack}
            accessibilityLabel="Go back"
          />
        ) : null}
        {hideTitle ? null : (
          <View className="flex-1">
            <Text
              className="text-xl font-bold text-stone-900 dark:text-white"
              numberOfLines={1}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
        {actions ? <View className="flex-row items-center gap-1">{actions}</View> : null}
      </View>
      {children}
    </View>
  );
}
