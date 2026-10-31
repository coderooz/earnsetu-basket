/** @format */

import { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import OnBoardingScreen from "@/screens/OnBoardingSceen";
import HomeScreen from "@/screens/HomeScreen";

const OnBoardingStack = createStackNavigator();

export default function OnBoardingContainer() {
  return (
    <OnBoardingStack.Navigator>
      <OnBoardingStack.Screen name='OnBoarding' component={OnBoardingScreen} />
      <OnBoardingStack.Screen name='Home' component={HomeScreen} />
    </OnBoardingStack.Navigator>
  );
}
