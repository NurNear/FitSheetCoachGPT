import { Router } from "express";
import { getDashboardSummary } from "../services/dashboardService.js";
import { storage } from "../services/storageService.js";
import { isoDate } from "../utils/date.js";
import { ok } from "../utils/http.js";
import { summaryQuerySchema } from "../validators/logValidators.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (req, res, next) => {
  try {
    const query = summaryQuerySchema.parse(req.query);
    const summary = await getDashboardSummary(storage, query.userId, query.date ?? isoDate());
    ok(res, summary);
  } catch (error) {
    next(error);
  }
});
