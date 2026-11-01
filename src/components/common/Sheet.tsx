/** @format */

import { X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "./IconButton";

interface SheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Disable the internal scroll view for short, fixed-height content. */
  scroll?: boolean;
  dismissible?: boolean;
}

export function Sheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
  scroll = true,
  dismissible = true,
}: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          className="flex-1"
          accessibilityRole="button"
          accessibilityLabel="Dismiss sheet"
          onPress={dismissible ? onClose : undefined}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            className="overflow-hidden rounded-t-3xl bg-white dark:bg-neutral-900"
            style={{ maxHeight: height * 0.92 }}
          >
            <View className="flex-row items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-neutral-800">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-stone-900 dark:text-white">
                  {title}
                </Text>
                {subtitle ? (
                  <Text className="mt-0.5 text-xs text-stone-500 dark:text-neutral-400">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <IconButton
                icon={X}
                variant="bare"
                onPress={onClose}
                accessibilityLabel="Close"
              />
            </View>

            {scroll ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
                className="flex-shrink"
              >
                {children}
              </ScrollView>
            ) : (
              <View className="px-5 py-5">{children}</View>
            )}

            {footer ? (
              <View
                className="border-t border-stone-100 px-5 pt-3 dark:border-neutral-800"
                style={{ paddingBottom: Math.max(insets.bottom, 12) }}
              >
                {footer}
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
