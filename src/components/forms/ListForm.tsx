/** @format */

/**
 * @fileOverview ListForm
 * @description Modal form to create or edit a shopping list: name, notes, and
 * optional planned-for date. A list is a plan and never records a purchase.
 *
 * @module src/components/forms/ListForm
 * @author Coderooz
 * @see {@link @/lib/lists/services/list.service}
 * @see {@link @/components/common#Sheet}
 */

import { useState } from "react";
import { Text, View } from "react-native";

import { Button, DateField, Sheet, TextAreaField, TextField } from "@/components/common";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { createListAction } from "@/lib/lists/actions/create-list.action";
import { updateListAction } from "@/lib/lists/actions/update-list.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { ShoppingList } from "@/types/basket.types";
import { dateKeyOf, todayDateKey } from "@/utils/date";

interface ListFormProps {
  visible: boolean;
  onClose: () => void;
  initial?: ShoppingList;
  onSaved?: (list: ShoppingList) => void;
}

export function ListForm({ visible, onClose, initial, onSaved }: ListFormProps) {
  const { refresh } = useBasket();
  const { showToast } = useToast();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [plannedFor, setPlannedFor] = useState(
    initial?.plannedFor ? dateKeyOf(initial.plannedFor) : todayDateKey(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const draft = { name, description, plannedFor };
      const saved = initial
        ? await updateListAction(initial.id, draft)
        : await createListAction(draft);

      await refresh();
      showToast(initial ? "List updated." : "List created.", "success");
      onSaved?.(saved);
      onClose();
    } catch (failure) {
      setError(toUserMessage(failure, "Could not save this list."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title={initial ? "Edit list" : "New shopping list"}
      subtitle="A list is a plan. It never records a purchase."
      onClose={onClose}
      footer={
        <View className="gap-2">
          {error ? (
            <Text className="text-xs text-red-600 dark:text-red-400">{error}</Text>
          ) : null}
          <View className="flex-row gap-2">
            <Button
              label="Cancel"
              variant="secondary"
              onPress={onClose}
              className="flex-1"
              disabled={busy}
            />
            <Button
              label={initial ? "Save changes" : "Create list"}
              onPress={submit}
              loading={busy}
              className="flex-1"
            />
          </View>
        </View>
      }
    >
      <View className="gap-4">
        <TextField
          label="List name"
          required
          value={name}
          onChangeText={setName}
          placeholder="Weekly groceries"
          maxLength={100}
          autoFocus={!initial}
          returnKeyType="next"
        />
        <TextAreaField
          label="Notes"
          value={description}
          onChangeText={setDescription}
          placeholder="Anything to remember about this plan"
          maxLength={500}
        />
        <DateField
          label="Planned for"
          value={plannedFor}
          onChange={setPlannedFor}
          hint="Optional — used as the list's date."
        />
      </View>
    </Sheet>
  );
}
