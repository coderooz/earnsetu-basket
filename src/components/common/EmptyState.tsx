/** @format */

import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        "items-center justify-center gap-2 px-6",
        compact ? "py-8" : "py-16",
        className,
      )}
    >
      {Icon ? (
        <View className="mb-1 h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-neutral-800">
          <Icon size={22} color="#78716c" />
        </View>
      ) : null}
      <Text className="text-center text-base font-semibold text-stone-800 dark:text-neutral-100">
        {title}
      </Text>
      {message ? (
        <Text className="max-w-sm text-center text-sm leading-5 text-stone-500 dark:text-neutral-400">
          {message}
        </Text>
      ) : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  );
}
