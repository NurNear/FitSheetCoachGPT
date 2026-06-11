import { describe, expect, it } from "vitest";
import { confirmCoachCandidate } from "../src/services/coachService.js";
import type { StorageService } from "../src/services/storageService.js";
import type { CoachConfirmRequest, ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../src/types/domain.js";

function createMemoryStorage(): StorageService & {
  profiles: ProfileMetrics[];
  foods: FoodLog[];
  exercises: ExerciseLog[];
  weights: WeightLog[];
} {
  const profiles: ProfileMetrics[] = [];
  const foods: FoodLog[] = [];
  const exercises: ExerciseLog[] = [];
  const weights: WeightLog[] = [];

  return {
    profiles,
    foods,
    exercises,
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
    },
    async getWeightLogs(userId) {
      return weights.filter((weight) => weight.userId === userId);
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

    await expect(confirmCoachCandidate(storage, request)).rejects.toMatchObject({
      status: 400,
      code: "ValidationError"
    });
    expect(storage.weights).toHaveLength(0);
  });

  it("rejects a candidate whose userId does not match the confirmation", async () => {
    const storage = createMemoryStorage();

    await expect(
      confirmCoachCandidate(storage, {
        userId: "demo",
        confirm: true,
        candidate: {
          type: "weight",
          data: {
            userId: "someone-else",
            weightKg: 80
          }
        }
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "ValidationError"
    });
  });

  it("saves a confirmed profile candidate", async () => {
    const storage = createMemoryStorage();
    const response = await confirmCoachCandidate(storage, {
      userId: "demo",
      confirm: true,
      candidate: {
        type: "profile",
        data: {
          userId: "demo",
          sex: "male",
          age: 35,
          heightCm: 175,
          weightKg: 75,
          activityLevel: "moderate",
          goal: "lose_fat"
        }
      }
    });

    expect(response.saved).toMatchObject({ userId: "demo", weightKg: 75 });
    expect(storage.profiles[0]?.loggedAt).toEqual(expect.any(String));
  });

  it("saves and normalizes a confirmed food candidate", async () => {
    const storage = createMemoryStorage();
    const response = await confirmCoachCandidate(storage, {
      userId: "demo",
      confirm: true,
      candidate: {
        type: "food",
        data: {
          userId: "demo",
          name: "Chicken rice",
          proteinG: 35,
          carbsG: 60,
          fatG: 12
        }
      }
    });

    expect(response.saved).toMatchObject({ userId: "demo", calories: 488 });
    expect(storage.foods).toHaveLength(1);
  });

  it("saves and normalizes a confirmed exercise candidate", async () => {
    const storage = createMemoryStorage();
    const response = await confirmCoachCandidate(storage, {
      userId: "demo",
      confirm: true,
      candidate: {
        type: "exercise",
        data: {
          userId: "demo",
          name: "Walk",
          durationMinutes: 30,
          intensity: "low"
        }
      }
    });

    expect(response.saved).toMatchObject({ userId: "demo", caloriesBurned: 120 });
    expect(storage.exercises).toHaveLength(1);
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

  it("saves body-composition details and normalizes an offset datetime", async () => {
    const storage = createMemoryStorage();
    const response = await confirmCoachCandidate(storage, {
      userId: "demo",
      confirm: true,
      candidate: {
        type: "weight",
        data: {
          userId: "demo",
          weightKg: 76.8,
          bmi: 26.9,
          bodyFatPercent: 25.1,
          fatMassKg: 19.3,
          changeFromPreviousKg: -1.2,
          previousMeasurementDate: "2026-06-10",
          assessment: "App classified the displayed body-composition metrics as obese.",
          loggedAt: "2026-06-11T07:33:47+07:00"
        }
      }
    });

    expect(response.saved).toMatchObject({
      weightKg: 76.8,
      bmi: 26.9,
      bodyFatPercent: 25.1,
      fatMassKg: 19.3,
      changeFromPreviousKg: -1.2,
      previousMeasurementDate: "2026-06-10",
      loggedAt: "2026-06-11T00:33:47.000Z"
    });
  });
});
