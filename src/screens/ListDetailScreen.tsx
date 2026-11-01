/** @format */

/**
 * @fileOverview ListDetailScreen
 * @description Detail screen for a single shopping list: progress bar, planned
 * vs checked items, estimated pending value, filters (all/todo/checked), search,
 * and per-item rows (toggle, buy, edit, delete). List-level actions (edit,
 * archive/restore, delete) via Alert.
 *
 * @module src/screens/ListDetailScreen
 * @author Coderooz
 * @see {@link @/navigation/types#RootStackParamList}
 * @see {@link @/lib/stats/helpers/stats.helpers#computeListProgress}
 */

import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import {
  ArchiveRestore,
  Check,
  CircleAlert,
  EllipsisVertical,
  Pencil,
  Plus,
  ShoppingBasket,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

import { ItemRow } from "@/components/basket";
import {
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  SearchField,
  SegmentedControl,
  TextAction,
} from "@/components/common";
import { ItemForm } from "@/components/forms/ItemForm";
import { ListForm } from "@/components/forms/ListForm";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { useDebouncedValue } from "@/hooks";
import { deleteItemAction } from "@/lib/items/actions/delete-item.action";
import { toggleItemCheckedAction } from "@/lib/items/actions/toggle-item.action";
import { deleteListAction } from "@/lib/lists/actions/delete-list.action";
import {
  archiveListAction,
  restoreListAction,
} from "@/lib/lists/actions/update-list.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import { computeListProgress } from "@/lib/stats/helpers/stats.helpers";
import type { RootNavigation, RootStackParamList } from "@/navigation/types";
import type { ListItem } from "@/types/basket.types";
import { formatDateLabel } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { includesQuery } from "@/utils/text";

type Filter = "all" | "todo" | "checked";

export default function ListDetailScreen() {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<RouteProp<RootStackParamList, "ListDetail">>();
  const { lists, items, refresh } = useBasket();
  const { showToast } = useToast();

  const list = lists.find((entry) => entry.id === route.params.listId);
  const listItems = useMemo(
    () => items.filter((item) => item.listId === route.params.listId),
    [items, route.params.listId],
  );

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editListOpen, setEditListOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | undefined>();
  const [purchaseSource, setPurchaseSource] = useState<ListItem | undefined>();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const query = useDebouncedValue(search);

  const progress = computeListProgress(items, route.params.listId);
  const pendingValue = listItems
    .filter((item) => !item.checked)
    .reduce((sum, item) => sum + (item.expectedPriceMinor ?? 0) * item.quantity, 0);

  const visible = useMemo(
    () =>
      listItems.filter((item) => {
        const matchesFilter =
          filter === "all"
            ? true
            : filter === "todo"
              ? !item.checked
              : item.checked;
        return matchesFilter && includesQuery([item.name, item.notes, item.shopName], query);
      }),
    [listItems, filter, query],
  );

  if (!list) {
    return (
      <Screen includeBottomInset>
        <ScreenHeader title="List" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={CircleAlert}
          title="This list no longer exists"
          message="It may have been deleted on this device."
          action={<Button label="Go back" onPress={() => navigation.goBack()} />}
        />
      </Screen>
    );
  }

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      await refresh();
      showToast(message, "success");
    } catch (failure) {
      showToast(toUserMessage(failure, "Could not update this list."), "error");
    }
  };

  const toggleItem = async (item: ListItem) => {
    await runAction(() => toggleItemCheckedAction(item.id), "Item updated.");
  };

  const confirmDeleteItem = (item: ListItem) => {
    Alert.alert("Delete item?", `â€œ${item.name}â€ will be removed from this list.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void runAction(() => deleteItemAction(item.id), "Item deleted.");
        },
      },
    ]);
  };

  const openListMenu = () => {
    const options = [
      list.archived
        ? {
            text: "Restore list",
            onPress: () => {
              void runAction(() => restoreListAction(list.id), "List restored.");
            },
          }
        : {
            text: "Archive list",
            onPress: () => {
              void runAction(() => archiveListAction(list.id), "List archived.");
            },
          },
      {
        text: "Delete permanently",
        style: "destructive" as const,
        onPress: () => {
          Alert.alert(
            "Delete list permanently?",
            `â€œ${list.name}â€ and its ${listItems.length} entries will be removed. Purchases stay in your history.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  void (async () => {
                    await runAction(() => deleteListAction(list.id), "List deleted.");
                    navigation.goBack();
                  })();
                },
              },
            ],
          );
        },
      },
      { text: "Cancel", style: "cancel" as const },
    ];

    Alert.alert(list.name, "Manage this list", options);
  };

  const openItemForEdit = (item: ListItem) => {
    setEditingItem(item);
    setItemFormOpen(true);
  };

  return (
    <Screen includeBottomInset>
      <ScreenHeader
        title={list.name}
        subtitle={
          list.plannedFor ? `Planned for ${formatDateLabel(list.plannedFor)}` : undefined
        }
        onBack={() => navigation.goBack()}
        actions={
          <>
            <IconButton
              icon={Pencil}
              variant="bare"
              onPress={() => setEditListOpen(true)}
              accessibilityLabel="Edit list details"
            />
            <IconButton
              icon={EllipsisVertical}
              variant="bare"
              onPress={openListMenu}
              accessibilityLabel="More list actions"
            />
          </>
        }
      />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="gap-3 px-4 pb-3">
            <View className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-stone-900 dark:text-white">
                  {progress.checked}/{progress.total} checked
                </Text>
                <Text className="text-xs font-semibold text-green-700 dark:text-green-400">
                  {progress.percent}%
                </Text>
              </View>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-neutral-800">
                <View
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${progress.percent}%` }}
                />
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-xs text-stone-500 dark:text-neutral-400">
                  Estimated to buy
                </Text>
                <Text className="text-sm font-bold text-stone-900 dark:text-white">
                  {formatMoney(pendingValue)}
                </Text>
              </View>
              {list.description ? (
                <Text className="mt-3 text-xs leading-5 text-stone-500 dark:text-neutral-400">
                  {list.description}
                </Text>
              ) : null}
            </View>

            {list.archived ? (
              <View className="flex-row items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                <ArchiveRestore size={15} color="#78716c" />
                <Text className="flex-1 text-xs text-stone-600 dark:text-neutral-300">
                  This list is archived and read-only.
                </Text>
                <TextAction
                  label="Restore"
                  onPress={() => {
                    void runAction(() => restoreListAction(list.id), "List restored.");
                  }}
                />
              </View>
            ) : (
              <Button
                label="Add items"
                icon={Plus}
                onPress={() => {
                  setEditingItem(undefined);
                  setItemFormOpen(true);
                }}
              />
            )}

            <SegmentedControl
              accessibilityLabel="Filter items"
              value={filter}
              onChange={setFilter}
              options={[
                { label: "All", value: "all" },
                { label: "To buy", value: "todo" },
                { label: "Checked", value: "checked" },
              ]}
            />
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Search this list"
              accessibilityLabel="Search items in this list"
            />
          </View>
        }
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            readOnly={list.archived}
            onToggle={() => {
              void toggleItem(item);
            }}
            onOpen={() => navigation.navigate("ProductProfile", { name: item.name })}
            onBuy={() => {
              setPurchaseSource(item);
              setPurchaseOpen(true);
            }}
            onEdit={() => openItemForEdit(item)}
            onDelete={() => confirmDeleteItem(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={query ? ShoppingBasket : filter === "checked" ? Check : ShoppingBasket}
            title={
              query
                ? "No matching items"
                : filter === "checked"
                  ? "Nothing checked yet"
                  : filter === "todo"
                    ? "Everything is checked"
                    : "This list is empty"
            }
            message={
              list.archived
                ? "This plan is archived. Restore it to add or change items."
                : "Add the things you need. A name alone is enough."
            }
            action={
              !list.archived && !query && filter === "all" ? (
                <Button
                  label="Add item"
                  icon={Plus}
                  onPress={() => {
                    setEditingItem(undefined);
                    setItemFormOpen(true);
                  }}
                />
              ) : undefined
            }
          />
        }
      />

      {editListOpen && (
        <ListForm
          visible={editListOpen}
          initial={list}
          onClose={() => setEditListOpen(false)}
        />
      )}
      {itemFormOpen && (
        <ItemForm
          visible={itemFormOpen}
          listId={list.id}
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

