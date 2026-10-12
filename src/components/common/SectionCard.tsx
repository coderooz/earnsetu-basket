/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/components/common/SectionCard.tsx
 * @accessPath @/components/common/SectionCard
 * @description A titled content section used across screens. Structural only.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  /** Optional trailing element (e.g. a "View all" button). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: SectionCardProps) {
  const showHeader = Boolean(title || subtitle || action);

  return (
    <View
      className={cn(
        "mb-4 w-full rounded-2xl border border-neutral-200 bg-white p-4",
        className
      )}
    >
      {showHeader && (
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-1">
            {title ? (
              <Text className="text-base font-semibold text-neutral-900">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="mt-0.5 text-xs text-neutral-500">{subtitle}</Text>
            ) : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
