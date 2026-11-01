/** @format */

import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { cn } from "@/utils/cn";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  /** Adds a "clear" row that emits an empty string. */
  allowClear?: boolean;
  clearLabel?: string;
  required?: boolean;
  testID?: string;
}

/**
 * Inline expanding select.
 *
 * A nested `Modal` would compete with the form sheet on iOS, so options expand
 * inside the form instead. The list is capped and scrollable.
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  error,
  hint,
  allowClear = false,
  clearLabel = "None",
  required = false,
  testID,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-xs font-semibold text-stone-600 dark:text-neutral-300">
          {label}
          {required ? <Text className="text-red-600"> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        testID={testID}
        onPress={() => setOpen((current) => !current)}
        className={cn(
          "h-11 flex-row items-center justify-between rounded-xl border bg-white px-3 dark:bg-neutral-900",
          error
            ? "border-red-500"
            : open
              ? "border-green-600"
              : "border-stone-300 dark:border-neutral-700",
        )}
      >
        <Text
          numberOfLines={1}
          className={cn(
            "flex-1 pr-2 text-base",
            selected
              ? "text-stone-900 dark:text-white"
              : "text-stone-400 dark:text-neutral-500",
          )}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color="#78716c" />
      </Pressable>

      {open ? (
        <View className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <ScrollView className="max-h-56" nestedScrollEnabled>
            {allowClear ? (
              <OptionRow
                label={clearLabel}
                selected={value === ""}
                onPress={() => choose("")}
              />
            ) : null}
            {options.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={option.value === value}
                onPress={() => choose(option.value)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {error ? (
        <Text className="text-xs text-red-600 dark:text-red-400">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-stone-500 dark:text-neutral-400">{hint}</Text>
      ) : null}
    </View>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "min-h-11 flex-row items-center justify-between px-3 py-2.5",
        selected ? "bg-green-50 dark:bg-green-950/40" : "bg-transparent",
      )}
    >
      <Text
        className={cn(
          "text-sm",
          selected
            ? "font-semibold text-green-800 dark:text-green-300"
            : "text-stone-700 dark:text-neutral-200",
        )}
      >
        {label}
      </Text>
      {selected ? <Check size={16} color="#15803d" /> : null}
    </Pressable>
  );
}
