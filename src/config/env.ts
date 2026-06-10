import "dotenv/config";
import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: optionalSecret,
  OWNER_USER_ID: optionalSecret,
  STORAGE_DRIVER: z.enum(["upstash", "memory"]).default("upstash"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().default("fitsheet")
}).superRefine((value, context) => {
  if (value.NODE_ENV !== "production") return;

  if (!value.API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["API_KEY"],
      message: "API_KEY is required in production"
    });
  }

  if (!value.OWNER_USER_ID) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OWNER_USER_ID"],
      message: "OWNER_USER_ID is required in production"
    });
  }
});

export const env = envSchema.parse(process.env);
