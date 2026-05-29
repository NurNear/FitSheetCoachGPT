import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  STORAGE_DRIVER: z.enum(["upstash", "memory"]).default("upstash"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().default("fitsheet")
});

export const env = envSchema.parse(process.env);
