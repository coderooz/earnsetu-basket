/** @format */

/**
 * @fileOverview TextField
 * @description Labeled text input with focus/error states, hint text, and
 * optional multiline support. Used across all forms.
 *
 * @module src/components/common/TextField
 * @author Coderooz
 */

import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { cn } from "@/utils/cn";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  required = false,
  containerClassName,
  multiline,
  onFocus,
  onBlur,
  className,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label ? (
        <Text className="text-xs font-semibold text-stone-600 dark:text-neutral-300">
          {label}
          {required ? <Text className="text-red-600"> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#a8a29e"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={cn(
          "rounded-xl border bg-white px-3 text-base text-stone-900 dark:bg-neutral-900 dark:text-white",
          multiline ? "min-h-24 py-3" : "h-11",
          error
            ? "border-red-500"
            : focused
              ? "border-green-600"
              : "border-stone-300 dark:border-neutral-700",
          className,
        )}
        {...rest}
      />
      {error ? (
        <Text className="text-xs text-red-600 dark:text-red-400">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-stone-500 dark:text-neutral-400">{hint}</Text>
      ) : null}
    </View>
  );
}

export function TextAreaField(props: TextFieldProps) {
  return <TextField multiline {...props} />;
}
