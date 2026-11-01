/** @format */

/**
 * @fileOverview ListCard
 * @description Card for a shopping list: name, description, archive badge,
 * progress (checked/total + percent bar), planned date, and edit/archive/restore/
 * delete actions.
 *
 * @module src/components/basket/ListCard
 * @author Coderooz
 * @see {@link @/lib/stats/helpers/stats.helpers#computeListProgress}
 */

import { Pressable, Text, View } from "react-native";

import { Badge, TextAction } from "@/components/common";
import { computeListProgress } from "@/lib/stats/helpers/stats.helpers";
import type { ListItem, ShoppingList } from "@/types/basket.types";
import { formatDateLabel } from "@/utils/date";
import { cn } from "@/utils/cn";

interface ListCardProps {
  list: ShoppingList;
  items: readonly ListItem[];
  onPress: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

export function ListCard({
  list,
  items,
  onPress,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ListCardProps) {
  const progress = computeListProgress(items, list.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${list.name}, ${progress.checked} of ${progress.total} checked`}
      onPress={onPress}
      className="rounded-2xl border border-stone-200 bg-white p-4 active:bg-stone-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-base font-bold text-stone-900 dark:text-white">
            {list.name}
          </Text>
          {list.description ? (
            <Text numberOfLines={2} className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
              {list.description}
            </Text>
          ) : null}
        </View>
        <Badge
          label={list.archived ? "Archived" : "Active"}
          tone={list.archived ? "neutral" : "success"}
        />
      </View>

      <View className="mt-3 flex-row items-center gap-2">
        <Text className="text-xs text-stone-500 dark:text-neutral-400">
          {progress.checked}/{progress.total} checked
        </Text>
        <Text className="text-xs text-stone-300 dark:text-neutral-600">•</Text>
        <Text className="text-xs text-stone-500 dark:text-neutral-400" numberOfLines={1}>
          {list.plannedFor ? formatDateLabel(list.plannedFor) : "No date"}
        </Text>
        <View className="flex-1" />
        <Text className="text-xs font-semibold text-green-700 dark:text-green-400">
          {progress.percent}%
        </Text>
      </View>

      <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-neutral-800">
        <View
          className={cn("h-full rounded-full", list.archived ? "bg-stone-400" : "bg-green-600")}
          style={{ width: `${progress.percent}%` }}
        />
      </View>

      {onEdit || onArchive || onRestore || onDelete ? (
        <View className="mt-2 flex-row items-center justify-end gap-1">
          {onEdit ? <TextAction label="Edit" onPress={onEdit} tone="muted" /> : null}
          {onArchive ? (
            <TextAction
              label="Archive"
              onPress={onArchive}
              accessibilityLabel={`Archive ${list.name}`}
              tone="muted"
            />
          ) : null}
          {onRestore ? (
            <TextAction
              label="Restore"
              onPress={onRestore}
              accessibilityLabel={`Restore ${list.name}`}
            />
          ) : null}
          {onDelete ? (
            <TextAction
              label="Delete"
              onPress={onDelete}
              accessibilityLabel={`Delete ${list.name}`}
              tone="danger"
            />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
