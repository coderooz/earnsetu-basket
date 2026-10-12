/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/ProductItemScreen.tsx
 * @accessPath @/screens/ProductItemScreen
 * @description Product / item detail skeleton. Data not wired yet.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import Button from "@/components/items/Button";
import type { HomeStackParamList } from "@/navigation/types";

export default function ProductItemScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, "ProductItem">>();
  const itemId = route.params?.itemId;

  return (
    <ScreenContainer scroll>
      <View className="items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 py-12">
        <Ionicons name="cube-outline" size={56} color="#9CA3AF" />
        <Text className="mt-3 text-sm text-neutral-400">
          TODO(design): product image
        </Text>
      </View>

      <View className="mt-4">
        <SectionCard
          title="Product details"
          subtitle={itemId ? `ID: ${itemId}` : "New / unsaved item"}
        >
          <Text className="text-sm text-neutral-500">
            TODO(data): name, category, unit, last known price, and purchase
            history for this item.
          </Text>
        </SectionCard>
      </View>

      <View className="gap-3">
        <Button
          fullWidth
          onPress={() => {
            // TODO(backend): add this item to the active shopping list.
          }}
        >
          Add to list
        </Button>
        <Button
          variant="outline"
          fullWidth
          onPress={() => {
            // TODO(backend): record a purchase for this item.
          }}
        >
          Record purchase
        </Button>
      </View>
    </ScreenContainer>
  );
}
