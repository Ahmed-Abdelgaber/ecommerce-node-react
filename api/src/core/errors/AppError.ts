import type { ErrorCode } from "@core/errors/codes";
import { ErrorCodes } from "@core/errors/codes";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly meta?: Record<string, unknown>;
  constructor(
    code: ErrorCode,
    message?: string,
    meta?: Record<string, unknown>
  ) {
    super(message ?? code);
    this.code = code;
    this.status = mapCodeToStatus(code);
    this.meta = meta;
  }
}

function mapCodeToStatus(code: ErrorCode): number {
  switch (code) {
    case ErrorCodes.VALIDATION:
      return 400;
    case ErrorCodes.AUTH_REQUIRED:
      return 401;
    case ErrorCodes.FORBIDDEN:
      return 403;
    case ErrorCodes.NOT_FOUND:
      return 404;
    case ErrorCodes.AUTH_CONFLICT:
      return 409;
    case ErrorCodes.AUTH_INVALID:
      return 401;
    default:
      return 500;
  }
}
