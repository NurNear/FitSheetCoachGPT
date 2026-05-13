import { Router } from "express";
import { storage } from "../services/storageService.js";
import { toIsoString } from "../utils/date.js";
import { ok } from "../utils/http.js";
import { profileMetricsSchema } from "../validators/logValidators.js";

export const profileRouter = Router();

profileRouter.post("/metrics", async (req, res, next) => {
  try {
    const input = profileMetricsSchema.parse(req.body);
    const saved = await storage.saveProfile({
      ...input,
      loggedAt: toIsoString(input.loggedAt)
    });
    ok(res, saved, 201);
  } catch (error) {
    next(error);
  }
});
