import cors from "cors";
import express from "express";
import { apiKeyAuth } from "./middleware/apiKey.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { healthRouter } from "./routes/health.js";
import { logsRouter } from "./routes/logs.js";
import { profileRouter } from "./routes/profile.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use(apiKeyAuth);
  app.use("/api/profile", profileRouter);
  app.use("/api/logs", logsRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp();
