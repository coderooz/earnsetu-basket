/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/EditProfileScreen.tsx
 * @accessPath @/screens/EditProfileScreen
 * @description Edit-profile form skeleton. UI only — persistence pending.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { useState } from "react";
import { TextInput } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import Button from "@/components/items/Button";
import useUserContext from "@/hooks/UserHook";

export default function EditProfileScreen() {
  const { userData } = useUserContext();
  const [firstName, setFirstName] = useState(
    userData?.name?.first_name ?? ""
  );
  const [lastName, setLastName] = useState(userData?.name?.last_name ?? "");
  const [email, setEmail] = useState("");

  return (
    <ScreenContainer scroll>
      <SectionCard title="Personal details">
        <TextInput
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
          className="mb-3 rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        <TextInput
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
          className="mb-3 rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          className="rounded-xl border border-neutral-300 px-4 py-3 text-base"
        />
      </SectionCard>

      <Button
        fullWidth
        onPress={() => {
          // TODO(backend): validate and persist the profile changes.
        }}
      >
        Save changes
      </Button>
    </ScreenContainer>
  );
}
