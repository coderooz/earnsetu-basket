/** @format */

/**
 * @fileOverview ErrorScreen
 * @description Generic error fallback screen shown when local storage cannot be
 * opened. Displays a message and an optional retry callback.
 *
 * @module src/screens/ErrorScreen
 * @author Coderooz
 * @see {@link App}
 */

import { CircleAlert } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button, Screen } from "@/components/common";

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <Screen includeBottomInset>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
          <CircleAlert size={26} color="#dc2626" />
        </View>
        <Text className="text-center text-lg font-bold text-stone-900 dark:text-white">
          Something went wrong
        </Text>
        <Text className="max-w-sm text-center text-sm leading-5 text-stone-500 dark:text-neutral-400">
          {message ?? "The app could not start. Your data has not been changed."}
        </Text>
        {onRetry ? <Button label="Try again" onPress={onRetry} /> : null}
      </View>
    </Screen>
  );
}
