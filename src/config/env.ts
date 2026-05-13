import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().optional(),
  STORAGE_DRIVER: z.enum(["json", "memory"]).default("json"),
  DATA_FILE_PATH: z.string().default("./data/fitsheet.json")
});

export const env = envSchema.parse(process.env);
