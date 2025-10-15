import { db } from "@db/prisma";
import type { Prisma } from "@prisma/client";
import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";

function toNum(n: any) {
  return typeof n?.toNumber === "function" ? n.toNumber() : Number(n);
}
function calcTotals(items: { quantity: number; unitPrice: number }[]) {
  const subtotal = Number(
    items.reduce((s, it) => s + it.quantity * it.unitPrice, 0).toFixed(2)
  );
  const shippingCost = subtotal >= 1000 ? 0 : 50; // simple rule
  const tax = 0;
  const total = Number((subtotal + shippingCost + tax).toFixed(2));
  return { subtotal, shippingCost, tax, total, currency: "EGP" as const };
}

export async function checkout(
  userId: string,
  input: {
    shippingAddressId?: string;
    shippingAddress?: Record<string, any>;
    paymentMethod: "COD" | "CARD";
  }
) {
  // 1) Fast-path active cart from profile
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { activeCartId: true, phone: true },
  });

  const cart = profile?.activeCartId
    ? await db.cart.findUnique({
        where: { id: profile.activeCartId },
        include: { items: true },
      })
    : await db.cart.findFirst({
        where: { userId, isActive: true },
        include: { items: true },
      });

  if (!cart || cart.items.length === 0) {
    throw new AppError(ErrorCodes.VALIDATION, "Cart is empty");
  }

  // 2) Shipping snapshot
  let shippingSnap: Prisma.InputJsonValue | undefined;
  if (input.shippingAddressId) {
    const addr = await db.address.findUnique({
      where: { id: input.shippingAddressId },
      select: {
        id: true,
        label: true,
        recipientName: true,
        phone: true,
        company: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        postalCode: true,
        countryCode: true,
        latitude: true,
        longitude: true,
        profile: { select: { userId: true } },
      },
    });
    if (!addr || addr.profile.userId !== userId) {
      throw new AppError(ErrorCodes.FORBIDDEN, "Invalid shipping address");
    }
    const { profile: _omit, ...snap } = addr as any;
    shippingSnap = snap;
  } else if (input.shippingAddress) {
    shippingSnap = input.shippingAddress as any;
  } else {
    throw new AppError(ErrorCodes.VALIDATION, "Shipping address is required");
  }

  // Optional COD rule: require phone
  if (input.paymentMethod === "COD") {
    const phone = (shippingSnap as any)?.phone ?? profile?.phone;
    if (!phone)
      throw new AppError(ErrorCodes.VALIDATION, "Phone is required for COD");
  }

  // 3) Enrich items with product info + pre-check stock
  const productIds = Array.from(
    new Set(cart.items.map((it) => String(it.productId)))
  );
  const products = await db.product.findMany({
    where: { id: { in: productIds } as any },
    select: { id: true, name: true, slug: true, stock: true },
  });
  const pmap = new Map(products.map((p) => [String(p.id), p]));
  const lines = cart.items.map((it) => {
    const p = pmap.get(String(it.productId));
    if (!p)
      throw new AppError(ErrorCodes.NOT_FOUND, "Product not found", {
        productId: it.productId,
      });
    const available = typeof p.stock === "number" ? p.stock : 0;
    if (available < it.quantity) {
      throw new AppError(ErrorCodes.VALIDATION, "Insufficient stock", {
        productId: it.productId,
        requested: it.quantity,
        available,
      });
    }
    const unit = toNum(it.unitPrice);
    const lineTotal = Number((unit * it.quantity).toFixed(2));
    return {
      productId: String(it.productId),
      productName: p.name,
      productSlug: p.slug ?? null,
      quantity: it.quantity,
      unitPrice: unit,
      lineTotal,
    };
  });
  const totals = calcTotals(
    lines.map((l) => ({ quantity: l.quantity, unitPrice: l.unitPrice }))
  );
  const isCOD = input.paymentMethod === "COD";

  // 4) Atomic transaction: create order, decrement stock, clear + rotate cart
  const orderId = await db.$transaction(async (tx) => {
    // Create order + items
    const order = await tx.order.create({
      data: {
        userId,
        status: isCOD ? "CONFIRMED" : "PENDING",
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        subtotal: totals.subtotal as any,
        shippingCost: totals.shippingCost as any,
        tax: totals.tax as any,
        total: totals.total as any,
        currency: totals.currency,
        shippingAddress: shippingSnap,
        items: {
          createMany: {
            data: lines.map((l) => ({
              productId: l.productId,
              productName: l.productName,
              productSlug: l.productSlug,
              quantity: l.quantity,
              unitPrice: l.unitPrice as any,
              lineTotal: l.lineTotal as any,
            })),
          },
        },
      },
      select: { id: true },
    });

    // Decrement stock safely (no oversell)
    for (const l of lines) {
      const res = await tx.product.updateMany({
        where: { id: l.productId as any, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (res.count !== 1) {
        throw new AppError(ErrorCodes.VALIDATION, "Insufficient stock", {
          productId: l.productId,
        });
      }
    }

    // Clear old cart items
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Rotate cart: deactivate old, create new, set as active in profile
    await tx.cart.update({ where: { id: cart.id }, data: { isActive: false } });
    const newCart = await tx.cart.create({
      data: { userId, isActive: true },
      select: { id: true },
    });
    await tx.profile.upsert({
      where: { userId },
      update: { activeCartId: newCart.id },
      create: { userId, activeCartId: newCart.id },
    });

    return order.id;
  });

  // Return full order
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}

export async function getOrder(userId: string, orderId: string) {
  const row = await db.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!row)
    throw new AppError(ErrorCodes.NOT_FOUND, "Order not found", { orderId });
  return row;
}

export async function listMyOrders(userId: string, page = 1, size = 10) {
  const skip = (page - 1) * size;
  const [rows, total] = await db.$transaction([
    db.order.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: size,
      include: { items: true },
    }),
    db.order.count({ where: { userId } }),
  ]);
  return { rows, total, page, size, hasNext: skip + rows.length < total };
}
