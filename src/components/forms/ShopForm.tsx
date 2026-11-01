/** @format */

/**
 * @fileOverview ShopForm
 * @description Modal form to create or edit a shop directory entry: name,
 * category, phone, address, items sold (manual catalogue), notes, and favourite
 * flag. Adding a shop never records a purchase.
 *
 * @module src/components/forms/ShopForm
 * @author Coderooz
 * @see {@link @/lib/shops/services/shop.service}
 * @see {@link @/components/common#Sheet}
 */

import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import {
  Button,
  SelectField,
  Sheet,
  TextField,
} from "@/components/common";
import { DEFAULT_SHOP_CATEGORY, SHOP_CATEGORIES } from "@/constants/basket.constants";
import { useBasket } from "@/context/BasketProvider";
import { useToast } from "@/context/ToastProvider";
import { addShopAction } from "@/lib/shops/actions/add-shop.action";
import { updateShopAction } from "@/lib/shops/actions/update-shop.action";
import { toUserMessage } from "@/lib/common/helpers/validation";
import type { Shop } from "@/types/basket.types";
import { splitCommaList } from "@/utils/text";

interface ShopFormProps {
  visible: boolean;
  onClose: () => void;
  initial?: Shop;
  onSaved?: (shop: Shop) => void;
}

export function ShopForm({ visible, onClose, initial, onSaved }: ShopFormProps) {
  const { refresh } = useBasket();
  const { showToast } = useToast();

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? DEFAULT_SHOP_CATEGORY);
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [soldItems, setSoldItems] = useState((initial?.soldItems ?? []).join(", "));
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);

    try {
      const draft = {
        name,
        category,
        phone,
        address,
        notes,
        favorite,
        soldItems: splitCommaList(soldItems),
      };

      const saved = initial
        ? await updateShopAction(initial.id, draft)
        : await addShopAction(draft);

      await refresh();
      showToast(initial ? "Shop updated." : "Shop added.", "success");
      onSaved?.(saved);
      onClose();
    } catch (failure) {
      setError(toUserMessage(failure, "Could not save this shop."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title={initial ? "Edit shop" : "New shop"}
      subtitle="A personal directory entry. Adding a shop never records a purchase."
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
              label={initial ? "Save changes" : "Add shop"}
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
          label="Shop name"
          required
          value={name}
          onChangeText={setName}
          placeholder="Corner grocery"
          maxLength={100}
          autoFocus={!initial}
        />
        <SelectField
          label="Category"
          value={category}
          options={SHOP_CATEGORIES.map((value) => ({ label: value, value }))}
          onChange={setCategory}
        />
        <TextField
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Optional"
          keyboardType="phone-pad"
          maxLength={30}
        />
        <TextField
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Optional"
          maxLength={200}
        />
        <TextField
          label="Items sold here"
          value={soldItems}
          onChangeText={setSoldItems}
          placeholder="Rice, dal, oil"
          hint="Separate names with commas. This is your own note, not purchase history."
        />
        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opening hours, delivery, etc."
          maxLength={500}
          multiline
        />

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: favorite }}
          accessibilityLabel="Mark as favourite shop"
          onPress={() => setFavorite((current) => !current)}
          className="flex-row items-center gap-3 rounded-xl border border-stone-200 p-3 dark:border-neutral-700"
        >
          <View
            className={
              favorite
                ? "h-5 w-5 items-center justify-center rounded-md border-2 border-green-700 bg-green-700"
                : "h-5 w-5 items-center justify-center rounded-md border-2 border-stone-300 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            }
          >
            {favorite ? <Check size={12} color="#ffffff" strokeWidth={3} /> : null}
          </View>
          <Text className="flex-1 text-sm text-stone-700 dark:text-neutral-200">
            Favourite shop
          </Text>
        </Pressable>
      </View>
    </Sheet>
  );
}
