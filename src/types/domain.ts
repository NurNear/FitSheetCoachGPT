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

export interface DailyFoodLogs {
  userId: string;
  date: string;
  foods: FoodLog[];
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

export type CoachSummaryScope = "today" | "range" | "all";
export type CoachSummaryAnalysisStatus = "on_track" | "attention" | "neutral" | "insufficient_data";

export interface CoachSummaryAnalysis {
  type: "calorie_balance" | "exercise" | "weight_trend" | "logging_coverage";
  status: CoachSummaryAnalysisStatus;
  summary: string;
  metrics: Record<string, number | string>;
}

export interface CoachSummaryDay {
  date: string;
  foods: FoodLog[];
  exercises: ExerciseLog[];
  weights: WeightLog[];
  totals: {
    caloriesIn: number;
    caloriesOut: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    exerciseMinutes: number;
  };
}

export interface CoachSummaryReport {
  userId: string;
  period: {
    scope: CoachSummaryScope;
    startDate: string;
    endDate: string;
    calendarDays: number;
  };
  coverage: {
    recordedDays: number;
    foodLoggedDays: number;
    calorieCompleteDays: number;
    exerciseLoggedDays: number;
    weightEntries: number;
  };
  totals: CoachSummaryDay["totals"];
  averages: {
    caloriesInPerFoodLoggedDay?: number;
    exerciseMinutesPerExerciseDay?: number;
  };
  weight: {
    firstInPeriod?: WeightLog;
    latestInPeriod?: WeightLog;
    latestKnown?: WeightLog;
    deltaKg?: number;
  };
  days: CoachSummaryDay[];
  analysis: CoachSummaryAnalysis[];
}

export type BehaviorInsightType =
  | "protein_consistency"
  | "calorie_balance"
  | "exercise_frequency"
  | "weight_trend"
  | "logging_completeness";

export type BehaviorInsightStatus = "on_track" | "attention" | "neutral" | "insufficient_data";

export interface BehaviorInsightEvidence {
  date: string;
  value: number | string;
  unit?: string;
  note?: string;
}

export interface BehaviorInsight {
  type: BehaviorInsightType;
  status: BehaviorInsightStatus;
  metrics: Record<string, number | string>;
  evidence: BehaviorInsightEvidence[];
}

export interface BehaviorInsightsResponse {
  userId: string;
  period: {
    startDate: string;
    endDate: string;
    days: 7;
  };
  coverage: {
    anyLoggedDays: number;
    foodLoggedDays: number;
    calorieCompleteDays: number;
    proteinCompleteDays: number;
    exerciseLoggedDays: number;
    weightEntries: number;
  };
  insights: BehaviorInsight[];
}

export type CoachCandidateType = "profile" | "food" | "exercise" | "weight";

export type CoachCandidateData =
  | (Omit<ProfileMetrics, "loggedAt"> & { loggedAt?: string })
  | (Omit<FoodLog, "loggedAt"> & { loggedAt?: string })
  | (Omit<ExerciseLog, "loggedAt"> & { loggedAt?: string })
  | (Omit<WeightLog, "loggedAt"> & { loggedAt?: string });

interface CoachCandidateBase {
  confidence?: number;
  assumptions?: string[];
}

export type CoachLogCandidate =
  | (CoachCandidateBase & {
      type: "profile";
      data: Omit<ProfileMetrics, "loggedAt"> & { loggedAt?: string };
    })
  | (CoachCandidateBase & {
      type: "food";
      data: Omit<FoodLog, "loggedAt"> & { loggedAt?: string };
    })
  | (CoachCandidateBase & {
      type: "exercise";
      data: Omit<ExerciseLog, "loggedAt"> & { loggedAt?: string };
    })
  | (CoachCandidateBase & {
      type: "weight";
      data: Omit<WeightLog, "loggedAt"> & { loggedAt?: string };
    });

export interface CoachConfirmRequest {
  userId: string;
  candidate: CoachLogCandidate;
  edits?: Record<string, unknown>;
  confirm: true;
}

export interface CoachConfirmResponse {
  coachingMessage: string;
  saved: ProfileMetrics | FoodLog | ExerciseLog | WeightLog;
}
