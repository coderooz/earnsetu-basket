/** @format */

/**
 * @fileOverview PurchasesScreen
 * @description Purchases tab: recorded purchases grouped by month section with
 * section totals, search, all-time/this-month filter, stat cards, and per-purchase
 * rows (open product, delete). Record a purchase via the quick action.
 *
 * @module src/screens/PurchasesScreen
 * @author Coderooz
 * @see {@link @/utils/date#monthKeyOf}
 * @see {@link @/navigation/AppNavigation}
 */

import { useNavigation } from "@react-navigation/native";
import { Plus, ReceiptText } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, SectionList, Text, View } from "react-native";

import { PurchaseRow } from "@/components/basket";
import {
  Button,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  SearchField,
  SegmentedControl,
  StatCard,
} from "@/components/common";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { useDebouncedValue } from "@/hooks";
import { deletePurchaseAction } from "@/lib/purchases/actions/delete-purchase.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { RootNavigation } from "@/navigation/types";
import type { Purchase } from "@/types/basket.types";
import { currentMonthKey, formatMonthYear, monthKeyOf } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { includesQuery } from "@/utils/text";

type Filter = "all" | "month";

interface PurchaseSection {
  key: string;
  title: string;
  totalMinor: number;
  currency: string;
  data: Purchase[];
}

export default function PurchasesScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { purchases, stats, refresh } = useBasket();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const query = useDebouncedValue(search);
  const monthKey = currentMonthKey();

  const visible = useMemo(
    () =>
      purchases.filter((purchase) => {
        const matchesFilter =
          filter === "all" || monthKeyOf(purchase.purchasedAt) === monthKey;
        return (
          matchesFilter &&
          includesQuery(
            [purchase.itemName, purchase.shopName, purchase.paymentMethod, purchase.notes],
            query,
          )
        );
      }),
    [purchases, filter, query, monthKey],
  );

  const sections = useMemo<PurchaseSection[]>(() => {
    const grouped = new Map<string, Purchase[]>();
    for (const purchase of visible) {
      const key = monthKeyOf(purchase.purchasedAt);
      const existing = grouped.get(key);
      if (existing) existing.push(purchase);
      else grouped.set(key, [purchase]);
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          key,
          title: formatMonthYear(year, month - 1),
          totalMinor: data.reduce((sum, purchase) => sum + purchase.totalMinor, 0),
          currency: data[0]?.currency ?? stats.currency,
          data,
        };
      });
  }, [visible, stats.currency]);

  const confirmDelete = (purchase: Purchase) => {
    Alert.alert(
      "Delete this purchase?",
      `${purchase.itemName} on ${formatMoney(purchase.totalMinor, purchase.currency)} will be removed from your history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deletePurchaseAction(purchase.id);
                await refresh();
                showToast("Purchase deleted.", "success");
              } catch (failure) {
                showToast(
                  toUserMessage(failure, "Could not delete this purchase."),
                  "error",
                );
              }
            })();
          },
        },
      ],
    );
  };

  const allTimeTotal = purchases.reduce(
    (sum, purchase) => sum + purchase.totalMinor,
    0,
  );

  return (
    <Screen>
      <ScreenHeader
        title="Purchases"
        subtitle={`${purchases.length} recorded · ${formatMoney(allTimeTotal, stats.currency)} all time`}
        actions={
          <IconButton
            icon={Plus}
            variant="primary"
            onPress={() => setFormOpen(true)}
            accessibilityLabel="Record a purchase"
          />
        }
      >
        <View className="flex-row gap-2.5">
          <StatCard
            label="This month"
            value={formatMoney(stats.monthSpendMinor, stats.currency)}
            hint={`${stats.monthPurchaseCount} purchases`}
            tone="primary"
          />
          <StatCard
            label="Today"
            value={formatMoney(stats.todaySpendMinor, stats.currency)}
            hint="Recorded today"
          />
        </View>
        <SegmentedControl
          accessibilityLabel="Filter purchases"
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All time", value: "all" },
            { label: "This month", value: "month" },
          ]}
        />
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search purchases"
          accessibilityLabel="Search purchases"
        />
      </ScreenHeader>

      <SectionList
        sections={sections}
        keyExtractor={(purchase) => purchase.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950">
            <Text className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-neutral-400">
              {section.title}
            </Text>
            <Text className="text-xs font-semibold text-stone-700 dark:text-neutral-200">
              {formatMoney(section.totalMinor, section.currency)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <PurchaseRow
            purchase={item}
            onOpen={() => navigation.navigate("ProductProfile", { name: item.itemName })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={ReceiptText}
            title={
              query
                ? "No purchases match your search"
                : filter === "month"
                  ? "Nothing recorded this month"
                  : "No purchases yet"
            }
            message={
              query
                ? "Try a different item, shop or payment method."
                : "Purchases are only created when you record them. Checking a list item never creates one."
            }
            action={
              !query ? (
                <Button
                  label="Record a purchase"
                  icon={Plus}
                  onPress={() => setFormOpen(true)}
                />
              ) : undefined
            }
          />
        }
      />

      <PurchaseForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}
