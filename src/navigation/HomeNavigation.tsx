/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/HomeNavigation.tsx
 * @accessPath @/navigation/HomeNavigation
 * @description Stack navigator for the Home tab (Home → Product Item).
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "@/screens/HomeScreen";
import ProductItemScreen from "@/screens/ProductItemScreen";
import HeaderComponent from "@/components/Header";
import type { HomeStackParamList } from "@/navigation/types";

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{ header: (props) => <HeaderComponent {...props} /> }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Stack.Screen
        name="ProductItem"
        component={ProductItemScreen}
        options={{ title: "Product" }}
      />
    </Stack.Navigator>
  );
}
