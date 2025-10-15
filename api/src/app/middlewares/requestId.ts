import type { RequestHandler } from "express";
import { randomUUID } from "crypto";

export const requestId: RequestHandler = (req, res, next) => {
  const id = req.headers["x-request-id"]?.toString() || randomUUID();
  res.setHeader("x-request-id", id);
  (res.locals as any).requestId = id;
  next();
};
