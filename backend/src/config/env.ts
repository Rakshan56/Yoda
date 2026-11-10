import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  API_V1_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGINS: z.string().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  TRUST_PROXY: z.coerce.boolean().default(false),
  POKEAPI_BASE_URL: z.string().url().default("https://pokeapi.co/api/v2"),
  POKEAPI_TIMEOUT_MS: z.coerce.number().positive().default(20000),
  LOG_LEVEL: z.string().default("info")
});
export const env = schema.parse(process.env);
export const frontendOrigins = env.FRONTEND_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
