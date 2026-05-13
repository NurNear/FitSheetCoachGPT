import type { ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../types/domain.js";
import { toIsoString } from "../utils/date.js";
import { estimateExerciseCalories, estimateFoodCalories } from "./fitnessService.js";

export function normalizeProfileMetrics(input: Omit<ProfileMetrics, "loggedAt"> & { loggedAt?: string }): ProfileMetrics {
  return {
    ...input,
    loggedAt: toIsoString(input.loggedAt)
  };
}

export function normalizeFoodLog(input: Omit<FoodLog, "loggedAt"> & { loggedAt?: string }): FoodLog {
  const log = {
    ...input,
    loggedAt: toIsoString(input.loggedAt)
  };

  return {
    ...log,
    calories: estimateFoodCalories(log)
  };
}

export function normalizeExerciseLog(input: Omit<ExerciseLog, "loggedAt"> & { loggedAt?: string }): ExerciseLog {
  const log = {
    ...input,
    loggedAt: toIsoString(input.loggedAt)
  };

  return {
    ...log,
    caloriesBurned: estimateExerciseCalories(log)
  };
}

export function normalizeWeightLog(input: Omit<WeightLog, "loggedAt"> & { loggedAt?: string }): WeightLog {
  return {
    ...input,
    loggedAt: toIsoString(input.loggedAt)
  };
}
