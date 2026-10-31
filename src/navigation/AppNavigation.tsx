/** @format */

import { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "@/screens/HomeScreen";

const AppStack = createStackNavigator();

export default function OnBoardingContainer() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name='Home' component={HomeScreen} />
    </AppStack.Navigator>
  );
}
