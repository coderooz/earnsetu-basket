/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/AboutScreen.tsx
 * @accessPath @/screens/AboutScreen
 * @description About screen showing app identity and version information.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text, View } from "react-native";
import * as Application from "expo-application";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import SettingRow from "@/components/common/SettingRow";

export default function AboutScreen() {
  const version = Application.nativeApplicationVersion ?? "1.0.0";
  const build = Application.nativeBuildVersion ?? "-";

  return (
    <ScreenContainer scroll>
      <View className="items-center py-6">
        <View className="h-20 w-20 items-center justify-center rounded-2xl bg-neutral-200">
          <Ionicons name="basket" size={40} color="#6B7280" />
        </View>
        <Text className="mt-3 text-xl font-bold text-neutral-900">
          EarnSetu Basket
        </Text>
        <Text className="text-sm text-neutral-500">
          Version {version} ({build})
        </Text>
      </View>

      <SectionCard title="About">
        <Text className="text-sm text-neutral-600">
          EarnSetu Basket is a mobile-first shopping-list and purchase-recording
          app, part of the EarnSetu ecosystem.
        </Text>
      </SectionCard>

      <SectionCard title="Links">
        <SettingRow
          label="Website"
          value="coderooz.in"
          onPress={() => {
            // TODO(design): open the website in the browser.
          }}
        />
        <SettingRow
          label="Source code"
          onPress={() => {
            // TODO(design): open the repository in the browser.
          }}
        />
      </SectionCard>
    </ScreenContainer>
  );
}
