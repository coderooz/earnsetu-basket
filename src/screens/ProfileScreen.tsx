/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/ProfileScreen.tsx
 * @accessPath @/screens/ProfileScreen
 * @description Profile overview. Reads cached user context — no backend yet.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import SettingRow from "@/components/common/SettingRow";
import Button from "@/components/items/Button";
import useUserContext from "@/hooks/UserHook";
import type { ProfileNav } from "@/navigation/types";

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { userData } = useUserContext();

  const name = userData?.name?.full_name ?? userData?.userName ?? "Guest";

  return (
    <ScreenContainer scroll>
      <View className="items-center py-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-neutral-200">
          <Ionicons name="person" size={36} color="#6B7280" />
        </View>
        <Text className="mt-3 text-xl font-bold text-neutral-900">{name}</Text>
        <Text className="text-sm text-neutral-500">
          TODO(data): email / phone
        </Text>
      </View>

      <SectionCard title="Account">
        <SettingRow
          label="Edit profile"
          description="Name, email, phone, avatar"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <SettingRow
          label="Groups"
          description="TODO(data): groups you belong to"
          showChevron={false}
        />
      </SectionCard>

      <SectionCard title="Activity">
        <SettingRow
          label="Purchase statistics"
          description="TODO(data): totals, streaks, top items"
          showChevron={false}
        />
      </SectionCard>

      <Button
        variant="destructive"
        fullWidth
        onPress={() => {
          // TODO(auth): clear the session and return to the auth flow.
          // Requires a signOut() API on the user context (not implemented yet).
        }}
      >
        Sign out
      </Button>
    </ScreenContainer>
  );
}
