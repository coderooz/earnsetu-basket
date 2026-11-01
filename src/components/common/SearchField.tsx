/** @format */

import { Search, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  autoFocus?: boolean;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  accessibilityLabel = "Search",
  autoFocus = false,
}: SearchFieldProps) {
  return (
    <View className="h-11 flex-row items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 dark:border-neutral-700 dark:bg-neutral-900">
      <Search size={17} color="#a8a29e" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a8a29e"
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        className="h-11 flex-1 text-base text-stone-900 dark:text-white"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
          onPress={() => onChangeText("")}
        >
          <X size={16} color="#a8a29e" />
        </Pressable>
      ) : null}
    </View>
  );
}
