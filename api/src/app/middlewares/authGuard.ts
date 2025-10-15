import type { RequestHandler } from "express";
import { verifyAccess } from "@core/security/jwt";
import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";

export const authGuard: RequestHandler = async (req, _res, next) => {
  try {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const cookie = (req as any).cookies?.["access_token"] as string | undefined;
    const token = bearer || cookie;
    if (!token)
      return next(
        new AppError(ErrorCodes.AUTH_REQUIRED, "Authentication required")
      );
    const payload = await verifyAccess(token);
    (req as any).user = { id: payload.sub, role: (payload as any).role };
    next();
  } catch (err) {
    next(new AppError(ErrorCodes.AUTH_INVALID, "Invalid or expired token"));
  }
};
