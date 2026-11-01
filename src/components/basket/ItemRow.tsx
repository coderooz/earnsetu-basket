/** @format */

/**
 * @fileOverview ItemRow
 * @description Renderer for a single list item row: checkbox toggle, item name
 * with quantity/unit/estimated price/shop/notes, optional "Buy" action, and an
 * overflow menu (edit/delete). Read-only for archived lists.
 *
 * @module src/components/basket/ItemRow
 * @author Coderooz
 * @see {@link @/components/common#CheckToggle}
 */

import { Check, EllipsisVertical } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";

import { CheckToggle, IconButton, TextAction } from "@/components/common";
import type { ListItem } from "@/types/basket.types";
import { formatMoney } from "@/utils/money";

interface ItemRowProps {
  item: ListItem;
  onToggle: () => void;
  onOpen: () => void;
  onBuy?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** Archived lists are read-only: no toggle, buy or menu actions. */
  readOnly?: boolean;
}

export function ItemRow({
  item,
  onToggle,
  onOpen,
  onBuy,
  onEdit,
  onDelete,
  readOnly = false,
}: ItemRowProps) {
  const meta = [
    `${item.quantity} ${item.unit}`,
    item.expectedPriceMinor === undefined
      ? null
      : `Est. ${formatMoney(item.expectedPriceMinor, item.currency)}`,
    item.shopName,
  ].filter(Boolean);

  const openMenu = () => {
    Alert.alert(item.name, "Choose an action", [
      { text: "Edit item", onPress: onEdit },
      { text: "Delete item", style: "destructive", onPress: onDelete },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View className="flex-row items-center gap-2 border-b border-stone-100 px-4 py-2.5 dark:border-neutral-800">
      {readOnly ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className={
            item.checked
              ? "ml-1 h-5 w-5 items-center justify-center rounded-full bg-green-700"
              : "ml-1 h-5 w-5 rounded-full border-2 border-stone-300 dark:border-neutral-600"
          }
        >
          {item.checked ? <Check size={12} color="#ffffff" strokeWidth={3} /> : null}
        </View>
      ) : (
        <CheckToggle
          checked={item.checked}
          onPress={onToggle}
          accessibilityLabel={
            item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`
          }
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}`}
        onPress={onOpen}
        className="min-w-0 flex-1 py-1"
      >
        <Text
          numberOfLines={1}
          className={
            item.checked
              ? "text-sm font-semibold text-stone-400 line-through dark:text-neutral-500"
              : "text-sm font-semibold text-stone-800 dark:text-neutral-100"
          }
        >
          {item.name}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
          {meta.join(" · ")}
        </Text>
        {item.notes ? (
          <Text numberOfLines={1} className="mt-0.5 text-[11px] text-stone-400 dark:text-neutral-500">
            {item.notes}
          </Text>
        ) : null}
      </Pressable>

      {!readOnly && !item.checked && onBuy ? (
        <TextAction label="Buy" onPress={onBuy} accessibilityLabel={`Record purchase of ${item.name}`} />
      ) : null}

      {readOnly ? null : (
        <IconButton
          icon={EllipsisVertical}
          variant="bare"
          onPress={openMenu}
          accessibilityLabel={`More actions for ${item.name}`}
          className="h-9 w-9"
        />
      )}
    </View>
  );
}
