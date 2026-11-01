/** @format */

/**
 * @fileOverview ListsScreen
 * @description Lists tab: all shopping lists with active/archived filter,
 * search, list cards (progress, archive/restore/delete), and a create list
 * button.
 *
 * @module src/screens/ListsScreen
 * @author Coderooz
 * @see {@link @/navigation/AppNavigation}
 */

import { useNavigation } from "@react-navigation/native";
import { Archive, LayoutList, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, FlatList, Text } from "react-native";

import { ListCard } from "@/components/basket";
import {
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  SearchField,
  SegmentedControl,
} from "@/components/common";
import { ListForm } from "@/components/forms/ListForm";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { useDebouncedValue } from "@/hooks";
import { deleteListAction } from "@/lib/lists/actions/delete-list.action";
import {
  archiveListAction,
  restoreListAction,
} from "@/lib/lists/actions/update-list.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { RootNavigation } from "@/navigation/types";
import type { ShoppingList } from "@/types/basket.types";
import { includesQuery } from "@/utils/text";

type Filter = "active" | "archived";

export default function ListsScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { lists, items, refresh } = useBasket();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ open: boolean; editing?: ShoppingList }>({
    open: false,
  });

  const query = useDebouncedValue(search);

  const visible = useMemo(
    () =>
      lists.filter((list) => {
        const matchesFilter = filter === "active" ? !list.archived : list.archived;
        return (
          matchesFilter && includesQuery([list.name, list.description], query)
        );
      }),
    [lists, filter, query],
  );

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      await refresh();
      showToast(message, "success");
    } catch (failure) {
      showToast(toUserMessage(failure, "Could not update this list."), "error");
    }
  };

  const confirmDelete = (list: ShoppingList) => {
    Alert.alert(
      "Delete list permanently?",
      `“${list.name}” and its ${items.filter((item) => item.listId === list.id).length} entries will be removed. Purchases stay in your history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void runAction(() => deleteListAction(list.id), "List deleted.");
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title="Shopping lists"
        subtitle={`${lists.filter((list) => !list.archived).length} active · ${lists.filter((list) => list.archived).length} archived`}
        actions={
          <IconButton
            icon={Plus}
            variant="primary"
            onPress={() => setForm({ open: true })}
            accessibilityLabel="Create a shopping list"
          />
        }
      >
        <SegmentedControl
          accessibilityLabel="Filter lists"
          value={filter}
          onChange={setFilter}
          options={[
            { label: "Active", value: "active" },
            { label: "Archived", value: "archived" },
          ]}
        />
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search lists"
          accessibilityLabel="Search shopping lists"
        />
      </ScreenHeader>

      <FlatList
        data={visible}
        keyExtractor={(list) => list.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ListCard
            list={item}
            items={items}
            onPress={() => navigation.navigate("ListDetail", { listId: item.id })}
            onEdit={() => setForm({ open: true, editing: item })}
            onArchive={
              item.archived
                ? undefined
                : () => {
                    void runAction(() => archiveListAction(item.id), "List archived.");
                  }
            }
            onRestore={
              item.archived
                ? () => {
                    void runAction(() => restoreListAction(item.id), "List restored.");
                  }
                : undefined
            }
            onDelete={item.archived ? () => confirmDelete(item) : undefined}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={filter === "archived" ? Archive : LayoutList}
            title={
              query
                ? "No lists match your search"
                : filter === "archived"
                  ? "Nothing archived"
                  : "No shopping lists yet"
            }
            message={
              query
                ? "Try a different name."
                : filter === "archived"
                  ? "Lists you archive are kept here until you delete them."
                  : "A list is a plan. Create one for your next shopping trip."
            }
            action={
              !query && filter === "active" ? (
                <Button
                  label="Create a list"
                  icon={Plus}
                  onPress={() => setForm({ open: true })}
                />
              ) : undefined
            }
          />
        }
        ListFooterComponent={
          lists.length > 0 ? (
            <Text className="pt-2 text-center text-[11px] text-stone-400 dark:text-neutral-500">
              Archive a list when you are done. Deletion is permanent.
            </Text>
          ) : undefined
        }
      />

      <ListForm
        visible={form.open}
        initial={form.editing}
        onClose={() => setForm({ open: false })}
      />
    </Screen>
  );
}
