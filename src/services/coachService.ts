import type { CoachConfirmRequest, CoachConfirmResponse } from "../types/domain.js";
import { HttpError } from "../utils/httpError.js";
import { normalizeExerciseLog, normalizeFoodLog, normalizeProfileMetrics, normalizeWeightLog } from "./logNormalizationService.js";
import type { StorageService } from "./storageService.js";

export async function confirmCoachCandidate(
  storage: StorageService,
  input: CoachConfirmRequest
): Promise<CoachConfirmResponse> {
  if (input.confirm !== true) {
    throw new HttpError(400, "ValidationError", "Explicit confirmation is required before saving a coach candidate.");
  }

  if (input.candidate.data.userId !== input.userId) {
    throw new HttpError(400, "ValidationError", "Candidate userId must match the confirmation userId.");
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
