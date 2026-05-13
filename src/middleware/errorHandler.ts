import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "ValidationError",
      details: error.flatten()
    });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return res.status(500).json({
    ok: false,
    error: "InternalServerError",
    message
  });
};
