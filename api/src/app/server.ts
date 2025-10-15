import dotenv from "dotenv";
dotenv.config();

import http from "http";
import pino from "pino";
import app from "@app/app";
import { db, connectDb } from "../db/prisma";

// ---- Config ----
const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
const PORT = Number(process.env.PORT) || 4000;

// Fail fast on uncaught exceptions (registered first)
process.on("uncaughtException", (err) => {
  try {
    logger.fatal({ err }, "uncaught_exception");
  } finally {
    process.exit(1);
  }
});

// Create HTTP server explicitly for fine-grained shutdown
const server = http.createServer(app);

(async () => {
  try {
    await connectDb();
    server.listen(PORT, () => {
      logger.info({ port: PORT, env: process.env.NODE_ENV }, "server_started");
    });
  } catch (err) {
    logger.fatal({ err }, "boot_failed");
    process.exit(1);
  }
})();

// Handle unhandled promise rejections after the server has started
process.on("unhandledRejection", (reason: any) => {
  logger.error({ reason }, "unhandled_rejection");
  shutdown(1);
});

// Graceful shutdown on SIGINT/SIGTERM
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal as NodeJS.Signals, () => {
    logger.warn({ signal }, "signal_received");
    shutdown(0);
  });
});

function shutdown(code: number) {
  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "error_closing_server");
    }
    try {
      await db.$disconnect();
      logger.info("prisma_disconnected");
    } catch (e) {
      logger.error({ e }, "prisma_disconnect_failed");
    } finally {
      process.exit(code);
    }
  });

  // In case server doesn't close in time
  setTimeout(() => {
    logger.error("forced_shutdown_timeout");
    process.exit(code || 1);
  }, 10_000).unref();
}

// Optional: minimal env sanity checks (warn-only)
if (!process.env.JWT_SECRET) {
  logger.warn("JWT_SECRET is not set. Set it in production.");
}
if (!process.env.DATABASE_URL) {
  logger.warn("DATABASE_URL is not set. Prisma will fail to connect.");
}
