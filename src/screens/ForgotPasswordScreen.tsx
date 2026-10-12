/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/ForgotPasswordScreen.tsx
 * @accessPath @/screens/ForgotPasswordScreen
 * @description Password reset request screen. UI only — backend integration pending.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import Button from "@/components/items/Button";
import type { AuthNav } from "@/navigation/types";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<AuthNav>();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    // TODO(backend): request a reset link for `email` via the EarnSetu auth provider.
    console.log("[ForgotPassword] reset requested for:", email);
  };

  return (
    <ScreenContainer scroll>
      <View className="mt-8">
        <Text className="text-2xl font-bold text-neutral-900">
          Reset your password
        </Text>
        <Text className="mt-2 text-sm text-neutral-500">
          Enter the email or phone number linked to your account and we&apos;ll
          send you a reset link.
        </Text>

        <TextInput
          placeholder="Email or phone number"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          className="mt-6 rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />

        <View className="mt-6">
          <Button fullWidth onPress={handleSubmit}>
            Send reset link
          </Button>
        </View>

        <Button variant="link" fullWidth onPress={() => navigation.goBack()}>
          Back to sign in
        </Button>
      </View>
    </ScreenContainer>
  );
}
