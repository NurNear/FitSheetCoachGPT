import { ACTIVITY_FACTORS } from "../constants/activity.js";
import type { ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../types/domain.js";

export function estimateBmr(profile: ProfileMetrics): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  const sexAdjustment = profile.sex === "male" ? 5 : -161;
  return Math.round(base + sexAdjustment);
}

export function estimateTdee(profile: ProfileMetrics): number {
  return Math.round(estimateBmr(profile) * ACTIVITY_FACTORS[profile.activityLevel]);
}

export function estimateCalorieTarget(profile: ProfileMetrics): number {
  const tdee = estimateTdee(profile);

  if (profile.goal === "lose_fat") return tdee - 400;
  if (profile.goal === "gain_muscle") return tdee + 250;
  return tdee;
}

export function estimateExerciseCalories(log: ExerciseLog): number {
  if (typeof log.caloriesBurned === "number") return Math.round(log.caloriesBurned);

  const rateByIntensity = {
    low: 4,
    moderate: 7,
    high: 10
  };

  const rate = rateByIntensity[log.intensity ?? "moderate"];
  return Math.round(log.durationMinutes * rate);
}

export function buildRecommendation(input: {
  profile?: ProfileMetrics;
  foods: FoodLog[];
  exercises: ExerciseLog[];
  latestWeight?: WeightLog;
}): string {
  const caloriesIn = input.foods.reduce((sum, food) => sum + (food.calories ?? 0), 0);
  const caloriesOut = input.exercises.reduce((sum, exercise) => sum + estimateExerciseCalories(exercise), 0);

  if (!input.profile) {
    return "Log profile metrics to unlock BMR, TDEE, calorie targets, and personalized coaching.";
  }

  const target = estimateCalorieTarget(input.profile);
  const netCalories = caloriesIn - caloriesOut;
  const remaining = target - netCalories;

  if (remaining > 300) {
    return `You are about ${remaining} kcal under target. Prioritize protein and a balanced meal.`;
  }

  if (remaining < -300) {
    return `You are about ${Math.abs(remaining)} kcal over target. Keep the next meal light and add easy movement.`;
  }

  return "You are close to today's calorie target. Keep hydration, protein, and sleep on track.";
}
