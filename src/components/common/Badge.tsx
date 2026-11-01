/** @format */

/**
 * @fileOverview Badge
 * @description Small rounded pill badge with tones (neutral, success, warning,
 * danger, accent) for status labels.
 *
 * @module src/components/common/Badge
 * @author Coderooz
 */

import { Text, View } from "react-native";

import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const TONES: Record<BadgeTone, string> = {
  neutral:
    "bg-stone-100 text-stone-600 dark:bg-neutral-800 dark:text-neutral-300",
  success:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  accent: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
};

export function Badge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <View className={cn("rounded-full px-2 py-0.5", TONES[tone], className)}>
      <Text className={cn("text-[10px] font-semibold uppercase tracking-wide", TONES[tone])}>
        {label}
      </Text>
    </View>
  );
}
