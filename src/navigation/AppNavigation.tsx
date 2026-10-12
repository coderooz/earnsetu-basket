/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/AppNavigation.tsx
 * @accessPath @/navigation/AppNavigation
 * @description Primary bottom-tab navigator for the authenticated app.
 * @created 2025-11-21
 * @lastModified 2026-10-11
 * @version 1.1.0 - Converted to bottom tabs with per-tab stacks.
 */

import type { ComponentProps } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeNavigation from "@/navigation/HomeNavigation";
import PurchaseNavigation from "@/navigation/PurchaseNavigation";
import ProfileNavigation from "@/navigation/ProfileNavigation";
import SettingsNavigation from "@/navigation/SettingsNavigation";
import type { MainTabParamList } from "@/navigation/types";

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<keyof MainTabParamList, IconName> = {
  HomeTab: "home-outline",
  PurchaseTab: "bag-handle-outline",
  ProfileTab: "person-outline",
  SettingsTab: "settings-outline",
};

/**
 * AppNavigationContainer
 * ----------------------
 * The authenticated app shell. Each tab owns a stack so that detail screens
 * (Product Item, legal pages, etc.) push within the relevant section.
 *
 * TODO(design): tab bar styling, active colours, and iconography.
 */
export default function AppNavigationContainer() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigation}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="PurchaseTab"
        component={PurchaseNavigation}
        options={{ title: "Purchases" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigation}
        options={{ title: "Profile" }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigation}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
}
