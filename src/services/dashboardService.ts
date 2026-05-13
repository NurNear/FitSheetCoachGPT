import type { DashboardSummary } from "../types/domain.js";
import {
  buildRecommendation,
  estimateBmr,
  estimateCalorieTarget,
  estimateExerciseCalories,
  estimateTdee
} from "./fitnessService.js";
import type { StorageService } from "./storageService.js";

export async function getDashboardSummary(
  storage: StorageService,
  userId: string,
  date: string
): Promise<DashboardSummary> {
  const [profile, foods, exercises, latestWeight] = await Promise.all([
    storage.getLatestProfile(userId),
    storage.getFoodLogs(userId, date),
    storage.getExerciseLogs(userId, date),
    storage.getLatestWeight(userId)
  ]);

  const totals = {
    caloriesIn: foods.reduce((sum, food) => sum + (food.calories ?? 0), 0),
    caloriesOut: exercises.reduce((sum, exercise) => sum + estimateExerciseCalories(exercise), 0),
    proteinG: foods.reduce((sum, food) => sum + (food.proteinG ?? 0), 0),
    carbsG: foods.reduce((sum, food) => sum + (food.carbsG ?? 0), 0),
    fatG: foods.reduce((sum, food) => sum + (food.fatG ?? 0), 0)
  };

  return {
    userId,
    date,
    totals,
    latestWeightKg: latestWeight?.weightKg,
    bmr: profile ? estimateBmr(profile) : undefined,
    tdee: profile ? estimateTdee(profile) : undefined,
    calorieTarget: profile ? estimateCalorieTarget(profile) : undefined,
    recommendation: buildRecommendation({ profile, foods, exercises, latestWeight })
  };
}
