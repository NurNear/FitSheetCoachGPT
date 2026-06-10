import { z } from "zod";

const loggedAt = z.string().datetime().optional();
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Invalid calendar date");

export const profileMetricsSchema = z.object({
  userId: z.string().min(1),
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(10).max(120),
  heightCm: z.number().positive().max(260),
  weightKg: z.number().positive().max(500),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose_fat", "maintain", "gain_muscle"]).optional(),
  loggedAt
});

export const foodLogSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.string().optional(),
  calories: z.number().nonnegative().optional(),
  proteinG: z.number().nonnegative().optional(),
  carbsG: z.number().nonnegative().optional(),
  fatG: z.number().nonnegative().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  loggedAt
});

export const exerciseLogSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  durationMinutes: z.number().positive().max(1440),
  caloriesBurned: z.number().nonnegative().optional(),
  intensity: z.enum(["low", "moderate", "high"]).optional(),
  loggedAt
});

export const weightLogSchema = z.object({
  userId: z.string().min(1),
  weightKg: z.number().positive().max(500),
  loggedAt
});

export const summaryQuerySchema = z.object({
  userId: z.string().min(1),
  date: isoDateSchema.optional()
});
