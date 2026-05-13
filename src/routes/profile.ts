import { Router } from "express";
import { estimateBmr, estimateCalorieTarget, estimateTdee } from "../services/fitnessService.js";
import { normalizeProfileMetrics } from "../services/logNormalizationService.js";
import { storage } from "../services/storageService.js";
import { ok } from "../utils/http.js";
import { profileMetricsSchema } from "../validators/logValidators.js";

export const profileRouter = Router();

profileRouter.post("/metrics", async (req, res, next) => {
  try {
    const input = profileMetricsSchema.parse(req.body);
    const saved = await storage.saveProfile(normalizeProfileMetrics(input));
    ok(
      res,
      {
        profile: saved,
        bmr: estimateBmr(saved),
        tdee: estimateTdee(saved),
        calorieTarget: estimateCalorieTarget(saved)
      },
      201
    );
  } catch (error) {
    next(error);
  }
});
