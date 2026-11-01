/** @format */

/**
 * @fileOverview Button
 * @description Pressable button with variants (primary, secondary, ghost,
 * danger, subtle), sizes (sm/md), optional icon, loading state, and full-width
 * option. Used for all primary actions.
 *
 * @module src/components/common/Button
 * @author Coderooz
 */

import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "subtle";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-green-700 active:bg-green-800",
  secondary:
    "border border-stone-300 bg-white active:bg-stone-100 dark:border-neutral-700 dark:bg-neutral-900 dark:active:bg-neutral-800",
  ghost: "bg-transparent active:bg-stone-100 dark:active:bg-neutral-800",
  danger: "bg-red-600 active:bg-red-700",
  subtle: "bg-stone-100 active:bg-stone-200 dark:bg-neutral-800 dark:active:bg-neutral-700",
};

const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-stone-800 dark:text-neutral-100",
  ghost: "text-green-700 dark:text-green-400",
  danger: "text-white",
  subtle: "text-stone-800 dark:text-neutral-100",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const iconColor =
    variant === "primary" || variant === "danger"
      ? "#ffffff"
      : variant === "ghost"
        ? "#15803d"
        : "#57534e";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-xl",
        size === "sm" ? "h-9 px-3" : "h-11 px-4",
        CONTAINER[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#ffffff" : "#15803d"}
        />
      ) : (
        Icon && <Icon size={size === "sm" ? 15 : 18} color={iconColor} />
      )}
      <Text
        numberOfLines={1}
        className={cn(
          "font-semibold",
          size === "sm" ? "text-xs" : "text-sm",
          LABEL_COLOR[variant],
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
