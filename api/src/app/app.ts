import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pino from "pino";
import api from "@app/routes";

const app = express();

// 1) Trust proxy (needed when behind Nginx/ELB for real client IP & secure cookies)
app.set("trust proxy", 1);

// 2) Request logging (production-friendly JSON)
const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        ip: req.ip,
      },
      "request"
    );
  });
  next();
});

// 3) Security & parsing
app.use(helmet());

// Strict CORS: support single or comma-separated origins via env
const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOrigin: boolean | string[] = allowedOrigins?.length
  ? allowedOrigins
  : true; // dev fallback only
app.use(
  cors({ origin: corsOrigin, credentials: true, optionsSuccessStatus: 204 })
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4) Basic rate limit for API routes (std headers ON)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  "/api/v1/auth/signin",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(
  "/api/v1/auth/refresh",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 5) Health checks
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// 6) Routes
app.use("/api/v1", api);

// 7) 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: { message: "Not Found", status: 404, path: req.originalUrl },
  });
});

// 8) Central error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Log the full error once
    try {
      logger.error({ err }, "unhandled_error");
    } catch {}

    const status = err.status ?? 500;
    const expose = status < 500 || process.env.NODE_ENV !== "production";
    const message = expose ? (err.message ?? "Error") : "Internal Server Error";

    res.status(status).json({ error: { message, status } });
  }
);

export default app;
