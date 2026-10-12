/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/RecordPurchaseScreen.tsx
 * @accessPath @/screens/RecordPurchaseScreen
 * @description Form skeleton for recording a purchase. UI only — persistence pending.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text, TextInput, View } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import Button from "@/components/items/Button";

export default function RecordPurchaseScreen() {
  return (
    <ScreenContainer scroll>
      <SectionCard title="Item" subtitle="What did you buy?">
        <TextInput
          placeholder="Item name"
          className="mb-3 rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        <View className="flex-row gap-3">
          <TextInput
            placeholder="Quantity"
            keyboardType="numeric"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-base"
          />
          <TextInput
            placeholder="Price"
            keyboardType="numeric"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-base"
          />
        </View>
      </SectionCard>

      <SectionCard title="Context">
        <TextInput
          placeholder="Group / store"
          className="mb-3 rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        <TextInput
          placeholder="Payment type (cash / card / UPI)"
          className="rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </SectionCard>

      <Button
        fullWidth
        onPress={() => {
          // TODO(backend): persist the purchase locally, then update the list.
        }}
      >
        Save purchase
      </Button>

      <Text className="mt-3 text-center text-xs text-neutral-400">
        TODO(backend): persist locally first, then sync with EarnSetu.
      </Text>
    </ScreenContainer>
  );
}
