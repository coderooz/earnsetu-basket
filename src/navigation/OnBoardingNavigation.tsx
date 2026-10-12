/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/OnBoardingNavigation.tsx
 * @accessPath @/navigation/OnBoardingNavigation
 * @description Root gate: first launch → Onboarding; otherwise → Auth flow.
 * @created 2025-11-22
 * @lastModified 2026-10-11
 * @version 1.1.0 - Onboarding now uses the dedicated OnboardingScreen.
 */

import { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNaviationContainer from "@/navigation/AuthNavigation";
import OnboardingScreen from "@/screens/OnboardingScreen";
import useUserContext from "@/hooks/UserHook";
import storage from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/types";

const Stack = createStackNavigator<RootStackParamList>();

/**
 * OnBoardingContainer
 * -------------------
 * The container that decides whether to show onboarding or the main application.
 *
 * @returns React.ReactNode
 */
export default function OnBoardingContainer() {
  const { isFirstLaunch, updateLaunch } = useUserContext();

  useEffect(() => {
    const checkStatus = async () => {
      const firstTime = await storage.get<boolean>("hasLaunched");
      updateLaunch(firstTime === null);
    };
    checkStatus();
  }, [updateLaunch]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstLaunch ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="AuthContainer" component={AuthNaviationContainer} />
      )}
    </Stack.Navigator>
  );
}
