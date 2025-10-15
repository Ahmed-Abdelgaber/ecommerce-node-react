import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@core/config/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);
export type AccessPayload = JWTPayload & { sub: string; role?: string };

export async function signAccess(
  payload: AccessPayload,
  ttl = env.ACCESS_TOKEN_TTL
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setAudience("access")
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export async function signRefresh(
  payload: AccessPayload,
  ttl = env.REFRESH_TOKEN_TTL
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setAudience("refresh")
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export async function verifyAccess<T extends JWTPayload = AccessPayload>(
  token: string
) {
  const { payload } = await jwtVerify<T>(token, secret, { audience: "access" });
  return payload;
}

export async function verifyRefresh<T extends JWTPayload = AccessPayload>(
  token: string
) {
  const { payload } = await jwtVerify<T>(token, secret, {
    audience: "refresh",
  });
  return payload;
}
