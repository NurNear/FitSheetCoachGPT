export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface ProfileMetrics {
  userId: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal?: "lose_fat" | "maintain" | "gain_muscle";
  loggedAt: string;
}

export interface FoodLog {
  userId: string;
  name: string;
  quantity?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt: string;
}

export interface ExerciseLog {
  userId: string;
  name: string;
  durationMinutes: number;
  caloriesBurned?: number;
  intensity?: "low" | "moderate" | "high";
  loggedAt: string;
}

export interface WeightLog {
  userId: string;
  weightKg: number;
  loggedAt: string;
}

export interface DashboardSummary {
  userId: string;
  date: string;
  totals: {
    caloriesIn: number;
    caloriesOut: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  latestWeightKg?: number;
  bmr?: number;
  tdee?: number;
  calorieTarget?: number;
  recommendation: string;
}
