/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/OnboardingScreen.tsx
 * @accessPath @/screens/OnboardingScreen
 * @description First-launch onboarding tour (paged). Structural skeleton — design later.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import type { ComponentProps } from "react";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/components/common/ScreenContainer";
import Button from "@/components/items/Button";
import useUserContext from "@/hooks/UserHook";
import storage from "@/lib/storage";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface OnboardingPage {
  key: string;
  title: string;
  description: string;
  icon: IconName;
}

const PAGES: OnboardingPage[] = [
  {
    key: "plan",
    title: "Plan your shopping",
    description:
      "Create lists, add items with quantities and notes before you head out.",
    icon: "list-outline",
  },
  {
    key: "record",
    title: "Record what you buy",
    description:
      "Log actual purchases — including partial buys and real prices — in seconds.",
    icon: "receipt-outline",
  },
  {
    key: "review",
    title: "Review your history",
    description:
      "See past purchases grouped by date, store, and item to plan better next time.",
    icon: "time-outline",
  },
];

export default function OnboardingScreen() {
  const { updateLaunch } = useUserContext();
  const [index, setIndex] = useState(0);
  const isLast = index === PAGES.length - 1;
  const page = PAGES[index];

  const finish = async () => {
    await storage.set("hasLaunched", true);
    updateLaunch(false);
  };

  const next = () => {
    if (isLast) {
      void finish();
    } else {
      setIndex((current) => current + 1);
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 justify-between">
        <View className="mt-16 items-center px-2">
          <Ionicons name={page.icon} size={72} color="#7C3AED" />
          <Text className="mt-8 text-2xl font-bold text-neutral-900">
            {page.title}
          </Text>
          <Text className="mt-3 text-center text-base text-neutral-600">
            {page.description}
          </Text>
        </View>

        <View className="mb-8 flex-row items-center justify-center">
          {PAGES.map((item, position) => (
            <View
              key={item.key}
              className={`mx-1 h-2 rounded-full ${
                position === index ? "w-6 bg-purple-600" : "w-2 bg-neutral-300"
              }`}
            />
          ))}
        </View>

        <View className="gap-2">
          <Button fullWidth onPress={next}>
            {isLast ? "Get Started" : "Next"}
          </Button>
          <TouchableOpacity onPress={() => void finish()} className="items-center py-3">
            <Text className="text-neutral-500">Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
