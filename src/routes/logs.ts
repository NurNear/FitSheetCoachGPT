import { Router } from "express";
import { normalizeExerciseLog, normalizeFoodLog, normalizeWeightLog } from "../services/logNormalizationService.js";
import { storage } from "../services/storageService.js";
import { ok } from "../utils/http.js";
import { exerciseLogSchema, foodLogSchema, weightLogSchema } from "../validators/logValidators.js";

export const logsRouter = Router();

logsRouter.post("/food", async (req, res, next) => {
  try {
    const input = foodLogSchema.parse(req.body);
    const saved = await storage.saveFood(normalizeFoodLog(input));
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});

logsRouter.post("/exercise", async (req, res, next) => {
  try {
    const input = exerciseLogSchema.parse(req.body);
    const saved = await storage.saveExercise(normalizeExerciseLog(input));
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});

logsRouter.post("/weight", async (req, res, next) => {
  try {
    const input = weightLogSchema.parse(req.body);
    const saved = await storage.saveWeight(normalizeWeightLog(input));
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});
