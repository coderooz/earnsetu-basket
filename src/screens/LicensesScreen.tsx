/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/LicensesScreen.tsx
 * @accessPath @/screens/LicensesScreen
 * @description Open-source licenses placeholder. Generated license list pending.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";

export default function LicensesScreen() {
  return (
    <ScreenContainer scroll>
      <SectionCard title="Open-source Licenses" subtitle="Placeholder">
        <Text className="text-sm text-neutral-600">
          TODO(content): list the licenses of the bundled dependencies here. This
          screen exists so the route and layout are wired; generate the real
          attribution list before release.
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}
