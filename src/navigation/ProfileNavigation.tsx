/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/navigation/ProfileNavigation.tsx
 * @accessPath @/navigation/ProfileNavigation
 * @description Stack navigator for the Profile tab (Profile → Edit Profile).
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "@/screens/ProfileScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import HeaderComponent from "@/components/Header";
import type { ProfileStackParamList } from "@/navigation/types";

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{ header: (props) => <HeaderComponent {...props} /> }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
    </Stack.Navigator>
  );
}
