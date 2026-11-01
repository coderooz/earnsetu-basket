/** @format */

/**
 * @fileOverview ItemsScreen
 * @description Items tab: derived product catalogue with search. Each product
 * links to its profile (list appearances, price history, purchase history,
 * associated shops). Quick actions to view lists or record a purchase.
 *
 * @module src/screens/ItemsScreen
 * @author Coderooz
 * @see {@link @/lib/products/helpers/catalogue.helpers#buildCatalogue}
 * @see {@link @/navigation/AppNavigation}
 */

import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Package, Plus, ReceiptText } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  SearchField,
} from "@/components/common";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { useBasket } from "@/context/BasketProvider";
import { useDebouncedValue } from "@/hooks";
import type { RootNavigation } from "@/navigation/types";
import { formatDateLabel } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { includesQuery } from "@/utils/text";

export default function ItemsScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { catalogue } = useBasket();

  const [search, setSearch] = useState("");
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const query = useDebouncedValue(search);

  const visible = useMemo(
    () => catalogue.filter((entry) => includesQuery([entry.name], query)),
    [catalogue, query],
  );

  const purchasedCount = catalogue.filter((entry) => entry.purchaseCount > 0).length;

  return (
    <Screen>
      <ScreenHeader
        title="Items & prices"
        subtitle={`${catalogue.length} product${catalogue.length === 1 ? "" : "s"} · ${purchasedCount} with purchase history`}
        actions={
          <IconButton
            icon={Plus}
            variant="primary"
            onPress={() => setPurchaseOpen(true)}
            accessibilityLabel="Record a purchase"
          />
        }
      >
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          accessibilityLabel="Search products"
        />
      </ScreenHeader>

      <FlatList
        data={visible}
        keyExtractor={(entry) => entry.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
            onPress={() => navigation.navigate("ProductProfile", { name: item.name })}
            className="flex-row items-center gap-3 border-b border-stone-100 px-4 py-3 active:bg-stone-50 dark:border-neutral-800 dark:active:bg-neutral-900"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-neutral-800">
              <Package size={17} color="#78716c" />
            </View>

            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
                {item.name}
              </Text>
              <Text numberOfLines={1} className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
                {item.listEntryCount > 0
                  ? `In ${item.listEntryCount} list entr${item.listEntryCount === 1 ? "y" : "ies"}`
                  : "Not in any list"}
                {" · "}
                {item.purchaseCount > 0
                  ? `${item.purchaseCount} purchase${item.purchaseCount === 1 ? "" : "s"}`
                  : "No purchases"}
              </Text>
              {item.lastPurchasedAt ? (
                <Text className="mt-0.5 text-[11px] text-stone-400 dark:text-neutral-500">
                  Last bought {formatDateLabel(item.lastPurchasedAt)}
                </Text>
              ) : null}
            </View>

            <View className="items-end gap-1">
              {item.lastUnitPriceMinor === undefined ? null : (
                <Text className="text-xs font-bold text-stone-800 dark:text-neutral-100">
                  {formatMoney(item.lastUnitPriceMinor, item.currency)}
                </Text>
              )}
              {item.purchaseCount > 0 ? (
                <Badge label="Bought" tone="success" />
              ) : item.listEntryCount > 0 ? (
                <Badge label="Planned" tone="accent" />
              ) : null}
            </View>

            <ChevronRight size={17} color="#a8a29e" />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={query ? Package : ReceiptText}
            title={
              query ? "No products match your search" : "No products yet"
            }
            message={
              query
                ? "Try a shorter name."
                : "Products are built from your list entries and recorded purchases. Add a list item or record a purchase to get started."
            }
            action={
              !query ? (
                <View className="flex-row gap-2">
                  <Button
                    label="View lists"
                    variant="secondary"
                    onPress={() => navigation.navigate("Tabs", { screen: "Lists" })}
                  />
                  <Button
                    label="Record purchase"
                    icon={Plus}
                    onPress={() => setPurchaseOpen(true)}
                  />
                </View>
              ) : undefined
            }
          />
        }
        ListFooterComponent={
          catalogue.length > 0 ? (
            <Text className="px-6 pt-4 text-center text-[11px] leading-4 text-stone-400 dark:text-neutral-500">
              Product names are matched by name. “Rice”, “rice” and “RICE ” are the same
              product.
            </Text>
          ) : undefined
        }
      />

      <PurchaseForm visible={purchaseOpen} onClose={() => setPurchaseOpen(false)} />
    </Screen>
  );
}
