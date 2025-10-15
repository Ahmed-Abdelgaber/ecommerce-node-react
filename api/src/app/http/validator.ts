import type { ZodObject } from "zod";
import { ZodError } from "zod";
import type { RequestHandler } from "express";
import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";

export function validate(
  schema: ZodObject<any>,
  source: "body" | "query" | "params" = "body"
): RequestHandler {
  return (req, _res, next) => {
    try {
      const data = (req as any)[source];
      schema.parse(data);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError(ErrorCodes.VALIDATION, "Validation failed", {
            issues: err.issues,
          })
        );
      }
      next(err);
    }
  };
}

export default validate;
