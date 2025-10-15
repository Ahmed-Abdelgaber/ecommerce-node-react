import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import { findUserByEmail, createUser } from "@modules/auth/auth.repo";
import { hashPassword, verifyPassword } from "@core/security/crypto";
import { signAccess, signRefresh } from "@core/security/jwt";

export async function register(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await findUserByEmail(input.email);
  if (existing)
    throw new AppError(ErrorCodes.AUTH_CONFLICT, "Email already in use");
  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    passwordHash,
    name: input.name,
  });
  const access = await signAccess({
    sub: user.id,
    role: user.role ?? undefined,
  });
  const refresh = await signRefresh({
    sub: user.id,
    role: user.role ?? undefined,
  });
  return { user: safeUser(user), tokens: { access, refresh } };
}

export async function signin(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);
  if (!user) throw new AppError(ErrorCodes.AUTH_INVALID, "Invalid credentials");
  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) throw new AppError(ErrorCodes.AUTH_INVALID, "Invalid credentials");
  const access = await signAccess({
    sub: user.id,
    role: user.role ?? undefined,
  });
  const refresh = await signRefresh({
    sub: user.id,
    role: user.role ?? undefined,
  });
  return { user: safeUser(user), tokens: { access, refresh } };
}

function safeUser(u: any) {
  const { passwordHash, ...rest } = u;
  return rest;
}
