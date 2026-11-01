/** @format */

/**
 * @fileOverview ShopRow
 * @description Renderer for a single shop directory row: name, category/phone/
 * sold-items count, favourite star, and chevron to open the shop profile.
 *
 * @module src/components/basket/ShopRow
 * @author Coderooz
 */

import { ChevronRight, Star, Store } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { Shop } from "@/types/basket.types";

interface ShopRowProps {
  shop: Shop;
  onPress: () => void;
}

export function ShopRow({ shop, onPress }: ShopRowProps) {
  const meta = [
    shop.category,
    shop.phone,
    (shop.soldItems ?? []).length
      ? `${(shop.soldItems ?? []).length} item${(shop.soldItems ?? []).length === 1 ? "" : "s"} listed`
      : null,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${shop.name}`}
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 active:bg-stone-50 dark:border-neutral-800 dark:active:bg-neutral-900"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40">
        <Store size={18} color="#15803d" />
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
            {shop.name}
          </Text>
          {shop.favorite ? <Star size={12} color="#d97706" fill="#fbbf24" /> : null}
        </View>
        <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
          {meta.join(" · ")}
        </Text>
      </View>

      <ChevronRight size={17} color="#a8a29e" />
    </Pressable>
  );
}
