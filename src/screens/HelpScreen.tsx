/**@format
 * @coderooz
 * @author (Ranit Saha) <coderooz.dev@gmail.com>
 * @filePath src/screens/HelpScreen.tsx
 * @accessPath @/screens/HelpScreen
 * @description Help & support skeleton with FAQ placeholders and a contact entry point.
 * @created 2026-10-11
 * @lastModified 2026-10-11
 * @version 1.0.0 - Initial scaffold.
 */

import { Text } from "react-native";
import ScreenContainer from "@/components/common/ScreenContainer";
import SectionCard from "@/components/common/SectionCard";
import Button from "@/components/items/Button";

const FAQS = [
  "How do I record a purchase?",
  "How do I create a shopping list?",
  "How is my data stored?",
  "How do I delete my account?",
];

export default function HelpScreen() {
  return (
    <ScreenContainer scroll>
      <SectionCard title="Frequently asked questions">
        {FAQS.map((question) => (
          <Text
            key={question}
            className="border-b border-neutral-100 py-3 text-base text-neutral-800"
          >
            {question}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Still need help?">
        <Text className="mb-4 text-sm text-neutral-500">
          TODO(backend): open the support channel (email / chat / form).
        </Text>
        <Button
          fullWidth
          onPress={() => {
            // TODO(backend): open support contact (mailto or in-app form).
          }}
        >
          Contact support
        </Button>
      </SectionCard>
    </ScreenContainer>
  );
}
