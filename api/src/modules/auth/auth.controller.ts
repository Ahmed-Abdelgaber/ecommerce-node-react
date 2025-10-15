import type { RequestHandler } from "express";
import { created, ok } from "@app/http/response";
import { register, signin } from "@modules/auth/auth.service";
import { env } from "@core/config/env";
import { verifyRefresh, signAccess } from "@core/security/jwt";

function cookieOptions() {
  const secure = env.NODE_ENV === "production";
  const sameSite = secure ? ("none" as const) : ("lax" as const);
  const domain = env.COOKIE_DOMAIN || undefined;
  return {
    httpOnly: true,
    secure,
    sameSite,
    domain,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export const registerHandler: RequestHandler = async (req, res) => {
  const { user, tokens } = await register(req.body);
  res.header("X-Access-Token", tokens.access);
  res.set("Cache-Control", "no-store");
  res.cookie("refresh_token", tokens.refresh, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return created(res, { user });
};

export const signinHandler: RequestHandler = async (req, res) => {
  const { user, tokens } = await signin(req.body);
  res.header("X-Access-Token", tokens.access);
  res.set("Cache-Control", "no-store");
  res.cookie("refresh_token", tokens.refresh, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return ok(res, { user });
};

export const refreshHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = (req as any).cookies?.["refresh_token"] as string | undefined;
    if (!token)
      return res
        .status(401)
        .json({ error: { message: "Refresh token missing", status: 401 } });

    // verify old refresh
    const payload = await verifyRefresh(token);
    const sub = payload.sub as string;
    const role = (payload as any).role as string | undefined;

    // rotate (issue new access)
    const access = await signAccess({ sub, role });

    res.header("X-Access-Token", access);
    res.set("Cache-Control", "no-store");

    return ok(res, { ok: true });
  } catch (err) {
    return next(err);
  }
};

export const logoutHandler: RequestHandler = async (_req, res) => {
  res.clearCookie("refresh_token", { ...cookieOptions(), maxAge: 0 });
  // res.clearCookie("token", { ...cookieOptions(), maxAge: 0 });
  res.header("X-Access-Token", "");
  return ok(res, { ok: true });
};
