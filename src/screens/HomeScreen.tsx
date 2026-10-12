/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/HomeScreen.tsx
 * @accessPath @/screens/HomeScreen
 * @description Home dashboard. Data is not wired yet — placeholders only.
 * @created 2025-11-21
 * @lastModified 2026-10-11
 * @version 1.1.0 - Structured skeleton with navigation to Purchase / Product Item.
 */

import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/items/Button";
import useUserContext from "@/hooks/UserHook";
import type { HomeNav, MainTabNav } from "@/navigation/types";

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { userData } = useUserContext();

  const displayName =
    userData?.name?.first_name ?? userData?.userName ?? "there";

  return (
    <ScreenContainer scroll>
      <Text className="text-2xl font-bold text-neutral-900">
        Hi, {displayName}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500">
        What are we shopping for today?
      </Text>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1">
          <Button
            fullWidth
            onPress={() =>
              navigation.getParent<MainTabNav>()?.navigate("PurchaseTab")
            }
          >
            Record purchase
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="outline"
            fullWidth
            onPress={() => navigation.navigate("ProductItem")}
          >
            Browse items
          </Button>
        </View>
      </View>

      <View className="mt-6">
        <SectionCard
          title="Active shopping lists"
          subtitle="TODO(data): read from the local store"
        >
          <EmptyState
            title="No lists yet"
            message="Your shopping lists will appear here."
          />
        </SectionCard>

        <SectionCard
          title="Recent purchases"
          subtitle="TODO(data): read from the local store"
        >
          <EmptyState
            title="No purchases yet"
            message="Purchases you record will appear here."
          />
        </SectionCard>
      </View>
    </ScreenContainer>
  );
}
