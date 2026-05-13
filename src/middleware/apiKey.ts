import type { RequestHandler } from "express";
import { env } from "../config/env.js";

export const apiKeyAuth: RequestHandler = (req, res, next) => {
  if (!env.API_KEY) return next();

  const headerValue = req.header("x-api-key");
  if (headerValue !== env.API_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  return next();
};
