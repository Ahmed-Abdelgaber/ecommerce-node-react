import type { Response } from "express";

export function ok<T>(res: Response, data: T) {
  return res.status(200).json({ data });
}
export function created<T>(res: Response, data: T) {
  return res.status(201).json({ data });
}

export function unauthorized(res: Response, message = "Unauthorized") {
  return res.status(401).json({ error: { message } });
}

export function badRequest(res: Response, message = "Bad Request") {
  return res.status(400).json({ error: { message } });
}

export function notFound(res: Response, message = "Not Found") {
  return res.status(404).json({ error: { message } });
}

export function conflict(res: Response, message = "Conflict") {
  return res.status(409).json({ error: { message } });
}

export function internalError(
  res: Response,
  message = "Internal Server Error"
) {
  return res.status(500).json({ error: { message } });
}

export function forbidden(res: Response, message = "Forbidden") {
  return res.status(403).json({ error: { message } });
}

export function noContent(res: Response) {
  return res.status(204).send();
}
