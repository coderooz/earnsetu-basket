/** @format */

/**
 * @fileOverview HomeScreen
 * @description Home tab: dashboard showing the focus list, open items, recent
 * purchases, summary stat cards, and quick actions (new list, add item, record
 * purchase). Includes an opportunistic sync banner when outbox operations are
 * pending.
 *
 * @module src/screens/HomeScreen
 * @author Coderooz
 * @see {@link @/context/BasketProvider#useBasket}
 * @see {@link @/navigation/AppNavigation}
 */

import { useNavigation } from "@react-navigation/native";
import {
  CircleAlert,
  LayoutList,
  Plus,
  ReceiptText,
  RefreshCw,
  Settings,
  ShoppingBasket,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { ItemRow, PurchaseRow } from "@/components/basket";
import {
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  StatCard,
  TextAction,
} from "@/components/common";
import { ListForm } from "@/components/forms/ListForm";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { ItemForm } from "@/components/forms/ItemForm";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { toggleItemCheckedAction } from "@/lib/items/actions/toggle-item.action";
import { deleteItemAction } from "@/lib/items/actions/delete-item.action";
import { settingsService } from "@/lib/settings/services/settings.service";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { ListItem, ShoppingList } from "@/types/basket.types";
import type { RootNavigation } from "@/navigation/types";
import { formatLongDate } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { cn } from "@/utils/cn";

export default function HomeScreen() {
  const navigation = useNavigation<RootNavigation>();
  const {
    lists,
    items,
    purchases,
    stats,
    pending,
    syncing,
    refresh,
    refreshing,
    syncNow,
  } = useBasket();
  const { showToast } = useToast();

  const activeLists = useMemo(() => lists.filter((list) => !list.archived), [lists]);

  const [selectedListId, setSelectedListId] = useState<string | undefined>();
  const [listForm, setListForm] = useState<{ open: boolean; editing?: ShoppingList }>({
    open: false,
  });
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | undefined>();
  const [purchaseSource, setPurchaseSource] = useState<ListItem | undefined>();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    let active = true;

    settingsService.getSelectedListId().then((stored) => {
      if (!active) return;
      const stillExists = stored && activeLists.some((list) => list.id === stored);
      setSelectedListId(stillExists ? stored : activeLists[0]?.id);
    });

    return () => {
      active = false;
    };
  }, [activeLists]);

  const focusList = activeLists.find((list) => list.id === selectedListId) ?? activeLists[0];
  const focusItems = useMemo(
    () => (focusList ? items.filter((item) => item.listId === focusList.id) : []),
    [focusList, items],
  );
  const openItems = focusItems.filter((item) => !item.checked).slice(0, 6);

  const recentPurchases = useMemo(() => purchases.slice(0, 3), [purchases]);

  const selectList = (id: string) => {
    setSelectedListId(id);
    void settingsService.setSelectedListId(id);
  };

  const toggleItem = async (item: ListItem) => {
    try {
      await toggleItemCheckedAction(item.id);
      await refresh();
    } catch (failure) {
      showToast(toUserMessage(failure, "Could not update this item."), "error");
    }
  };

  const confirmDeleteItem = (item: ListItem) => {
    Alert.alert("Delete item?", `â€œ${item.name}â€ will be removed from this list.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteItemAction(item.id);
              await refresh();
              showToast("Item deleted.", "success");
            } catch (failure) {
              showToast(toUserMessage(failure, "Could not delete this item."), "error");
            }
          })();
        },
      },
    ]);
  };

  const openPurchaseForItem = (item: ListItem) => {
    setPurchaseSource(item);
    setPurchaseOpen(true);
  };

  const openNewItem = () => {
    if (!focusList) {
      setListForm({ open: true });
      showToast("Create a list before adding items.");
      return;
    }
    setItemFormOpen(true);
  };

  return (
    <Screen>
      <ScreenHeader
        title="EarnSetu Basket"
        subtitle={formatLongDate()}
        hideTitle
        actions={
          <IconButton
            icon={Settings}
            variant="bare"
            onPress={() => navigation.navigate("Settings")}
            accessibilityLabel="Open settings"
          />
        }
      >
        <View>
          <Text className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Plan better.
          </Text>
          <Text className="text-2xl font-extrabold text-green-700 dark:text-green-400">
            Buy smarter.
          </Text>
          <Text className="mt-1 text-xs text-stone-500 dark:text-neutral-400">
            {formatLongDate()}
          </Text>
        </View>
      </ScreenHeader>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refresh();
            }}
            tintColor="#15803d"
          />
        }
      >
        {pending > 0 ? (
          <View className="mx-4 mb-3">
            <View className="flex-row items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
              <CircleAlert size={17} color="#b45309" />
              <Text className="flex-1 text-xs text-amber-800 dark:text-amber-300">
                {pending} change{pending === 1 ? "" : "s"} waiting to sync. Your data is
                safe on this device.
              </Text>
              <Button
                label={syncing ? "Syncing" : "Sync"}
                variant="secondary"
                size="sm"
                onPress={() => {
                  void syncNow();
                }}
                loading={syncing}
              />
            </View>
          </View>
        ) : null}

        <View className="mx-4 flex-row flex-wrap gap-2.5">
          <View className="flex-row gap-2.5">
            <StatCard
              label="Pending items"
              value={String(stats.uncheckedItems)}
              hint="Across active lists"
              icon={ShoppingBasket}
              tone="primary"
            />
            <StatCard
              label="Active lists"
              value={String(stats.activeLists)}
              hint="Plans in progress"
              icon={LayoutList}
            />
          </View>
          <View className="flex-row gap-2.5">
            <StatCard
              label="This month"
              value={formatMoney(stats.monthSpendMinor, stats.currency)}
              hint={`${stats.monthPurchaseCount} purchase${stats.monthPurchaseCount === 1 ? "" : "s"}`}
              icon={Wallet}
              tone="warning"
            />
            <StatCard
              label="Today"
              value={formatMoney(stats.todaySpendMinor, stats.currency)}
              hint="Recorded spend"
              icon={TrendingUp}
            />
          </View>
        </View>

        <View className="mx-4 mt-3 flex-row items-center gap-2">
          <Text className="flex-1 text-xs text-stone-500 dark:text-neutral-400">
            Estimated pending value:{" "}
            <Text className="font-semibold text-stone-700 dark:text-neutral-200">
              {formatMoney(stats.estimatedPendingMinor, stats.currency)}
            </Text>
          </Text>
        </View>

        <View className="mx-4 mt-4 flex-row gap-2">
          <Button
            label="New list"
            icon={Plus}
            size="sm"
            onPress={() => setListForm({ open: true })}
            className="flex-1"
          />
          <Button
            label="Add item"
            icon={Plus}
            size="sm"
            variant="secondary"
            onPress={openNewItem}
            className="flex-1"
          />
          <Button
            label="Purchase"
            icon={ReceiptText}
            size="sm"
            variant="secondary"
            onPress={() => {
              setPurchaseSource(undefined);
              setPurchaseOpen(true);
            }}
            className="flex-1"
          />
        </View>

        <View className="mt-6 flex-row items-center justify-between px-4">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Your focus list
          </Text>
          <TextAction
            label="All lists"
            tone="muted"
            onPress={() => navigation.navigate("Tabs", { screen: "Lists" })}
          />
        </View>

        {activeLists.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}
          >
            {activeLists.map((list) => {
              const selected = list.id === focusList?.id;
              return (
                <Pressable
                  key={list.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => selectList(list.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5",
                    selected
                      ? "border-green-700 bg-green-700"
                      : "border-stone-300 bg-white dark:border-neutral-700 dark:bg-neutral-900",
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-semibold",
                      selected ? "text-white" : "text-stone-700 dark:text-neutral-200",
                    )}
                  >
                    {list.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View className="mx-4 mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {focusList ? (
            <>
              <View className="flex-row items-center gap-2 px-4 py-3">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-stone-900 dark:text-white">
                    {focusList.name}
                  </Text>
                  <Text className="text-xs text-stone-500 dark:text-neutral-400">
                    {focusItems.filter((item) => item.checked).length} of{" "}
                    {focusItems.length} checked
                  </Text>
                </View>
                <TextAction
                  label="Open list"
                  onPress={() =>
                    navigation.navigate("ListDetail", { listId: focusList.id })
                  }
                />
              </View>

              {openItems.length > 0 ? (
                openItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => {
                      void toggleItem(item);
                    }}
                    onOpen={() =>
                      navigation.navigate("ProductProfile", { name: item.name })
                    }
                    onBuy={() => openPurchaseForItem(item)}
                    onEdit={() => {
                      setEditingItem(item);
                      setItemFormOpen(true);
                    }}
                    onDelete={() => confirmDeleteItem(item)}
                  />
                ))
              ) : (
                <EmptyState
                  compact
                  icon={ShoppingBasket}
                  title={focusItems.length ? "Everything is checked" : "This list is empty"}
                  message={
                    focusItems.length
                      ? "Record a purchase when you actually buy something."
                      : "Add the first item you need to plan for."
                  }
                  action={
                    <Button label="Add item" icon={Plus} size="sm" onPress={openNewItem} />
                  }
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={LayoutList}
              title="No plans yet"
              message="Create a list, add what you need, and check items off as you shop."
              action={
                <Button
                  label="Create your first list"
                  icon={Plus}
                  onPress={() => setListForm({ open: true })}
                />
              }
            />
          )}
        </View>

        <View className="mt-6 flex-row items-center justify-between px-4">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Recent purchases
          </Text>
          <TextAction
            label="View all"
            tone="muted"
            onPress={() => navigation.navigate("Tabs", { screen: "Purchases" })}
          />
        </View>

        <View className="mx-4 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {recentPurchases.length > 0 ? (
            recentPurchases.map((purchase) => (
              <PurchaseRow
                key={purchase.id}
                purchase={purchase}
                onOpen={() =>
                  navigation.navigate("ProductProfile", { name: purchase.itemName })
                }
              />
            ))
          ) : (
            <EmptyState
              compact
              icon={ReceiptText}
              title="No purchases recorded"
              message="Planning is separate from buying, so purchases only appear when you record them."
            />
          )}
        </View>

        {pending > 0 ? (
          <View className="mx-4 mt-4">
            <Button
              label="Sync now"
              icon={RefreshCw}
              variant="subtle"
              onPress={() => {
                void syncNow();
              }}
              loading={syncing}
            />
          </View>
        ) : null}
      </ScrollView>

      {listForm.open && (
        <ListForm
          visible={listForm.open}
          initial={listForm.editing}
          onClose={() => setListForm({ open: false })}
          onSaved={(list) => selectList(list.id)}
        />
      )}
      {focusList && itemFormOpen && (
        <ItemForm
          visible={itemFormOpen}
          listId={focusList.id}
          initial={editingItem}
          onClose={() => {
            setItemFormOpen(false);
            setEditingItem(undefined);
          }}
        />
      )}
      {purchaseOpen && (
        <PurchaseForm
          visible={purchaseOpen}
          sourceItem={purchaseSource}
          onClose={() => setPurchaseOpen(false)}
        />
      )}
    </Screen>
  );
}

