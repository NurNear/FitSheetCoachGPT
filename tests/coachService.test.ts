import { describe, expect, it } from "vitest";
import { confirmCoachCandidate } from "../src/services/coachService.js";
import type { StorageService } from "../src/services/storageService.js";
import type { CoachConfirmRequest, ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../src/types/domain.js";

function createMemoryStorage(): StorageService & { weights: WeightLog[] } {
  const profiles: ProfileMetrics[] = [];
  const foods: FoodLog[] = [];
  const exercises: ExerciseLog[] = [];
  const weights: WeightLog[] = [];

  return {
    weights,
    async saveProfile(profile) {
      profiles.push(profile);
      return profile;
    },
    async saveFood(log) {
      foods.push(log);
      return log;
    },
    async saveExercise(log) {
      exercises.push(log);
      return log;
    },
    async saveWeight(log) {
      weights.push(log);
      return log;
    },
    async getLatestProfile(userId) {
      return profiles.filter((profile) => profile.userId === userId).at(-1);
    },
    async getFoodLogs(userId, date) {
      return foods.filter((food) => food.userId === userId && food.loggedAt.startsWith(date));
    },
    async getExerciseLogs(userId, date) {
      return exercises.filter((exercise) => exercise.userId === userId && exercise.loggedAt.startsWith(date));
    },
    async getLatestWeight(userId) {
      return weights.filter((weight) => weight.userId === userId).at(-1);
    }
  };
}

describe("coachService", () => {
  it("rejects saving when explicit confirmation is missing", async () => {
    const storage = createMemoryStorage();
    const request = {
      userId: "demo",
      confirm: false,
      candidate: {
        type: "weight",
        data: {
          userId: "demo",
          weightKg: 80
        }
      }
    } as unknown as CoachConfirmRequest;

    await expect(confirmCoachCandidate(storage, request)).rejects.toThrow("Explicit confirmation is required");
    expect(storage.weights).toHaveLength(0);
  });

  it("saves a confirmed weight candidate", async () => {
    const storage = createMemoryStorage();
    const response = await confirmCoachCandidate(storage, {
      userId: "demo",
      confirm: true,
      candidate: {
        type: "weight",
        data: {
          userId: "demo",
          weightKg: 80
        }
      }
    });

    expect(response.saved).toMatchObject({
      userId: "demo",
      weightKg: 80
    });
    expect(storage.weights).toHaveLength(1);
    expect(storage.weights[0]?.loggedAt).toEqual(expect.any(String));
  });
});
