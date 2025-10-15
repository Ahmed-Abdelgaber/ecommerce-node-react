import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  CORS_ORIGIN: z.string().optional(), // comma-separated list
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(true),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Avoid leaking secrets; show concise errors
  const fields = parsed.error.flatten().fieldErrors;
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", fields);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",")
      .map((x) => x.trim())
      .filter(Boolean)
  : undefined;
