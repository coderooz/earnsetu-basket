/** @format */

import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { cn } from "@/utils/cn";

interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: "default" | "danger" | "bare" | "primary";
  disabled?: boolean;
  className?: string;
  testID?: string;
}

const VARIANTS = {
  default:
    "border border-stone-200 bg-white text-stone-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
  danger:
    "bg-transparent text-stone-500 dark:text-neutral-400",
  bare: "bg-transparent text-stone-500 dark:text-neutral-400",
  primary: "bg-green-700 text-white",
};

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  variant = "default",
  disabled = false,
  className,
  testID,
}: IconButtonProps) {
  const color =
    variant === "primary"
      ? "#ffffff"
      : variant === "danger"
        ? "#dc2626"
        : variant === "bare"
          ? "#78716c"
          : "#57534e";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-xl",
        VARIANTS[variant],
        disabled && "opacity-40",
        className,
      )}
    >
      <Icon size={18} color={color} />
    </Pressable>
  );
}

/** Small text-only action used inside rows. */
export function TextAction({
  label,
  onPress,
  accessibilityLabel,
  tone = "primary",
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  tone?: "primary" | "danger" | "muted";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={8}
      className="px-2 py-2"
    >
      <Text
        className={cn(
          "text-xs font-semibold",
          tone === "primary" && "text-green-700 dark:text-green-400",
          tone === "danger" && "text-red-600 dark:text-red-400",
          tone === "muted" && "text-stone-500 dark:text-neutral-400",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
