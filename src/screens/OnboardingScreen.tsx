/** @format */

/**
 * @fileOverview OnboardingScreen
 * @description First-launch onboarding: explains the EarnSetu model (plans vs
 * purchases, explicit buys, offline-first, one product identity) and offers
 * "Start planning" or "Restore a backup". Marks the app as launched on done.
 *
 * @module src/screens/OnboardingScreen
 * @author Coderooz
 * @see {@link @/lib/settings/services/settings.service#markLaunched}
 * @see {@link @/lib/backup/services/backup#importBackup}
 */

import {
  Check,
  CloudOff,
  ReceiptText,
  ShieldCheck,
  ShoppingBasket,
  Upload,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button, Screen } from "@/components/common";
import { importBackup } from "@/lib/backup/services/backup.service";
import { toUserMessage } from "@/lib/common/helpers/validation";
import { settingsService } from "@/lib/settings/services/settings.service";

const FEATURES = [
  {
    icon: ShoppingBasket,
    title: "A list is only a plan",
    body: "Checking an item never changes what you spent.",
  },
  {
    icon: ReceiptText,
    title: "Purchases are explicit",
    body: "Record a buy only when money actually changes hands.",
  },
  {
    icon: CloudOff,
    title: "Works without a connection",
    body: "Every change is saved on this device first.",
  },
  {
    icon: ShieldCheck,
    title: "One product identity",
    body: "“Rice”, “rice” and “RICE” share one history.",
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await settingsService.markLaunched();
      onDone();
    } catch (failure) {
      setError(toUserMessage(failure, "Could not finish setup."));
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await importBackup();
      if (!result) {
        setBusy(false);
        return;
      }
      await settingsService.markLaunched();
      onDone();
    } catch (failure) {
      setError(toUserMessage(failure, "Could not import that backup."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen includeBottomInset>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center gap-6">
          <View className="items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-green-700">
              <ShoppingBasket size={30} color="#ffffff" />
            </View>
            <Text className="text-center text-3xl font-extrabold text-stone-900 dark:text-white">
              EarnSetu Basket
            </Text>
            <Text className="max-w-xs text-center text-sm leading-5 text-stone-500 dark:text-neutral-400">
              Plan what you need. Record what you buy. Keep both separate, and keep it all
              on your device.
            </Text>
          </View>

          <View className="gap-3">
            {FEATURES.map((feature) => (
              <View
                key={feature.title}
                className="flex-row items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/40">
                  <feature.icon size={17} color="#15803d" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-stone-800 dark:text-neutral-100">
                    {feature.title}
                  </Text>
                  <Text className="mt-0.5 text-xs leading-5 text-stone-500 dark:text-neutral-400">
                    {feature.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Check size={14} color="#15803d" />
              <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
                No account needed. Nothing leaves this device unless you configure sync.
              </Text>
            </View>

            {error ? (
              <Text className="text-xs text-red-600 dark:text-red-400">{error}</Text>
            ) : null}

            <Button
              label="Start planning"
              onPress={() => {
                void finish();
              }}
              loading={busy}
              fullWidth
            />
            <Button
              label="Restore a backup"
              icon={Upload}
              variant="secondary"
              onPress={() => {
                void restore();
              }}
              disabled={busy}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
