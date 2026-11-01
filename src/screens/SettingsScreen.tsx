/** @format */

/**
 * @fileOverview SettingsScreen
 * @description Settings screen: appearance (system/light/dark), cloud sync
 * status and sync button, backup export/import, clear local data, and app
 * version/about information.
 *
 * @module src/screens/SettingsScreen
 * @author Coderooz
 * @see {@link @/context/ThemeProvider#useThemeMode}
 * @see {@link @/lib/backup/services/backup.service}
 */

import {
  Cloud,
  CloudOff,
  Database,
  Download,
  Monitor,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash,
  Upload,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  Screen,
  ScreenHeader,
  SegmentedControl,
  TextAction,
} from "@/components/common";
import { APP_VERSION, SYNC_ENABLED } from "@/config/env";
import { useBasket } from "@/context/BasketProvider";
import { useThemeMode } from "@/context/ThemeProvider";
import { useToast } from "@/context/ToastProvider";
import { exportBackup, importBackup } from "@/lib/backup/services/backup.service";
import type { ThemeMode } from "@/constants/basket.constants";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { RootNavigation } from "@/navigation/types";
import { formatDateLabel } from "@/utils/date";

export default function SettingsScreen() {
  const navigation = useNavigation<RootNavigation>();
  const { pending, lastSyncedAt, lastSummary, syncing, syncNow, clearLocalData, refresh } =
    useBasket();
  const { mode, setMode } = useThemeMode();
  const { showToast } = useToast();

  const [busyAction, setBusyAction] = useState<"export" | "import" | null>(null);

  const handleExport = async () => {
    setBusyAction("export");
    try {
      const result = await exportBackup();
      showToast(
        result.shared
          ? "Backup prepared. Choose where to save it."
          : `Backup saved to ${result.uri}`,
        "success",
      );
    } catch (failure) {
      showToast(toUserMessage(failure, "Could not export a backup."), "error");
    } finally {
      setBusyAction(null);
    }
  };

  const handleImport = async () => {
    setBusyAction("import");
    try {
      const result = await importBackup();
      if (!result) {
        showToast("Import cancelled.");
        return;
      }
      await refresh();
      showToast(
        `Imported ${result.imported} record${result.imported === 1 ? "" : "s"}.`,
        "success",
      );
    } catch (failure) {
      showToast(toUserMessage(failure, "Could not import that backup."), "error");
    } finally {
      setBusyAction(null);
    }
  };

  const confirmClear = () => {
    Alert.alert(
      "Clear local data?",
      "Every list, item, shop and purchase on this device will be deleted. Cloud data and exported backups are not touched.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear everything",
          style: "destructive",
          onPress: () => {
            void clearLocalData().catch((failure) =>
              showToast(toUserMessage(failure, "Could not clear local data."), "error"),
            );
          },
        },
      ],
    );
  };

  const statusMessage = lastSummary?.message;

  return (
    <Screen includeBottomInset>
      <ScreenHeader
        title="Settings"
        subtitle="Appearance, sync and your data"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}>
        <Card className="gap-3">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Appearance
          </Text>
          <SegmentedControl<ThemeMode>
            accessibilityLabel="Theme"
            value={mode}
            onChange={(next) => {
              void setMode(next);
            }}
            options={[
              { label: "System", value: "system" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
          />
          <View className="flex-row items-center gap-2">
            {mode === "system" ? (
              <Monitor size={14} color="#a8a29e" />
            ) : mode === "dark" ? (
              <Moon size={14} color="#a8a29e" />
            ) : (
              <Sun size={14} color="#a8a29e" />
            )}
            <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
              “System” follows your device appearance.
            </Text>
          </View>
        </Card>

        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            {SYNC_ENABLED ? (
              <Cloud size={16} color="#15803d" />
            ) : (
              <CloudOff size={16} color="#a8a29e" />
            )}
            <Text className="flex-1 text-sm font-bold text-stone-900 dark:text-white">
              Cloud sync
            </Text>
            <Badge
              label={SYNC_ENABLED ? "Configured" : "Not configured"}
              tone={SYNC_ENABLED ? "success" : "neutral"}
            />
          </View>

          <View className="gap-1">
            <Text className="text-xs text-stone-600 dark:text-neutral-300">
              {pending === 0
                ? "All local changes have been pushed."
                : `${pending} local change${pending === 1 ? "" : "s"} waiting to sync.`}
            </Text>
            <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
              Last successful sync:{" "}
              {lastSyncedAt ? formatDateLabel(lastSyncedAt) : "never"}
            </Text>
          </View>

          {statusMessage ? (
            <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
              {statusMessage}
            </Text>
          ) : null}

          <Text className="text-[11px] leading-4 text-stone-500 dark:text-neutral-400">
            {SYNC_ENABLED
              ? "Cloud endpoints are configured. An account sign-in provider is not connected in this build, so writes stay queued on this device until a session exists."
              : "This build runs fully offline. Set EXPO_PUBLIC_API_BASE_URL at build time to enable the sync client."}
          </Text>

          <Button
            label={syncing ? "Syncing" : "Sync now"}
            icon={RefreshCw}
            variant="secondary"
            onPress={() => {
              void syncNow();
            }}
            loading={syncing}
          />
        </Card>

        <Card className="gap-3">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">
            Your data
          </Text>

          <View className="flex-row items-start gap-2 rounded-xl bg-stone-50 p-3 dark:bg-neutral-800">
            <ShieldCheck size={15} color="#15803d" />
            <Text className="flex-1 text-[11px] leading-4 text-stone-600 dark:text-neutral-300">
              Everything is stored on this device first. A local write and its sync
              operation are committed together, so nothing is lost if the app closes.
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Button
              label="Export backup"
              icon={Download}
              variant="secondary"
              className="flex-1"
              loading={busyAction === "export"}
              disabled={busyAction !== null}
              onPress={() => {
                void handleExport();
              }}
            />
            <Button
              label="Import backup"
              icon={Upload}
              variant="secondary"
              className="flex-1"
              loading={busyAction === "import"}
              disabled={busyAction !== null}
              onPress={() => {
                void handleImport();
              }}
            />
          </View>

          <View className="flex-row items-center gap-2">
            <Database size={14} color="#a8a29e" />
            <Text className="flex-1 text-[11px] text-stone-500 dark:text-neutral-400">
              Backups are JSON files with lists, items, shops and purchases.
            </Text>
          </View>

          <View className="mt-1 flex-row items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-neutral-800">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-stone-800 dark:text-neutral-100">
                Clear local data
              </Text>
              <Text className="text-[11px] text-stone-500 dark:text-neutral-400">
                Deletes local records. Does not touch the cloud.
              </Text>
            </View>
            <TextAction
              label="Clear"
              tone="danger"
              accessibilityLabel="Clear local data"
              onPress={confirmClear}
            />
          </View>
        </Card>

        <Card className="gap-2">
          <Text className="text-sm font-bold text-stone-900 dark:text-white">About</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-stone-600 dark:text-neutral-300">Version</Text>
            <Text className="text-xs font-semibold text-stone-800 dark:text-neutral-100">
              {APP_VERSION}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-stone-600 dark:text-neutral-300">Mode</Text>
            <Text className="text-xs font-semibold text-stone-800 dark:text-neutral-100">
              Offline-first
            </Text>
          </View>
          <Text className="mt-1 text-[11px] leading-4 text-stone-500 dark:text-neutral-400">
            EarnSetu Basket keeps planning and purchasing separate: a list is a plan, and
            only a recorded purchase changes your spending history.
          </Text>
          <Text className="mt-1 text-[11px] text-stone-400 dark:text-neutral-500">
            Made by Coderooz.
          </Text>
        </Card>

        <View className="flex-row items-center justify-center gap-1.5">
          <Trash size={12} color="#d6d3d1" />
          <Text className="text-[10px] text-stone-400 dark:text-neutral-600">
            Deletion is permanent after confirmation.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
