/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/PurchaseNavigation.tsx
 * @accessPath @/navigation/PurchaseNavigation
 * @description Stack navigator for the Purchase tab (list → detail / record → product item).
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { createStackNavigator } from "@react-navigation/stack";
import PurchaseScreen from "@/screens/PurchaseScreen";
import PurchaseDetailScreen from "@/screens/PurchaseDetailScreen";
import RecordPurchaseScreen from "@/screens/RecordPurchaseScreen";
import ProductItemScreen from "@/screens/ProductItemScreen";
import HeaderComponent from "@/components/Header";
import type { PurchaseStackParamList } from "@/navigation/types";

const Stack = createStackNavigator<PurchaseStackParamList>();

export default function PurchaseNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{ header: (props) => <HeaderComponent {...props} /> }}
    >
      <Stack.Screen
        name="Purchase"
        component={PurchaseScreen}
        options={{ title: "Purchases" }}
      />
      <Stack.Screen
        name="PurchaseDetail"
        component={PurchaseDetailScreen}
        options={{ title: "Purchase" }}
      />
      <Stack.Screen
        name="RecordPurchase"
        component={RecordPurchaseScreen}
        options={{ title: "Record Purchase" }}
      />
      <Stack.Screen
        name="ProductItem"
        component={ProductItemScreen}
        options={{ title: "Product" }}
      />
    </Stack.Navigator>
  );
}
