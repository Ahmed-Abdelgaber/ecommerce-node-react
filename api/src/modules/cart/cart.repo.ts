import { dbPublic as db } from "@db/prisma";
import { Prisma } from "@prisma/client";
import type { Prisma as PrismaTypes } from "@prisma/client";

type Tx = any;

export async function findActiveCartId(userId: string) {
  const row = await db.profile.findFirst({
    where: { userId, deleteFlag: false },
    select: { activeCartId: true },
  });

  return row ?? null;
}

export async function createEmptyCart(userId: string) {
  const created = await db.cart.create({
    data: { userId },
    select: { id: true },
  });
  return created.id;
}

/** Get active cart with raw items (no mapping). */
export async function getActiveCartWithItems(id: string) {
  return db.cart.findUnique({
    where: { id, deleteFlag: false },
    include: {
      items: {
        where: { deleteFlag: false },
        orderBy: { creationDate: "desc" },
      },
    },
  });
}

/** Get a single cart item line by (cartId, productId, variantId). */
export async function getLineById(id: string) {
  return db.cartItem.findUnique({
    where: {
      id,
      deleteFlag: false,
    },
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      productId: true,
      options: true,
    },
  });
}

export async function getLineByProductId(productId: string, cartId: string) {
  return db.cartItem.findUnique({
    where: {
      cartId_productId: { productId, cartId },
      deleteFlag: false,
    },
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      productId: true,
      options: true,
    },
  });
}

/** Create a cart item line. */
export async function createLine(params: {
  cartId: string;
  productId: string;
  options?: PrismaTypes.InputJsonValue;
  quantity: number;
  unitPrice: number;
}) {
  const { cartId, productId, options, quantity, unitPrice } = params;
  return db.cartItem.create({
    data: {
      cartId,
      productId,
      options: options ?? Prisma.JsonNull,
      quantity,
      unitPrice,
    },
    select: { id: true },
  });
}

/** Set exact quantity for a cart item (0 handled in service). */
export async function setLineQty(itemId: string, quantity: number) {
  await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

/** Delete a cart item by id. */
export async function deleteLine(itemId: string) {
  await db.cartItem.update({
    where: { id: itemId },
    data: { deleteFlag: true },
  });
}

/** Delete all items in the active cart for a user. */
export async function clearCart(cartId: string) {
  await db.cartItem.updateMany({
    where: { cartId },
    data: { deleteFlag: true },
  });
}

/* -----------------------------
  Transaction wrapper (no Prisma types leak)
------------------------------ */

export type CartRepoOps = {
  getActiveCartWithItems(userId: string): Promise<any>;
  getLine(
    cartId: string,
    productId: string,
    variantId?: string | null
  ): Promise<any>;
  createLine(params: {
    cartId: string;
    productId: string;
    variantId?: string | null;
    quantity: number;
    unitPrice: number;
  }): Promise<any>;
  setLineQty(itemId: string, quantity: number): Promise<void>;
  deleteLine(itemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
};
