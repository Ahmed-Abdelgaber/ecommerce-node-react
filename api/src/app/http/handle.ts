// src/core/http/adl.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => any;

export default function handle(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      const logger = (req as any).log; // pino-http attaches req.log
      if (logger && typeof logger.error === "function") {
        logger.error(
          {
            err,
            url: req.originalUrl,
            method: req.method,
            params: req.params,
            query: req.query,
          },
          err?.message || "Unhandled controller error"
        );
      }
      next(err);
    });
  };
}
