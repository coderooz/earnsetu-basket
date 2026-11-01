/** @format */

/**
 * @fileOverview ShopsScreen
 * @description Shops tab: shop directory with all/favourites filter, search,
 * shop rows, and an add shop button.
 *
 * @module src/screens/ShopsScreen
 * @author Coderooz
 * @see {@link @/navigation/AppNavigation}
 */

import { useNavigation } from "@react-navigation/native";
import { Plus, Store } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList } from "react-native";

import { ShopRow } from "@/components/basket";
import {
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  SearchField,
  SegmentedControl,
} from "@/components/common";
import { ShopForm } from "@/components/forms/ShopForm";
import { useBasket } from "@/context/BasketProvider";
import { useDebouncedValue } from "@/hooks";
import type { RootNavigation } from "@/navigation/types";
import { includesQuery } from "@/utils/text";

type Filter = "all" | "favourites";

export default function ShopsScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { shops } = useBasket();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const query = useDebouncedValue(search);

  const visible = useMemo(
    () =>
      shops.filter((shop) => {
        const matchesFilter = filter === "all" || shop.favorite === true;
        return (
          matchesFilter &&
          includesQuery([shop.name, shop.category, shop.phone, shop.address], query)
        );
      }),
    [shops, filter, query],
  );

  return (
    <Screen>
      <ScreenHeader
        title="Shops"
        subtitle={`${shops.length} saved · ${shops.filter((shop) => shop.favorite).length} favourite`}
        actions={
          <IconButton
            icon={Plus}
            variant="primary"
            onPress={() => setFormOpen(true)}
            accessibilityLabel="Add a shop"
          />
        }
      >
        <SegmentedControl
          accessibilityLabel="Filter shops"
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All shops", value: "all" },
            { label: "Favourites", value: "favourites" },
          ]}
        />
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search shops"
          accessibilityLabel="Search shops"
        />
      </ScreenHeader>

      <FlatList
        data={visible}
        keyExtractor={(shop) => shop.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <ShopRow
            shop={item}
            onPress={() => navigation.navigate("ShopProfile", { shopId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Store}
            title={
              query
                ? "No shops match your search"
                : filter === "favourites"
                  ? "No favourite shops"
                  : "No shops saved"
            }
            message={
              query
                ? "Try a different name or category."
                : filter === "favourites"
                  ? "Mark a shop as favourite when you edit it."
                  : "Keep a personal directory of the shops you use. Shops are optional."
            }
            action={
              !query && filter === "all" ? (
                <Button label="Add a shop" icon={Plus} onPress={() => setFormOpen(true)} />
              ) : undefined
            }
          />
        }
      />

      <ShopForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}
