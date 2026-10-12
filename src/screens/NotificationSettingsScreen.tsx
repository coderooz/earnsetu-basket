/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/NotificationSettingsScreen.tsx
 * @accessPath @/screens/NotificationSettingsScreen
 * @description Notification preference toggles. Local state only — no backend yet.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { useState } from "react";
import { Switch } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import SettingRow from "@/components/common/SettingRow";

export default function NotificationSettingsScreen() {
  const [push, setPush] = useState(true);
  const [purchaseReminders, setPurchaseReminders] = useState(true);
  const [listReminders, setListReminders] = useState(false);

  return (
    <ScreenContainer scroll>
      <SectionCard
        title="Push notifications"
        subtitle="TODO(backend): persist preferences"
      >
        <SettingRow
          label="Enable push notifications"
          showChevron={false}
          rightElement={<Switch value={push} onValueChange={setPush} />}
        />
        <SettingRow
          label="Purchase reminders"
          description="Remind me to record what I bought"
          showChevron={false}
          rightElement={
            <Switch
              value={purchaseReminders}
              onValueChange={setPurchaseReminders}
              disabled={!push}
            />
          }
        />
        <SettingRow
          label="Shopping list reminders"
          description="Nudge me about items still on my list"
          showChevron={false}
          rightElement={
            <Switch
              value={listReminders}
              onValueChange={setListReminders}
              disabled={!push}
            />
          }
        />
      </SectionCard>
    </ScreenContainer>
  );
}
