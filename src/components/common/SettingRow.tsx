/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/components/common/SettingRow.tsx
 * @accessPath @/components/common/SettingRow
 * @description A single settings-style row (label, optional value, chevron). Structural only.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingRowProps {
  label: string;
  description?: string;
  /** Text shown on the trailing side (e.g. current value). */
  value?: string;
  leftIcon?: ReactNode;
  /** Custom trailing element (rendered before the chevron). */
  rightElement?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export default function SettingRow({
  label,
  description,
  value,
  leftIcon,
  rightElement,
  onPress,
  showChevron = true,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 px-1 py-4"
    >
      <View className="flex-1 flex-row items-center">
        {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}
        <View className="flex-1">
          <Text className="text-base text-neutral-900">{label}</Text>
          {description ? (
            <Text className="mt-0.5 text-xs text-neutral-500">
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center">
        {value ? (
          <Text className="mr-2 text-sm text-neutral-500">{value}</Text>
        ) : null}
        {rightElement}
        {showChevron && onPress ? (
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
