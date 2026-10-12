/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/PurchaseScreen.tsx
 * @accessPath @/screens/PurchaseScreen
 * @description Purchase history list with search + filter entry points. Data not wired yet.
 * @created 2025-11-24
 * @lastModified 2026-10-11
 * @version 1.1.0 - Completed structural skeleton (list, search, filter, record entry).
 */

import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/items/Button";
import type { PurchaseNav } from "@/navigation/types";

export default function PurchaseScreen() {
  const navigation = useNavigation<PurchaseNav>();
  const [query, setQuery] = useState("");

  return (
    <ScreenContainer scroll>
      {/* Search + filter */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center rounded-xl border border-neutral-300 px-3 py-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search purchases"
            value={query}
            onChangeText={setQuery}
            className="ml-2 flex-1 text-base"
          />
        </View>
        <TouchableOpacity
          className="rounded-xl border border-neutral-300 p-3"
          onPress={() => {
            // TODO(design): open the filter sheet (date / group / item).
          }}
        >
          <Ionicons name="options-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="mt-4">
        <Button
          fullWidth
          leftIcon={<Ionicons name="add" size={20} color="white" />}
          onPress={() => navigation.navigate("RecordPurchase")}
        >
          Record a purchase
        </Button>
      </View>

      <View className="mt-6">
        <Text className="mb-3 text-lg font-semibold text-neutral-900">Purchase history</Text>
        <EmptyState
          title={query ? `No results for “${query}”` : "No purchases yet"}
          message="Recorded purchases will be grouped here by date, group, and item."
          action={
            <Button variant="outline" onPress={() => navigation.navigate("RecordPurchase")}>
              Record your first purchase
            </Button>
          }
        />
      </View>
    </ScreenContainer>
  );
}
