/** @format */

/**
 * @fileOverview AppNavigation
 * @description Root navigation for EarnSetu Basket. Combines a bottom tab
 * navigator (Home, Lists, Items, Shops, Purchases) with a stack navigator for
 * detail/profile/modal screens (ListDetail, ProductProfile, ShopProfile,
 * Settings as a modal). Theme-aware colors are derived from `useThemeMode`.
 *
 * Screens:
 *   - Tabs (bottom tab navigator): Home, Lists, Items, Shops, Purchases
 *   - ListDetail: stack screen, param `listId`
 *   - ProductProfile: stack screen, param `name`
 *   - ShopProfile: stack screen, param `shopId`
 *   - Settings: stack screen (modal presentation)
 *
 * @module src/navigation/AppNavigation
 * @author Coderooz
 * @see {@link @/context/ThemeProvider#useThemeMode}
 * @see {@link @/navigation/types#RootStackParamList}
 * @see {@link @/navigation/types#RootTabParamList}
 */

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  LayoutList,
  Package,
  ReceiptText,
  ShoppingBasket,
  Store,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo } from "react";

import { useThemeMode } from "@/context/ThemeProvider";
import HomeScreen from "@/screens/HomeScreen";
import ItemsScreen from "@/screens/ItemsScreen";
import ListDetailScreen from "@/screens/ListDetailScreen";
import ListsScreen from "@/screens/ListsScreen";
import ProductProfileScreen from "@/screens/ProductProfileScreen";
import PurchasesScreen from "@/screens/PurchasesScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ShopProfileScreen from "@/screens/ShopProfileScreen";
import ShopsScreen from "@/screens/ShopsScreen";
import type { RootStackParamList, RootTabParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Maps each bottom tab route to its lucide icon.
 * @const {Record<keyof RootTabParamList, LucideIcon>}
 */
const TAB_ICONS: Record<keyof RootTabParamList, LucideIcon> = {
  Home: ShoppingBasket,
  Lists: LayoutList,
  Items: Package,
  Shops: Store,
  Purchases: ReceiptText,
};

/**
 * @function Tabs
 * @description Bottom tab navigator containing the five primary sections.
 * Theme-aware active/inactive tints and bar colors.
 * @returns {JSX.Element}
 */
function Tabs() {
  const { isDark } = useThemeMode();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#4ade80" : "#15803d",
        tabBarInactiveTintColor: isDark ? "#737373" : "#a8a29e",
        tabBarStyle: {
          backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
          borderTopColor: isDark ? "#262626" : "#e7e5e4",
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => {
          const Icon = TAB_ICONS[route.name];
          return <Icon size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Lists" component={ListsScreen} options={{ title: "Lists" }} />
      <Tab.Screen name="Items" component={ItemsScreen} options={{ title: "Items" }} />
      <Tab.Screen name="Shops" component={ShopsScreen} options={{ title: "Shops" }} />
      <Tab.Screen
        name="Purchases"
        component={PurchasesScreen}
        options={{ title: "Purchases" }}
      />
    </Tab.Navigator>
  );
}

/**
 * @function AppNavigation
 * @description Root stack navigator. Wraps the tab navigator and detail /
 * profile screens in a theme-aware `NavigationContainer`. Settings is
 * presented as a modal.
 * @returns {JSX.Element}
 */
export default function AppNavigation() {
  const { isDark } = useThemeMode();

  const theme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: isDark ? "#4ade80" : "#15803d",
        background: isDark ? "#0a0a0a" : "#fafaf9",
        card: isDark ? "#171717" : "#ffffff",
        text: isDark ? "#fafaf9" : "#1c1917",
        border: isDark ? "#262626" : "#e7e5e4",
        notification: "#dc2626",
      },
    };
  }, [isDark]);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="ListDetail" component={ListDetailScreen} />
        <Stack.Screen name="ProductProfile" component={ProductProfileScreen} />
        <Stack.Screen name="ShopProfile" component={ShopProfileScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
