import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import * as repo from "@modules/cart/cart.repo";
import { findProductById } from "@modules/product/product.repo";
import type {
  ApiCartDTO,
  ApiCartItemDTO,
  ItemOptions,
} from "@modules/cart/cart.types";

function toNumber(n: any): number {
  if (n && typeof n === "object" && typeof n.toNumber === "function")
    return n.toNumber();
  return Number(n);
}

function toCartDTO(row: any): ApiCartDTO {
  const items: ApiCartItemDTO[] = (row.items ?? []).map((it: any) => {
    const unit = toNumber(it.unitPrice);
    const qty = it.quantity as number;
    return {
      id: it.id,
      productId: String(it.productId),
      options: it.options ?? undefined,
      quantity: qty,
      unitPrice: unit,
      totalPrice: Number((unit * qty).toFixed(2)),
    };
  });
  const subtotal = Number(
    items.reduce((s, it) => s + it.totalPrice, 0).toFixed(2)
  );
  return {
    id: row.id,
    items,
    itemsCount: items.reduce((s, it) => s + it.quantity, 0),
    subtotal,
    createdAt: new Date(
      row.creationDate ?? row.createdAt ?? Date.now()
    ).toISOString(),
    updatedAt: new Date(
      row.lastUpdate ?? row.updatedAt ?? Date.now()
    ).toISOString(),
  };
}

function effectiveUnitPrice(
  price: number,
  discountPercentage?: number | null
): number {
  const d = Math.max(0, Math.min(100, discountPercentage ?? 0));
  return Number((price * (1 - d / 100)).toFixed(2));
}

/** Add (delta > 0) or decrement (delta < 0) a product line — in one atomic call. */
export async function addItem(
  cartId: string,
  productId: string,
  quantityDelta: number,
  options?: ItemOptions
): Promise<ApiCartDTO> {
  if (!Number.isFinite(quantityDelta) || quantityDelta === 0) {
    throw new AppError(
      ErrorCodes.VALIDATION,
      "quantityDelta must be non-zero integer",
      { quantityDelta }
    );
  }

  const line = await repo.getLineByProductId(cartId, String(productId));

  if (line) {
    const newQty = Math.max(0, (line.quantity ?? 0) + quantityDelta);
    if (newQty === 0) {
      await repo.deleteLine(line.id);
    } else {
      await repo.setLineQty(line.id, newQty);
    }
  } else if (quantityDelta > 0) {
    const product = await findProductById(String(productId));
    if (!product)
      throw new AppError(ErrorCodes.NOT_FOUND, "Product not found", {
        productId,
      });
    const unitPrice = effectiveUnitPrice(
      product.price,
      product.discountPercentage
    );
    await repo.createLine({
      cartId,
      productId: String(productId),
      options: options,
      quantity: quantityDelta,
      unitPrice,
    });
  }

  const fresh = await repo.getActiveCartWithItems(cartId);
  return toCartDTO(fresh!);
}

/** Set exact quantity for an item (0 = delete). */
export async function setItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number
): Promise<ApiCartDTO> {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new AppError(ErrorCodes.VALIDATION, "quantity must be >= 0", {
      quantity,
    });
  }

  if (quantity === 0) {
    await repo.deleteLine(itemId);
  } else {
    await repo.setLineQty(itemId, quantity);
  }
  const fresh = await repo.getActiveCartWithItems(cartId);
  return toCartDTO(fresh!);
}

/** Remove an item by id. */
export async function removeItem(
  cartId: string,
  itemId: string
): Promise<ApiCartDTO> {
  await repo.deleteLine(itemId);
  const fresh = await repo.getActiveCartWithItems(cartId);
  return toCartDTO(fresh!);
}

/** Clear active cart for the given user. */
export async function clear(cartId: string): Promise<ApiCartDTO> {
  await repo.clearCart(cartId);
  const fresh = await repo.getActiveCartWithItems(cartId);
  return toCartDTO(fresh);
}
