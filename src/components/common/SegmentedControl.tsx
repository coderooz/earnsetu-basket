/** @format */

import { Pressable, Text, View } from "react-native";

import { cn } from "@/utils/cn";

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-xl bg-stone-100 p-1 dark:bg-neutral-800"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              "h-9 flex-1 items-center justify-center rounded-lg",
              selected ? "bg-white shadow-sm dark:bg-neutral-700" : "bg-transparent",
            )}
          >
            <Text
              className={cn(
                "text-xs font-semibold",
                selected
                  ? "text-stone-900 dark:text-white"
                  : "text-stone-500 dark:text-neutral-400",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
