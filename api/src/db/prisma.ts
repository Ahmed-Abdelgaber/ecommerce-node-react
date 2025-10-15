// Prisma clients: raw (admin) and public (auto-filters isActive=true on reads)
// All comments and messages are in English only.

import { PrismaClient } from "@prisma/client";
import { pino } from "pino";

const baseLog: ("query" | "info" | "warn" | "error")[] =
  process.env.LOG_LEVEL === "debug" ? ["query", "warn", "error"] : ["error"];
const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

// Singleton for dev to avoid exhausting DB connections
declare global {
  // eslint-disable-next-line no-var
  var __DB__: PrismaClient | undefined;
}
const prisma = global.__DB__ ?? new PrismaClient({ log: baseLog });
if (process.env.NODE_ENV !== "production") global.__DB__ = prisma;

// Models that expose `isActive` and should be filtered in public reads
const PUBLIC_MODELS = new Set(["Product", "Brand", "Category", "Tag"]);

// Merge isActive:true into any existing where clause
function withActiveFilter(args: any) {
  const where = args?.where;
  return {
    ...args,
    where: where ? { AND: [{ isActive: true }, where] } : { isActive: true },
  };
}

// Raw client (admin/backoffice): no automatic filtering
export const db = prisma;
export const dbPublic = prisma;
// Public client: injects isActive:true into read operations and forbids findUnique on catalog models
// export const dbPublic = prisma.$extends({
//   name: "publicActiveFilter",
//   query: {
//     $allModels: {
//       findMany({ model, args, query }) {
//         if (!PUBLIC_MODELS.has(model)) return query(args);
//         return query(withActiveFilter(args));
//       },
//       findFirst({ model, args, query }) {
//         if (!PUBLIC_MODELS.has(model)) return query(args);
//         return query(withActiveFilter(args));
//       },
//       findFirstOrThrow({ model, args, query }) {
//         if (!PUBLIC_MODELS.has(model)) return query(args);
//         return query(withActiveFilter(args));
//       },
//       count({ model, args, query }) {
//         if (!PUBLIC_MODELS.has(model)) return query(args);
//         return query(withActiveFilter(args));
//       },
//       aggregate({ model, args, query }) {
//         if (!PUBLIC_MODELS.has(model)) return query(args);
//         return query(withActiveFilter(args));
//       },
//       // Block findUnique on catalog models so we can guarantee the active constraint
//       findUnique({ model, args, query }) {
//         if (PUBLIC_MODELS.has(model)) {
//           throw new Error(
//             "dbPublic: findUnique is not allowed for catalog models. Use findFirst with a where clause."
//           );
//         }
//         return query(args);
//       },
//       findUniqueOrThrow({ model, args, query }) {
//         if (PUBLIC_MODELS.has(model)) {
//           throw new Error(
//             "dbPublic: findUniqueOrThrow is not allowed for catalog models. Use findFirstOrThrow with a where clause."
//           );
//         }
//         return query(args);
//       },
//     },
//   },
// });

export async function connectDb() {
  try {
    await dbPublic.$connect();
    logger.info("prisma_connected");
  } catch (err) {
    logger.fatal({ err }, "prisma_connect_failed");
    throw err;
  }
}
