import { describe, expect, it } from "vitest";
import { getBehaviorInsights } from "../src/services/behaviorService.js";
import type { StorageService } from "../src/services/storageService.js";
import type { ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../src/types/domain.js";

interface Seed {
  profile?: ProfileMetrics;
  foods?: FoodLog[];
  exercises?: ExerciseLog[];
  weights?: WeightLog[];
}

function createStorage(seed: Seed = {}): StorageService {
  const profiles = seed.profile ? [seed.profile] : [];
  const foods = seed.foods ?? [];
  const exercises = seed.exercises ?? [];
  const weights = seed.weights ?? [];

  return {
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

const profile: ProfileMetrics = {
  userId: "demo",
  sex: "male",
  age: 35,
  heightCm: 175,
  weightKg: 75,
  activityLevel: "moderate",
  goal: "lose_fat",
  loggedAt: "2026-06-01T00:00:00.000Z"
};

describe("behaviorService", () => {
  it("returns seven-day insufficient-data insights when no records exist", async () => {
    const response = await getBehaviorInsights(createStorage(), "demo", "2026-06-10");

    expect(response.period).toEqual({
      startDate: "2026-06-04",
      endDate: "2026-06-10",
      days: 7
    });
    expect(response.coverage).toEqual({
      anyLoggedDays: 0,
      foodLoggedDays: 0,
      calorieCompleteDays: 0,
      proteinCompleteDays: 0,
      exerciseLoggedDays: 0,
      weightEntries: 0
    });
    expect(response.insights).toHaveLength(5);
    expect(response.insights.every((insight) => insight.status === "insufficient_data")).toBe(true);
  });

  it("does not evaluate calories or protein from partial food logs", async () => {
    const response = await getBehaviorInsights(
      createStorage({
        profile,
        foods: [
          {
            userId: "demo",
            name: "Unknown meal",
            loggedAt: "2026-06-08T12:00:00.000Z"
          }
        ]
      }),
      "demo",
      "2026-06-10"
    );

    expect(response.coverage).toMatchObject({
      foodLoggedDays: 1,
      calorieCompleteDays: 0,
      proteinCompleteDays: 0
    });
    expect(response.insights.find((insight) => insight.type === "calorie_balance")?.status).toBe(
      "insufficient_data"
    );
    expect(response.insights.find((insight) => insight.type === "protein_consistency")?.status).toBe(
      "insufficient_data"
    );
  });

  it("flags an average calorie deviation beyond the coaching range", async () => {
    const response = await getBehaviorInsights(
      createStorage({
        profile,
        foods: [food("2026-06-10", 3000, 100)]
      }),
      "demo",
      "2026-06-10"
    );

    expect(response.insights.find((insight) => insight.type === "calorie_balance")).toMatchObject({
      status: "attention",
      metrics: {
        averageDeviationKcal: 805,
        aboveTargetDays: 1,
        evaluatedDays: 1
      }
    });
  });

  it("calculates calorie, protein, exercise, weight, and logging evidence", async () => {
    const response = await getBehaviorInsights(
      createStorage({
        profile,
        foods: [
          food("2026-06-08", 2500, 100),
          food("2026-06-09", 2400, 95),
          food("2026-06-10", 2450, 90)
        ],
        exercises: [
          exercise("2026-06-08", 30),
          exercise("2026-06-09", 30),
          exercise("2026-06-10", 30)
        ],
        weights: [
          weight("2026-06-04", 75),
          weight("2026-06-10", 74.5)
        ]
      }),
      "demo",
      "2026-06-10"
    );

    expect(response.coverage).toEqual({
      anyLoggedDays: 4,
      foodLoggedDays: 3,
      calorieCompleteDays: 3,
      proteinCompleteDays: 3,
      exerciseLoggedDays: 3,
      weightEntries: 2
    });

    expect(response.insights.find((insight) => insight.type === "protein_consistency")).toMatchObject({
      status: "on_track",
      metrics: {
        targetMetDays: 3,
        evaluatedDays: 3
      }
    });
    expect(response.insights.find((insight) => insight.type === "calorie_balance")).toMatchObject({
      status: "on_track",
      metrics: {
        evaluatedDays: 3
      }
    });
    expect(response.insights.find((insight) => insight.type === "exercise_frequency")).toMatchObject({
      status: "on_track",
      metrics: {
        recordedExerciseDays: 3,
        recordedSessions: 3,
        recordedDurationMinutes: 90
      }
    });
    expect(response.insights.find((insight) => insight.type === "weight_trend")).toMatchObject({
      status: "neutral",
      metrics: {
        deltaKg: -0.5,
        direction: "decreasing"
      }
    });
    expect(response.insights.find((insight) => insight.type === "logging_completeness")).toMatchObject({
      status: "neutral",
      metrics: {
        loggedDays: 4,
        coveragePercent: 57
      }
    });
  });
});

function food(date: string, calories: number, proteinG: number): FoodLog {
  return {
    userId: "demo",
    name: "Recorded meal",
    calories,
    proteinG,
    loggedAt: `${date}T12:00:00.000Z`
  };
}

function exercise(date: string, durationMinutes: number): ExerciseLog {
  return {
    userId: "demo",
    name: "Recorded exercise",
    durationMinutes,
    intensity: "moderate",
    loggedAt: `${date}T18:00:00.000Z`
  };
}

function weight(date: string, weightKg: number): WeightLog {
  return {
    userId: "demo",
    weightKg,
    loggedAt: `${date}T07:00:00.000Z`
  };
}
