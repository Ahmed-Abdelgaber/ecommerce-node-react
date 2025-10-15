// src/modules/cart/cart.schema.ts
import { z } from "zod";

// Add item to cart
export const AddItemBodySchema = z.object({
  productId: z.string().min(1), // keep as string unless your Product.id is Int
  variantId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1),
});

// Update item quantity (0 = remove)
export const UpdateItemBodySchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

// Remove item
export const ItemIdParamSchema = z.object({
  itemId: z.uuid(),
});

// DTOs (response shapes)
export const ApiCartItemDTOSchema = z.object({
  id: z.uuid(),
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

export const ApiCartDTOSchema = z.object({
  id: z.uuid(),
  items: z.array(ApiCartItemDTOSchema),
  itemsCount: z.number().int().nonnegative(),
  subtotal: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
