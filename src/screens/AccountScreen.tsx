/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/AccountScreen.tsx
 * @accessPath @/screens/AccountScreen
 * @description Account settings skeleton. Account mutations require backend work.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import SettingRow from "@/components/common/SettingRow";

export default function AccountScreen() {
  return (
    <ScreenContainer scroll>
      <SectionCard title="Sign-in">
        <SettingRow
          label="Email"
          value="TODO(data)"
          leftIcon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
          onPress={() => {
            // TODO(backend): change email.
          }}
        />
        <SettingRow
          label="Phone number"
          value="TODO(data)"
          leftIcon={<Ionicons name="call-outline" size={20} color="#6B7280" />}
          onPress={() => {
            // TODO(backend): add / change phone number.
          }}
        />
        <SettingRow
          label="Password"
          description="Update your account password"
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
          onPress={() => {
            // TODO(backend): change password.
          }}
        />
      </SectionCard>

      <SectionCard title="Danger zone">
        <SettingRow
          label="Delete account"
          description="TODO(backend): permanent — requires confirmation"
          leftIcon={<Ionicons name="trash-outline" size={20} color="#DC2626" />}
          onPress={() => {
            // TODO(backend): request account deletion (destructive).
          }}
        />
      </SectionCard>
    </ScreenContainer>
  );
}
