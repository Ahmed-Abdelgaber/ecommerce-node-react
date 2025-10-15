import { db } from "@db/prisma";

export async function getOrderByIdForUser(orderId: string, userId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}

export async function listOrdersForUser(userId: string, page = 1, size = 10) {
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
