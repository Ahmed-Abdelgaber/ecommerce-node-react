import handle from "@app/http/handle";
import { created, ok } from "@app/http/response";
import * as service from "@modules/cart/cart.service";

// POST /api/v1/cart/items { userId, productId, quantity, variantId? }
export const addItemController = handle(async (req, res) => {
  const { cartId } = req.params as { cartId: string };
  const { productId, quantity, options } = req.body as {
    productId: string;
    quantity: number;
    options?: string;
  };
  const cart = await service.addItem(cartId!, productId!, quantity!, options);
  created(res, cart);
});

// PATCH /api/v1/cart/items/:itemId { userId, quantity }
export const updateItemController = handle(async (req, res) => {
  const { cartId } = req.params as { cartId: string };
  const { itemId } = req.params as { itemId: string };
  const { quantity } = req.body as { quantity: number };
  const cart = await service.setItemQuantity(cartId!, itemId!, quantity!);
  ok(res, cart);
});

// DELETE /api/v1/cart/items/:itemId?userId=...
export const removeItemController = handle(async (req, res) => {
  const { cartId } = req.params as { cartId: string };
  const { itemId } = req.params as { itemId: string };
  const cart = await service.removeItem(cartId!, itemId!);
  ok(res, cart);
});

// POST /api/v1/cart/clear { userId }
export const clearCartController = handle(async (req, res) => {
  const { cartId } = req.params as { cartId: string };
  const cart = await service.clear(cartId!);
  ok(res, cart);
});
