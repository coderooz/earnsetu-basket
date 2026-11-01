/** @format */

/**
 * @fileOverview ShopProfileScreen
 * @description Shop profile screen: shop details, items sold here (manual
 * catalogue), planned items at this shop, and purchase history. Actions to
 * edit, delete, record a purchase, or add sold items.
 *
 * @module src/screens/ShopProfileScreen
 * @author Coderooz
 * @see {@link @/navigation/types#RootStackParamList}
 * @see {@link @/navigation/AppNavigation}
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import {
  CircleAlert,
  Pencil,
  Plus,
  ReceiptText,
  Star,
  Store,
  Trash,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { PurchaseRow } from "@/components/basket";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  Sheet,
  TextField,
} from "@/components/common";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { ShopForm } from "@/components/forms/ShopForm";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { updateShopAction } from "@/lib/shops/actions/update-shop.action";
import { deleteShopAction } from "@/lib/shops/actions/delete-shop.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { RootNavigation, RootStackParamList } from "@/navigation/types";
import { formatMoney } from "@/utils/money";
import { normaliseNameKey, splitCommaList } from "@/utils/text";

export default function ShopProfileScreen() {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<RouteProp<RootStackParamList, "ShopProfile">>();
  const { shops, items, purchases, lists, refresh } = useBasket();
  const { showToast } = useToast();

  const shop = shops.find((entry) => entry.id === route.params.shopId);

  const [editOpen, setEditOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [newItems, setNewItems] = useState("");
  const [busy, setBusy] = useState(false);

  const shopPurchases = useMemo(() => {
    if (!shop) return [];
    const shopKey = normaliseNameKey(shop.name);
    return purchases.filter(
      (purchase) =>
        purchase.shopId === shop.id ||
        (!purchase.shopId && normaliseNameKey(purchase.shopName ?? "") === shopKey),
    );
  }, [purchases, shop]);

  const linkedItems = useMemo(
    () => items.filter((item) => item.shopId === route.params.shopId),
    [items, route.params.shopId],
  );

  const totalSpend = shopPurchases.reduce(
    (sum, purchase) => sum + purchase.totalMinor,
    0,
  );
  const currency = shopPurchases[0]?.currency ?? "INR";

  if (!shop) {
    return (
      <Screen includeBottomInset>
        <ScreenHeader title="Shop" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={CircleAlert}
          title="This shop no longer exists"
          message="It may have been deleted on this device."
          action={<Button label="Go back" onPress={() => navigation.goBack()} />}
        />
      </Screen>
    );
  }

  const saveSoldItems = async (soldItems: string[]) => {
    setBusy(true);
    try {
      await updateShopAction(shop.id, { ...shop, soldItems });
      await refresh();
      showToast("Shop items updated.", "success");
    } catch (failure) {
      showToast(toUserMessage(failure, "Could not update this shop."), "error");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete this shop?",
      `“${shop.name}” will be removed from your directory. Purchase history keeps the shop name.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteShopAction(shop.id);
                await refresh();
                showToast("Shop deleted.", "success");
                navigation.goBack();
              } catch (failure) {
                showToast(toUserMessage(failure, "Could not delete this shop."), "error");
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen includeBottomInset>
      <ScreenHeader
        title={shop.name}
        subtitle={shop.category}
        onBack={() => navigation.goBack()}
        actions={
          <>
            <IconButton
              icon={Pencil}
              variant="bare"
              onPress={() => setEditOpen(true)}
              accessibilityLabel="Edit shop"
            />
            <IconButton
              icon={Trash}
              variant="danger"
              onPress={confirmDelete}
              accessibilityLabel="Delete shop"
            />
          </>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}>
        <Card className="gap-2">
          <View className="flex-row items-center gap-2">
            <Store size={16} color="#15803d" />
            <Text className="flex-1 text-sm font-bold text-stone-900 dark:text-white">
              Shop details
            </Text>
            {shop.favorite ? (
              <View className="flex-row items-center gap-1">
                <Star size={13} color="#d97706" fill="#fbbf24" />
                <Text className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Favourite
                </Text>
              </View>
            ) : null}
          </View>

          {shop.phone ? (
            <Text className="text-xs text-stone-600 dark:text-neutral-300">
              Phone: {shop.phone}
            </Text>
          ) : null}
          {shop.address ? (
            <Text className="text-xs text-stone-600 dark:text-neutral-300">
              Address: {shop.address}
            </Text>
          ) : null}
          {shop.notes ? (
            <Text className="text-xs leading-5 text-stone-500 dark:text-neutral-400">
              {shop.notes}
            </Text>
          ) : null}
          {!shop.phone && !shop.address && !shop.notes ? (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              No contact details yet.Use edit to add them.
            </Text>
          ) : null}
        </Card>

        <View className="flex-row gap-2">
          <Button
            label="Record purchase here"
            icon={ReceiptText}
            className="flex-1"
            onPress={() => setPurchaseOpen(true)}
          />
          <Button
            label="Add items"
            icon={Plus}
            variant="secondary"
            className="flex-1"
            onPress={() => {
              setNewItems("");
              setAddItemsOpen(true);
            }}
          />
        </View>

        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-stone-900 dark:text-white">
              Items sold here
            </Text>
            <Badge label={`${(shop.soldItems ?? []).length}`} tone="neutral" />
          </View>
          <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
            Your own note. Nothing here is inferred from purchases.
          </Text>

          {(shop.soldItems ?? []).length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {(shop.soldItems ?? []).map((soldItem) => (
                <View
                  key={soldItem}
                  className="flex-row items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 dark:bg-neutral-800"
                >
                  <Text className="text-xs text-stone-700 dark:text-neutral-200">
                    {soldItem}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${soldItem} from this shop`}
                    hitSlop={8}
                    disabled={busy}
                    onPress={() => {
                      void saveSoldItems(
                        (shop.soldItems ?? []).filter((entry) => entry !== soldItem),
                      );
                    }}
                  >
                    <X size={12} color="#a8a29e" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              No items listed yet.
            </Text>
          )}
        </Card>

        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-stone-900 dark:text-white">
              Planned items at this shop
            </Text>
            <Badge label={`${linkedItems.length}`} tone="accent" />
          </View>
          {linkedItems.length > 0 ? (
            linkedItems.map((item) => {
              const list = lists.find((candidate) => candidate.id === item.listId);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${list?.name ?? "list"}`}
                  onPress={() =>
                    list ? navigation.navigate("ListDetail", { listId: list.id }) : undefined
                  }
                  className="flex-row items-center gap-2 rounded-xl bg-stone-50 p-3 dark:bg-neutral-800"
                >
                  <View className="min-w-0 flex-1">
                    <Text className="text-xs font-semibold text-stone-800 dark:text-neutral-100">
                      {item.name}
                    </Text>
                    <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
                      {list?.name ?? "Unknown list"} · {item.quantity} {item.unit}
                    </Text>
                  </View>
                  <Badge
                    label={item.checked ? "Checked" : "To buy"}
                    tone={item.checked ? "success" : "warning"}
                  />
                </Pressable>
              );
            })
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              No planned items are assigned to this shop.
            </Text>
          )}
        </Card>

        <Card className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-stone-900 dark:text-white">
              Purchase history
            </Text>
            <Text className="text-xs font-semibold text-stone-700 dark:text-neutral-200">
              {formatMoney(totalSpend, currency)}
            </Text>
          </View>
          {shopPurchases.length > 0 ? (
            <View className="overflow-hidden rounded-xl border border-stone-100 dark:border-neutral-800">
              {shopPurchases.slice(0, 10).map((purchase) => (
                <PurchaseRow
                  key={purchase.id}
                  purchase={purchase}
                  onOpen={() =>
                    navigation.navigate("ProductProfile", { name: purchase.itemName })
                  }
                />
              ))}
            </View>
          ) : (
            <Text className="text-xs text-stone-500 dark:text-neutral-400">
              No purchases recorded at this shop yet.
            </Text>
          )}
        </Card>
      </ScrollView>

      {editOpen && (
        <ShopForm visible={editOpen} initial={shop} onClose={() => setEditOpen(false)} />
      )}
      {purchaseOpen && (
        <PurchaseForm
          visible={purchaseOpen}
          presetShopId={shop.id}
          onClose={() => setPurchaseOpen(false)}
        />
      )}
      <Sheet
        visible={addItemsOpen}
        title="Add items sold here"
        subtitle="Separate names with commas."
        onClose={() => setAddItemsOpen(false)}
        footer={
          <View className="flex-row gap-2">
            <Button
              label="Cancel"
              variant="secondary"
              className="flex-1"
              onPress={() => setAddItemsOpen(false)}
              disabled={busy}
            />
            <Button
              label="Add items"
              className="flex-1"
              loading={busy}
              onPress={() => {
                void (async () => {
                  const names = splitCommaList(newItems);
                  if (names.length === 0) {
                    showToast("Enter at least one item name.", "error");
                    return;
                  }
                  await saveSoldItems([...(shop.soldItems ?? []), ...names]);
                  setAddItemsOpen(false);
                })();
              }}
            />
          </View>
        }
      >
        <TextField
          label="Item names"
          value={newItems}
          onChangeText={setNewItems}
          placeholder="Rice, dal, oil"
          autoFocus
        />
      </Sheet>
    </Screen>
  );
}
