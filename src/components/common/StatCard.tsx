/** @format */

import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "warning";
  className?: string;
}

const TONES = {
  default: "border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
  primary: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
};

const ICON_TONES = {
  default: "#78716c",
  primary: "#15803d",
  warning: "#b45309",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <View className={cn("flex-1 gap-1 rounded-2xl border p-3.5", TONES[tone], className)}>
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400">
          {label}
        </Text>
        {Icon ? <Icon size={15} color={ICON_TONES[tone]} /> : null}
      </View>
      <Text className="text-lg font-bold text-stone-900 dark:text-white" numberOfLines={1}>
        {value}
      </Text>
      {hint ? (
        <Text className="text-[11px] text-stone-500 dark:text-neutral-400" numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
