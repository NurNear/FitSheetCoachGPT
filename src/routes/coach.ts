import { Router } from "express";
import { getBehaviorInsights } from "../services/behaviorService.js";
import { confirmCoachCandidate } from "../services/coachService.js";
import { storage } from "../services/storageService.js";
import { isoDate } from "../utils/date.js";
import { ok } from "../utils/http.js";
import { behaviorQuerySchema, coachConfirmSchema } from "../validators/coachValidators.js";

export const coachRouter = Router();

coachRouter.post("/confirm", async (req, res, next) => {
  try {
    const input = coachConfirmSchema.parse(req.body);
    const saved = await confirmCoachCandidate(storage, input);
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});

coachRouter.get("/behavior", async (req, res, next) => {
  try {
    const query = behaviorQuerySchema.parse(req.query);
    const insights = await getBehaviorInsights(storage, query.userId, query.endDate ?? isoDate());
    ok(res, insights);
  } catch (error) {
    next(error);
  }
});
