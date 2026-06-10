import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export function assertOwnerUserId(userId: unknown, ownerUserId?: string): void {
  if (!ownerUserId || typeof userId !== "string") return;

  if (userId !== ownerUserId) {
    throw new HttpError(403, "Forbidden", "The requested userId is not allowed.");
  }
}

export function createOwnerUserAuth(ownerUserId?: string): RequestHandler {
  return (req, _res, next) => {
    try {
      const userId = req.body?.userId ?? req.query.userId;
      assertOwnerUserId(userId, ownerUserId);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const ownerUserAuth = createOwnerUserAuth(env.OWNER_USER_ID);
