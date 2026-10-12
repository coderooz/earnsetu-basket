/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/SettingsNavigation.tsx
 * @accessPath @/navigation/SettingsNavigation
 * @description Stack navigator for the Settings tab, including legal / policy screens.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { createStackNavigator } from "@react-navigation/stack";
import SettingScreen from "@/screens/SettingScreen";
import AccountScreen from "@/screens/AccountScreen";
import AppearanceScreen from "@/screens/AppearanceScreen";
import NotificationSettingsScreen from "@/screens/NotificationSettingsScreen";
import HelpScreen from "@/screens/HelpScreen";
import AboutScreen from "@/screens/AboutScreen";
import TermsScreen from "@/screens/TermsScreen";
import PrivacyScreen from "@/screens/PrivacyScreen";
import LicensesScreen from "@/screens/LicensesScreen";
import HeaderComponent from "@/components/Header";
import type { SettingsStackParamList } from "@/navigation/types";

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{ header: (props) => <HeaderComponent {...props} /> }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: "Account" }} />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ title: "Appearance" }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: "Notifications" }}
      />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: "Help & Support" }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: "About" }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ title: "Terms of Service" }} />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: "Privacy Policy" }}
      />
      <Stack.Screen
        name="Licenses"
        component={LicensesScreen}
        options={{ title: "Open-source Licenses" }}
      />
    </Stack.Navigator>
  );
}
