/** @format */

import { Check } from "lucide-react-native";
import { Pressable } from "react-native";

import { cn } from "@/utils/cn";

interface CheckToggleProps {
  checked: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  size?: "sm" | "md";
}

/**
 * A real checkbox role (not an image) so screen readers report state. The
 * pressable itself keeps a 44px touch target around the visual box.
 */
export function CheckToggle({
  checked,
  onPress,
  accessibilityLabel,
  size = "md",
}: CheckToggleProps) {
  const box = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={10}
      className={cn(
        "items-center justify-center rounded-md border-2",
        box,
        checked
          ? "border-green-700 bg-green-700"
          : "border-stone-300 bg-white dark:border-neutral-600 dark:bg-neutral-900",
      )}
    >
      {checked ? (
        <Check size={size === "sm" ? 12 : 15} color="#ffffff" strokeWidth={3} />
      ) : null}
    </Pressable>
  );
}
