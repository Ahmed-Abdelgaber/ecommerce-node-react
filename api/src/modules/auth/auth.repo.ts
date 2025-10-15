import { dbPublic as db } from "@db/prisma";

export async function findUserByEmail(email: string) {
  return await db.user.findFirst({ where: { email } });
}
export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role?: string;
}) {
  return await db.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      role: (data.role as any) ?? undefined,
    },
  });
}
