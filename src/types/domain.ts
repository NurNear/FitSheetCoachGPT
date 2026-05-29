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

export type CoachCandidateType = "profile" | "food" | "exercise" | "weight";
export type CoachConfidence = "low" | "medium" | "high" | "needs_follow_up";

export interface CoachImageInput {
  mimeType: string;
  dataUrl?: string;
  url?: string;
  altText?: string;
}

export interface CoachAnalyzeRequest {
  userId: string;
  message?: string;
  image?: CoachImageInput;
  contextDate?: string;
}

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

export interface CoachAnalyzeResponse {
  coachingMessage: string;
  candidates: CoachLogCandidate[];
  confidence: CoachConfidence;
  assumptions: string[];
  needsConfirmation: boolean;
}

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
