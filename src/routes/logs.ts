import { Router } from "express";
import { storage } from "../services/storageService.js";
import { toIsoString } from "../utils/date.js";
import { ok } from "../utils/http.js";
import { exerciseLogSchema, foodLogSchema, weightLogSchema } from "../validators/logValidators.js";

export const logsRouter = Router();

logsRouter.post("/food", async (req, res, next) => {
  try {
    const input = foodLogSchema.parse(req.body);
    const saved = await storage.saveFood({
      ...input,
      loggedAt: toIsoString(input.loggedAt)
    });
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});

logsRouter.post("/exercise", async (req, res, next) => {
  try {
    const input = exerciseLogSchema.parse(req.body);
    const saved = await storage.saveExercise({
      ...input,
      loggedAt: toIsoString(input.loggedAt)
    });
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});

logsRouter.post("/weight", async (req, res, next) => {
  try {
    const input = weightLogSchema.parse(req.body);
    const saved = await storage.saveWeight({
      ...input,
      loggedAt: toIsoString(input.loggedAt)
    });
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});
