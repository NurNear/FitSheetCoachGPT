import { Router } from "express";
import { analyzeCoachInput, confirmCoachCandidate } from "../services/coachService.js";
import { storage } from "../services/storageService.js";
import { ok } from "../utils/http.js";
import { coachAnalyzeSchema, coachConfirmSchema } from "../validators/coachValidators.js";

export const coachRouter = Router();

coachRouter.post("/analyze", async (req, res, next) => {
  try {
    const input = coachAnalyzeSchema.parse(req.body);
    const analysis = await analyzeCoachInput(input);
    ok(res, analysis);
  } catch (error) {
    next(error);
  }
});

coachRouter.post("/confirm", async (req, res, next) => {
  try {
    const input = coachConfirmSchema.parse(req.body);
    const saved = await confirmCoachCandidate(storage, input);
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});
