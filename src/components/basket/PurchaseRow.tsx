/** @format */

/**
 * @fileOverview PurchaseRow
 * @description Renderer for a single purchase row: item name, quantity/unit/
 * shop/payment metadata, total and unit price, optional open/delete actions.
 *
 * @module src/components/basket/PurchaseRow
 * @author Coderooz
 * @see {@link @/utils/date#formatDateLabel}
 * @see {@link @/utils/money#formatMoney}
 */

import { ShoppingBasket, Trash } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { IconButton } from "@/components/common";
import type { Purchase } from "@/types/basket.types";
import { formatDateLabel } from "@/utils/date";
import { formatMoney } from "@/utils/money";

interface PurchaseRowProps {
  purchase: Purchase;
  onOpen?: () => void;
  onDelete?: () => void;
}

export function PurchaseRow({ purchase, onOpen, onDelete }: PurchaseRowProps) {
  const meta = [
    formatDateLabel(purchase.purchasedAt),
    `${purchase.quantity} ${purchase.unit}`,
    purchase.shopName,
    purchase.paymentMethod,
  ].filter(Boolean);

  return (
    <View className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-neutral-800">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${purchase.itemName}`}
        onPress={onOpen}
        className="flex-1 flex-row items-center gap-3"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-neutral-800">
          <ShoppingBasket size={16} color="#78716c" />
        </View>
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
            {purchase.itemName}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
            {meta.join(" · ")}
          </Text>
        </View>
      </Pressable>

      <View className="items-end">
        <Text className="text-sm font-bold text-stone-900 dark:text-white">
          {formatMoney(purchase.totalMinor, purchase.currency)}
        </Text>
        <Text className="text-[10px] text-stone-500 dark:text-neutral-400">
          {formatMoney(purchase.unitPriceMinor, purchase.currency)}/{purchase.unit}
        </Text>
      </View>

      {onDelete ? (
        <IconButton
          icon={Trash}
          variant="danger"
          onPress={onDelete}
          accessibilityLabel={`Delete purchase of ${purchase.itemName}`}
          className="h-9 w-9"
        />
      ) : null}
    </View>
  );
}
