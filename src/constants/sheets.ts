export const REQUIRED_SHEET_HEADERS = {
  Profile: ["userId", "sex", "age", "heightCm", "weightKg", "activityLevel", "goal", "loggedAt"],
  FoodLog: ["userId", "name", "quantity", "calories", "proteinG", "carbsG", "fatG", "mealType", "loggedAt"],
  ExerciseLog: ["userId", "name", "durationMinutes", "caloriesBurned", "intensity", "loggedAt"],
  WeightLog: ["userId", "weightKg", "loggedAt"]
} as const;

export type RequiredSheetName = keyof typeof REQUIRED_SHEET_HEADERS;
