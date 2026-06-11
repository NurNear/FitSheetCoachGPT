import { describe, expect, it } from "vitest";
import { getDailyFoodLogs } from "../src/services/foodLogService.js";
import type { StorageService } from "../src/services/storageService.js";
import type { FoodLog } from "../src/types/domain.js";

function createStorage(foods: FoodLog[]): StorageService {
  return {
    async saveProfile(profile) {
      return profile;
    },
    async saveFood(log) {
      return log;
    },
    async saveExercise(log) {
      return log;
    },
    async saveWeight(log) {
      return log;
    },
    async getLatestProfile() {
      return undefined;
    },
    async getFoodLogs(userId, date) {
      return foods.filter((food) => food.userId === userId && food.loggedAt.startsWith(date));
    },
    async getExerciseLogs() {
      return [];
    },
    async getLatestWeight() {
      return undefined;
    },
    async getWeightLogs() {
      return [];
    }
  };
}

describe("foodLogService", () => {
  it("returns one day's food logs in chronological order", async () => {
    const storage = createStorage([
      {
        userId: "demo",
        name: "Dinner",
        calories: 600,
        loggedAt: "2026-06-11T12:00:00.000Z"
      },
      {
        userId: "demo",
        name: "Breakfast",
        calories: 450,
        loggedAt: "2026-06-11T01:00:00.000Z"
      },
      {
        userId: "demo",
        name: "Previous day",
        calories: 300,
        loggedAt: "2026-06-10T08:00:00.000Z"
      }
    ]);

    await expect(getDailyFoodLogs(storage, "demo", "2026-06-11")).resolves.toEqual({
      userId: "demo",
      date: "2026-06-11",
      foods: [
        expect.objectContaining({ name: "Breakfast" }),
        expect.objectContaining({ name: "Dinner" })
      ]
    });
  });

  it("returns an empty list when the day has no food logs", async () => {
    await expect(getDailyFoodLogs(createStorage([]), "demo", "2026-06-11")).resolves.toEqual({
      userId: "demo",
      date: "2026-06-11",
      foods: []
    });
  });
});
