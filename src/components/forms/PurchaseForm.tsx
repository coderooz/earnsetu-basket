/** @format */

/**
 * @fileOverview PurchaseForm
 * @description Modal form to record a purchase (the only path that creates one).
 * Prefills from a planned list item, product preset, or shop. Captures item
 * name, quantity, unit, unit price, currency, shop, payment method, purchased
 * date (local noon), and notes. Linked to a source item when created from a plan.
 *
 * @module src/components/forms/PurchaseForm
 * @author Coderooz
 * @see {@link @/lib/purchases/services/purchase.service}
 * @see {@link @/components/common#Sheet}
 * @see {@link @/utils/date#atLocalNoon}
 */

import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Check } from "lucide-react-native";

import {
  Button,
  DateField,
  SelectField,
  Sheet,
  TextField,
} from "@/components/common";
import {
  BASKET_UNITS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_UNIT,
  PAYMENT_METHODS,
} from "@/constants/basket.constants";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { recordPurchaseAction } from "@/lib/purchases/actions/record-purchase.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { ListItem } from "@/types/basket.types";
import { atLocalNoon, todayDateKey } from "@/utils/date";
import { formatMoney, fromMinorUnits, parseAmountInput } from "@/utils/money";

interface PurchasePreset {
  name: string;
  unit?: string;
  quantity?: number;
  unitPriceMinor?: number;
  currency?: string;
  shopId?: string;
}

interface PurchaseFormProps {
  visible: boolean;
  onClose: () => void;
  /** Prefill from a planned list item. The item is not checked automatically. */
  sourceItem?: ListItem;
  presetShopId?: string;
  /** Prefill from a derived product profile when there is no list item. */
  preset?: PurchasePreset;
}

export function PurchaseForm({
  visible,
  onClose,
  sourceItem,
  presetShopId,
  preset,
}: PurchaseFormProps) {
  const { shops, items, refresh } = useBasket();
  const { showToast } = useToast();

  const [itemName, setItemName] = useState(sourceItem?.name ?? preset?.name ?? "");
  const [quantity, setQuantity] = useState(
    String(sourceItem?.quantity ?? preset?.quantity ?? 1),
  );
  const [unit, setUnit] = useState(sourceItem?.unit ?? preset?.unit ?? DEFAULT_UNIT);
  const [price, setPrice] = useState(
    sourceItem?.expectedPriceMinor != null
      ? String(fromMinorUnits(sourceItem.expectedPriceMinor) ?? "")
      : preset?.unitPriceMinor != null
        ? String(fromMinorUnits(preset.unitPriceMinor) ?? "")
        : "",
  );
  const [currency, setCurrency] = useState(
    sourceItem?.currency ?? preset?.currency ?? DEFAULT_CURRENCY,
  );
  const [shopId, setShopId] = useState(
    sourceItem?.shopId ?? preset?.shopId ?? presetShopId ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [purchasedOn, setPurchasedOn] = useState(todayDateKey());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const suggestions = useMemo(
    () => items.slice(0, 8).map((item) => item.name),
    [items],
  );

  const unitPriceMinor = parseAmountInput(price);
  const numericQuantity = Number(quantity);
  const totalPreview =
    unitPriceMinor === null || !Number.isFinite(numericQuantity)
      ? null
      : formatMoney(Math.round(unitPriceMinor * numericQuantity), currency);

  const submit = async () => {
    setBusy(true);
    setError(null);

    try {
      if (unitPriceMinor === null) {
        setError("Enter a valid unit price.");
        return;
      }

      const shop = shops.find((entry) => entry.id === shopId);
      await recordPurchaseAction({
        itemName,
        quantity: numericQuantity,
        unit,
        unitPriceMinor,
        currency,
        shopId: shopId || undefined,
        shopName: shop?.name,
        paymentMethod,
        notes,
        purchasedAt: atLocalNoon(purchasedOn),
        sourceItemId: sourceItem?.id,
      });

      await refresh();
      showToast("Purchase recorded.", "success");
      onClose();
    } catch (failure) {
      setError(toUserMessage(failure, "Could not record this purchase."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title="Record a purchase"
      subtitle="Only this form creates purchases. Checking a list item never does."
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
              label="Save purchase"
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
          value={itemName}
          onChangeText={setItemName}
          placeholder="Rice"
          maxLength={100}
          autoFocus={!sourceItem}
        />

        {suggestions.length > 0 && itemName.trim().length === 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                label={suggestion}
                variant="subtle"
                size="sm"
                onPress={() => setItemName(suggestion)}
              />
            ))}
          </View>
        ) : null}

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
              options={BASKET_UNITS.map((value) => ({ label: value, value }))}
              onChange={setUnit}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <TextField
            label="Unit price"
            required
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
              options={CURRENCIES.map((value) => ({ label: value, value }))}
              onChange={setCurrency}
            />
          </View>
        </View>

        {totalPreview ? (
          <View className="rounded-xl bg-green-50 px-3 py-2.5 dark:bg-green-950/40">
            <Text className="text-xs text-green-800 dark:text-green-300">
              Total: <Text className="font-bold">{totalPreview}</Text>
            </Text>
          </View>
        ) : null}

        <SelectField
          label="Shop"
          value={shopId}
          options={shops.map((shop) => ({ label: shop.name, value: shop.id }))}
          onChange={setShopId}
          allowClear
          clearLabel="No shop"
          placeholder="Optional"
        />

        <SelectField
          label="Payment method"
          value={paymentMethod}
          options={PAYMENT_METHODS.map((value) => ({ label: value, value }))}
          onChange={setPaymentMethod}
        />

        <DateField label="Purchased on" value={purchasedOn} onChange={setPurchasedOn} />

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          maxLength={500}
          multiline
        />

        {sourceItem ? (
          <View className="flex-row items-start gap-2 rounded-xl border border-stone-200 p-3 dark:border-neutral-700">
            <Check size={15} color="#15803d" />
            <Text className="flex-1 text-xs text-stone-500 dark:text-neutral-400">
              Linked to “{sourceItem.name}” in your plan. The planned item keeps its own
              checked state.
            </Text>
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}
