/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/AppearanceScreen.tsx
 * @accessPath @/screens/AppearanceScreen
 * @description Theme selection skeleton, backed by the user context theme value.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import SettingRow from "@/components/common/SettingRow";
import useUserContext from "@/hooks/UserHook";
import type { themeTypes } from "@/context/UserProvider";

const OPTIONS: { key: themeTypes; label: string; description: string }[] = [
  { key: "light", label: "Light", description: "Always use the light theme" },
  { key: "dark", label: "Dark", description: "Always use the dark theme" },
  { key: "system", label: "System", description: "Follow the device setting" },
];

export default function AppearanceScreen() {
  const { userData, updateTheme } = useUserContext();
  const current = (userData?.theme ?? "system") as themeTypes;

  return (
    <ScreenContainer scroll>
      <SectionCard title="Theme">
        {OPTIONS.map((option) => (
          <SettingRow
            key={option.key}
            label={option.label}
            description={option.description}
            showChevron={false}
            onPress={() => updateTheme(option.key)}
            rightElement={
              <View className="mr-1">
                <Ionicons
                  name={
                    current === option.key
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={current === option.key ? "#7C3AED" : "#9CA3AF"}
                />
              </View>
            }
          />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
