/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/PurchaseDetailScreen.tsx
 * @accessPath @/screens/PurchaseDetailScreen
 * @description Detail view for a single purchase. Data not wired yet.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import type { PurchaseStackParamList } from "@/navigation/types";

export default function PurchaseDetailScreen() {
  const route =
    useRoute<RouteProp<PurchaseStackParamList, "PurchaseDetail">>();
  const { purchaseId } = route.params;

  return (
    <ScreenContainer scroll>
      <SectionCard title="Purchase" subtitle={`ID: ${purchaseId}`}>
        <Text className="text-sm text-neutral-500">
          TODO(data): line items, quantities, unit prices, total, group, payment
          type, and purchase date.
        </Text>
      </SectionCard>

      <SectionCard title="Notes">
        <Text className="text-sm text-neutral-500">
          TODO(data): any notes captured with this purchase.
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}
