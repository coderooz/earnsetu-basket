/** @format */

/**
 * @fileOverview ProductProfileScreen
 * @description Product profile screen: derived read model showing a product's
 * list appearances, price history, purchase history, and associated shops.
 * Quick actions to add to a list or record a purchase.
 *
 * @module src/screens/ProductProfileScreen
 * @author Coderooz
 * @see {@link @/lib/products/helpers/catalogue.helpers#buildProductProfile}
 * @see {@link @/navigation/types#RootStackParamList}
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import {
  ChevronRight,
  CircleAlert,
  Package,
  Plus,
  ReceiptText,
  ShoppingBasket,
  Store,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  StatCard,
} from "@/components/common";
import { ItemForm } from "@/components/forms/ItemForm";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { useBasket } from "@/context/BasketProvider";
import { buildProductProfile } from "@/lib/products/helpers/catalogue.helpers";
import type { RootNavigation, RootStackParamList } from "@/navigation/types";
import { formatDateLabel } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { normaliseNameKey } from "@/utils/text";

export default function ProductProfileScreen() {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<RouteProp<RootStackParamList, "ProductProfile">>();
  const { items, purchases, shops, lists, catalogue } = useBasket();

  const name = route.params.name;
  const profile = useMemo(
    () => buildProductProfile(name, items, purchases, shops),
    [name, items, purchases, shops],
  );

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const lastPurchase = profile.purchases[0];
  const activeLists = lists.filter((list) => !list.archived);
  const productExists = catalogue.some((entry) => entry.key === normaliseNameKey(name));

  return (
    <Screen includeBottomInset>
      <ScreenHeader
        title={profile.summary.name}
        subtitle={
          productExists
            ? "Derived from your lists, shops and purchases"
            : "Not seen in your data yet"
        }
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}>
        <View className="flex-row gap-2.5">
          <StatCard
            label="In lists"
            value={String(profile.summary.listEntryCount)}
            hint="Planned entries"
            icon={ShoppingBasket}
          />
          <StatCard
            label="Purchases"
            value={String(profile.summary.purchaseCount)}
            hint="Recorded buys"
            icon={ReceiptText}
            tone="primary"
          />
          <StatCard
            label="Last price"
            value={
              profile.summary.lastUnitPriceMinor === undefined
                ? "—"
                : formatMoney(
                    profile.summary.lastUnitPriceMinor,
                    profile.summary.currency,
                  )
            }
            hint={
              profile.summary.lastPurchasedAt
                ? formatDateLabel(profile.summary.lastPurchasedAt)
                : "No purchases"
            }
          />
        </View>

        <View className="flex-row gap-2">
          <Button
            label="Add to a list"
            icon={Plus}
            className="flex-1"
            disabled={activeLists.length === 0}
            onPress={() => setItemFormOpen(true)}
          />
          <Button
            label="Record purchase"
            icon={ReceiptText}
            variant="secondary"
            className="flex-1"
            onPress={() => setPurchaseOpen(true)}
          />
        </View>

        {activeLists.length === 0 ? (
          <Text className="text-xs text-amber-700 dark:text-amber-400">
            Create an active shopping list before adding this product to a plan.
          </Text>
        ) : null}

        <Card className="gap-3">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Shopping-list appearances
          </Text>
          {profile.listEntries.length > 0 ? (
            profile.listEntries.map((entry) => {
              const list = lists.find((candidate) => candidate.id === entry.listId);
              return (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${list?.name ?? "list"}`}
                  onPress={() =>
                    list ? navigation.navigate("ListDetail", { listId: list.id }) : undefined
                  }
                  className="flex-row items-center gap-2 rounded-xl bg-stone-50 p-3 dark:bg-neutral-800"
                >
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
                      {list?.name ?? "Unknown list"}
                    </Text>
                    <Text className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
                      {entry.quantity} {entry.unit}
                      {entry.expectedPriceMinor === undefined
                        ? ""
                        : ` · Est. ${formatMoney(entry.expectedPriceMinor, entry.currency)}`}
                    </Text>
                  </View>
                  <Badge
                    label={entry.checked ? "Checked" : "To buy"}
                    tone={entry.checked ? "success" : "warning"}
                  />
                  <ChevronRight size={16} color="#a8a29e" />
                </Pressable>
              );
            })
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              Not currently present in a shopping list.
            </Text>
          )}
        </Card>

        <Card className="gap-3">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Price history
          </Text>
          {profile.purchases.length > 0 ? (
            profile.purchases.slice(0, 4).map((purchase) => (
              <View
                key={purchase.id}
                className="flex-row items-center justify-between gap-3 rounded-xl bg-stone-50 p-3 dark:bg-neutral-800"
              >
                <Text className="flex-1 text-xs text-stone-600 dark:text-neutral-300">
                  {formatDateLabel(purchase.purchasedAt)}
                  {purchase.shopName ? ` · ${purchase.shopName}` : ""}
                </Text>
                <Text className="text-xs font-bold text-stone-900 dark:text-white">
                  {formatMoney(purchase.unitPriceMinor, purchase.currency)}/{purchase.unit}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              Record purchases to build a price history.
            </Text>
          )}
        </Card>

        <Card className="gap-3">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Purchase history
          </Text>
          {profile.purchases.length > 0 ? (
            profile.purchases.map((purchase) => (
              <View
                key={purchase.id}
                className="flex-row items-center justify-between gap-3 border-b border-stone-100 pb-2 dark:border-neutral-800"
              >
                <View className="min-w-0 flex-1">
                  <Text className="text-xs font-semibold text-stone-800 dark:text-neutral-100">
                    {formatDateLabel(purchase.purchasedAt)} · {purchase.quantity}{" "}
                    {purchase.unit}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-stone-500 dark:text-neutral-400">
                    {[purchase.shopName, purchase.paymentMethod]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-stone-900 dark:text-white">
                  {formatMoney(purchase.totalMinor, purchase.currency)}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              No purchases recorded for this item.
            </Text>
          )}
        </Card>

        <Card className="gap-3">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Shops associated with this item
          </Text>
          {profile.shops.length > 0 ? (
            profile.shops.map((shop) => {
              const listedManually = (shop.soldItems ?? []).some(
                (soldItem) => normaliseNameKey(soldItem) === normaliseNameKey(name),
              );
              return (
                <Pressable
                  key={shop.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${shop.name}`}
                  onPress={() => navigation.navigate("ShopProfile", { shopId: shop.id })}
                  className="flex-row items-center gap-2 rounded-xl bg-stone-50 p-3 dark:bg-neutral-800"
                >
                  <Store size={16} color="#78716c" />
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
                      {shop.name}
                    </Text>
                    <Text className="text-xs text-stone-500 dark:text-neutral-400">
                      {listedManually ? "Listed as sold here" : "Previously purchased here"}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#a8a29e" />
                </Pressable>
              );
            })
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              No shop association recorded yet.
            </Text>
          )}
        </Card>

        {!productExists ? (
          <EmptyState
            icon={CircleAlert}
            compact
            title="This product is not in your data"
            message="Add it to a list or record a purchase to build its history."
          />
        ) : (
          <View className="flex-row items-center justify-center gap-1.5">
            <Package size={13} color="#a8a29e" />
            <Text className="text-[11px] text-stone-400 dark:text-neutral-500">
              One identity across every spelling of this name.
            </Text>
          </View>
        )}
      </ScrollView>

      <ItemForm
        visible={itemFormOpen}
        presetName={profile.summary.name}
        onClose={() => setItemFormOpen(false)}
      />
      <PurchaseForm
        visible={purchaseOpen}
        preset={{
          name: profile.summary.name,
          unit: lastPurchase?.unit,
          quantity: lastPurchase?.quantity,
          unitPriceMinor: profile.summary.lastUnitPriceMinor,
          currency: profile.summary.currency,
          shopId: lastPurchase?.shopId,
        }}
        onClose={() => setPurchaseOpen(false)}
      />
    </Screen>
  );
}
