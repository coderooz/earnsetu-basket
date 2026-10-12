/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/components/common/EmptyState.tsx
 * @accessPath @/components/common/EmptyState
 * @description Neutral empty-state placeholder used by list screens. Structural only.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title,
  message,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10">
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text className="text-base font-semibold text-neutral-800">{title}</Text>
      {message ? (
        <Text className="mt-1 text-center text-sm text-neutral-500">
          {message}
        </Text>
      ) : null}
      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  );
}
