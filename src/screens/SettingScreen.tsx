/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/SettingScreen.tsx
 * @accessPath @/screens/SettingScreen
 * @description Settings hub. Rows navigate to account, appearance, legal, and support screens.
 * @created 2025-11-21
 * @lastModified 2026-10-11
 * @version 1.1.0 - Structured settings hub with navigation to sub-screens.
 */

import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import SettingRow from "@/components/common/SettingRow";
import storage from "@/lib/storage";
import type { SettingsNav } from "@/navigation/types";

export default function SettingScreen() {
  const navigation = useNavigation<SettingsNav>();

  const handleClearData = () => {
    Alert.alert(
      "Clear local data",
      "This removes all locally stored data, including the onboarding flag. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            void storage.clear();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll>
      <SectionCard title="Preferences">
        <SettingRow
          label="Account"
          description="Profile, email, and linked sign-in"
          leftIcon={<Ionicons name="person-outline" size={20} color="#6B7280" />}
          onPress={() => navigation.navigate("Account")}
        />
        <SettingRow
          label="Appearance"
          description="Light, dark, or follow the system"
          leftIcon={
            <Ionicons name="color-palette-outline" size={20} color="#6B7280" />
          }
          onPress={() => navigation.navigate("Appearance")}
        />
        <SettingRow
          label="Notifications"
          description="Reminders and purchase alerts"
          leftIcon={
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
          }
          onPress={() => navigation.navigate("NotificationSettings")}
        />
      </SectionCard>

      <SectionCard title="Support">
        <SettingRow
          label="Help & Support"
          leftIcon={
            <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
          }
          onPress={() => navigation.navigate("Help")}
        />
        <SettingRow
          label="About EarnSetu Basket"
          leftIcon={
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          }
          onPress={() => navigation.navigate("About")}
        />
      </SectionCard>

      <SectionCard title="Legal">
        <SettingRow
          label="Terms of Service"
          leftIcon={<Ionicons name="document-text-outline" size={20} color="#6B7280" />}
          onPress={() => navigation.navigate("Terms")}
        />
        <SettingRow
          label="Privacy Policy"
          leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />}
          onPress={() => navigation.navigate("Privacy")}
        />
        <SettingRow
          label="Open-source Licenses"
          leftIcon={<Ionicons name="code-slash-outline" size={20} color="#6B7280" />}
          onPress={() => navigation.navigate("Licenses")}
        />
      </SectionCard>

      <SectionCard title="Developer">
        <SettingRow
          label="Clear local data"
          description="Debug: wipes AsyncStorage and re-enables onboarding"
          showChevron={false}
          onPress={handleClearData}
        />
      </SectionCard>
    </ScreenContainer>
  );
}
