/**
 * @format
 * @coderooz
 * @filePath src/types/purchase.types.ts
 * @description Holds the types params for a purchase related items.
 */

/**
 * PurchaceListItem
 * ----------------
 */
export type PurchaceListItem = {
  id: any;
  title: string;
  productId: string | number;
  purchaceDate: Date;
  groupId: string | number | null;
};
