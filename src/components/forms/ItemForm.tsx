/** @format */

/**
 * @fileOverview ItemForm
 * @description Modal form to add or edit a list item. Supports a preset name,
 * optional shop, expected price, currency, quantity, unit, and notes. Quantity
 * and price are optional; a name alone is enough. Suggests previously used item
 * names for reuse.
 *
 * @module src/components/forms/ItemForm
 * @author Coderooz
 * @see {@link @/lib/items/services/item.service}
 * @see {@link @/components/common#Sheet}
 */

import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  Button,
  SelectField,
  Sheet,
  TextField,
} from "@/components/common";
import {
  BASKET_UNITS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_UNIT,
} from "@/constants/basket.constants";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { addItemAction } from "@/lib/items/actions/add-item.action";
import { updateItemAction } from "@/lib/items/actions/update-item.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { ListItem } from "@/types/basket.types";
import { formatMoney, fromMinorUnits, parseAmountInput } from "@/utils/money";

interface ItemFormProps {
  visible: boolean;
  onClose: () => void;
  /** Restricts the list picker to this list when provided. */
  listId?: string;
  initial?: ListItem;
  presetName?: string;
}

export function ItemForm({
  visible,
  onClose,
  listId,
  initial,
  presetName,
}: ItemFormProps) {
  const { lists, shops, catalogue, refresh } = useBasket();
  const { showToast } = useToast();

  const activeLists = useMemo(() => lists.filter((list) => !list.archived), [lists]);

  const defaultListId = useMemo(
    () => initial?.listId ?? listId ?? activeLists[0]?.id ?? "",
    [initial?.listId, listId, activeLists],
  );

  const [name, setName] = useState(initial?.name ?? presetName ?? "");
  const [selectedListId, setSelectedListId] = useState(defaultListId);
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [unit, setUnit] = useState(initial?.unit ?? DEFAULT_UNIT);
  const [shopId, setShopId] = useState(initial?.shopId ?? "");
  const [price, setPrice] = useState(
    initial?.expectedPriceMinor == null
      ? ""
      : String(fromMinorUnits(initial.expectedPriceMinor) ?? ""),
  );
  const [currency, setCurrency] = useState(initial?.currency ?? DEFAULT_CURRENCY);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const suggestions = useMemo(
    () => catalogue.slice(0, 12).map((entry) => entry.name),
    [catalogue],
  );

  const listOptions = activeLists.map((list) => ({ label: list.name, value: list.id }));
  const unitOptions = BASKET_UNITS.map((value) => ({ label: value, value }));
  const shopOptions = shops.map((shop) => ({ label: shop.name, value: shop.id }));
  const currencyOptions = CURRENCIES.map((value) => ({ label: value, value }));

  const parsedPrice = parseAmountInput(price);
  const preview =
    parsedPrice === null ? null : formatMoney(parsedPrice * (Number(quantity) || 0), currency);

  const submit = async () => {
    setBusy(true);
    setError(null);

    try {
      if (!selectedListId) {
        setError("Choose a shopping list first.");
        return;
      }
      if (price.trim() && parsedPrice === null) {
        setError("Enter a valid expected price.");
        return;
      }

      const shop = shops.find((entry) => entry.id === shopId);
      const draft = {
        listId: selectedListId,
        name,
        quantity: Number(quantity),
        unit,
        shopId: shopId || undefined,
        shopName: shop?.name,
        expectedPriceMinor: parsedPrice ?? undefined,
        currency,
        notes,
        checked: initial?.checked,
        position: initial?.position,
      };

      if (initial) {
        await updateItemAction(initial.id, draft);
      } else {
        await addItemAction(draft);
      }

      await refresh();
      showToast(initial ? "Item updated." : "Item added to the list.", "success");
      onClose();
    } catch (failure) {
      setError(toUserMessage(failure, "Could not save this item."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title={initial ? "Edit item" : "Add item"}
      subtitle="Quantity and price are optional details — a name is enough."
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
              label={initial ? "Save changes" : "Add item"}
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
          label="Item name"
          required
          value={name}
          onChangeText={setName}
          placeholder="Milk"
          maxLength={100}
          autoFocus={!initial && !presetName}
        />

        {!initial && suggestions.length > 0 && name.trim().length === 0 ? (
          <View className="gap-2">
            <Text className="text-xs font-semibold text-stone-500 dark:text-neutral-400">
              Reuse a saved item
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  accessibilityRole="button"
                  accessibilityLabel={`Use saved item ${suggestion}`}
                  onPress={() => setName(suggestion)}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <Text className="text-xs font-medium text-stone-700 dark:text-neutral-200">
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {listId ? null : (
          <SelectField
            label="Shopping list"
            required
            value={selectedListId}
            options={listOptions}
            onChange={setSelectedListId}
            placeholder={listOptions.length ? "Choose a list" : "Create a list first"}
          />
        )}

        <View className="flex-row gap-3">
          <TextField
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="1"
            containerClassName="flex-1"
          />
          <View className="flex-1">
            <SelectField
              label="Unit"
              value={unit}
              options={unitOptions}
              onChange={setUnit}
            />
          </View>
        </View>

        <SelectField
          label="Shop"
          value={shopId}
          options={shopOptions}
          onChange={setShopId}
          allowClear
          clearLabel="No shop"
          placeholder="Optional"
          hint="Shops are optional and never required to plan."
        />

        <View className="flex-row gap-3">
          <TextField
            label="Expected price"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            containerClassName="flex-[2]"
          />
          <View className="flex-1">
            <SelectField
              label="Currency"
              value={currency}
              options={currencyOptions}
              onChange={setCurrency}
            />
          </View>
        </View>

        {preview ? (
          <Text className="text-xs text-stone-500 dark:text-neutral-400">
            Estimated total for this line: <Text className="font-semibold">{preview}</Text>
          </Text>
        ) : null}

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Brand, size, or preference"
          maxLength={500}
          multiline
        />
      </View>
    </Sheet>
  );
}
