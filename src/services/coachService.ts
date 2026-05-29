import type {
  CoachAnalyzeRequest,
  CoachAnalyzeResponse,
  CoachConfirmRequest,
  CoachConfirmResponse
} from "../types/domain.js";
import { normalizeExerciseLog, normalizeFoodLog, normalizeProfileMetrics, normalizeWeightLog } from "./logNormalizationService.js";
import type { StorageService } from "./storageService.js";

export async function analyzeCoachInput(input: CoachAnalyzeRequest): Promise<CoachAnalyzeResponse> {
  const inputKinds = [input.message ? "text" : undefined, input.image ? "image" : undefined].filter(Boolean).join(" and ");

  return {
    coachingMessage: `I received your ${inputKinds} input. OpenAI analysis is not connected yet, so please confirm details through a structured candidate once analysis is available.`,
    candidates: [],
    confidence: "needs_follow_up",
    assumptions: ["Server-side OpenAI analysis is planned but not implemented in this foundation step."],
    needsConfirmation: false
  };
}

export async function confirmCoachCandidate(
  storage: StorageService,
  input: CoachConfirmRequest
): Promise<CoachConfirmResponse> {
  if (input.confirm !== true) {
    throw new Error("Explicit confirmation is required before saving a coach candidate.");
  }

  if (input.candidate.data.userId !== input.userId) {
    throw new Error("Candidate userId must match the confirmation userId.");
  }

  switch (input.candidate.type) {
    case "profile": {
      const saved = await storage.saveProfile(normalizeProfileMetrics(input.candidate.data));
      return {
        coachingMessage: "Profile metrics saved after confirmation.",
        saved
      };
    }
    case "food": {
      const saved = await storage.saveFood(normalizeFoodLog(input.candidate.data));
      return {
        coachingMessage: "Food log saved after confirmation.",
        saved
      };
    }
    case "exercise": {
      const saved = await storage.saveExercise(normalizeExerciseLog(input.candidate.data));
      return {
        coachingMessage: "Exercise log saved after confirmation.",
        saved
      };
    }
    case "weight": {
      const saved = await storage.saveWeight(normalizeWeightLog(input.candidate.data));
      return {
        coachingMessage: "Weight log saved after confirmation.",
        saved
      };
    }
  }
}
