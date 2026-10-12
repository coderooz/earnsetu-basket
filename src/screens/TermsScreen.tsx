/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/TermsScreen.tsx
 * @accessPath @/screens/TermsScreen
 * @description Terms of Service placeholder. No legal copy authored — to be supplied.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";

export default function TermsScreen() {
  return (
    <ScreenContainer scroll>
      <SectionCard title="Terms of Service" subtitle="Placeholder">
        <Text className="text-sm text-neutral-600">
          TODO(legal): the Terms of Service copy has not been authored yet. This
          screen exists so the route and layout are wired. Replace this
          placeholder with the approved, reviewed legal text before release.
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}
