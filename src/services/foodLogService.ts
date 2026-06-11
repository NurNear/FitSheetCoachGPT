import type { DailyFoodLogs } from "../types/domain.js";
import type { StorageService } from "./storageService.js";

export async function getDailyFoodLogs(
  storage: StorageService,
  userId: string,
  date: string
): Promise<DailyFoodLogs> {
  const foods = await storage.getFoodLogs(userId, date);

  return {
    userId,
    date,
    foods: [...foods].sort((left, right) => left.loggedAt.localeCompare(right.loggedAt))
  };
}
