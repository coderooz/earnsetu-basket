/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/AuthNavigation.tsx
 * @accessPath @/navigation/AuthNavigation
 * @description Stack that gates the app: unauthenticated → Auth flow; authenticated → app shell.
 * @created 2025-11-21
 * @lastModified 2026-10-11
 * @version 1.1.0 - Added Forgot Password route and typed screens.
 */

import { createStackNavigator } from "@react-navigation/stack";
import AppNavigationContainer from "@/navigation/AppNavigation";
import AuthScreen from "@/screens/AuthScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import useUserContext from "@/hooks/UserHook";
import type { AuthStackParamList } from "@/navigation/types";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNaviationContainer() {
  const { isAuthenticated } = useUserContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="AppContainer" component={AppNavigationContainer} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
