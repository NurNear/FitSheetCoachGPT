import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_KEY: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  FOOD_LOG_SHEET: z.string().default("FoodLog"),
  EXERCISE_LOG_SHEET: z.string().default("ExerciseLog"),
  WEIGHT_LOG_SHEET: z.string().default("WeightLog"),
  PROFILE_SHEET: z.string().default("Profile")
});

export const env = envSchema.parse(process.env);

export const hasGoogleSheetsConfig =
  Boolean(env.GOOGLE_SHEET_ID) &&
  Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL) &&
  Boolean(env.GOOGLE_PRIVATE_KEY);
