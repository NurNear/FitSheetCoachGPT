import { Router } from "express";
import { ok } from "../utils/http.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  ok(res, {
    status: "healthy",
    service: "fitsheet-coach-gpt"
  });
});
