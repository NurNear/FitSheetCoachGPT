import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "ValidationError",
      details: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      ok: false,
      error: error.code,
      message: error.message
    });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(500).json({
    ok: false,
    error: "InternalServerError",
    message
  });
};
