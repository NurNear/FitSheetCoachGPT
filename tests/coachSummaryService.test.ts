import { describe, expect, it } from "vitest";
import { getCoachSummary } from "../src/services/coachSummaryService.js";
import type { StorageService } from "../src/services/storageService.js";
import type { ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../src/types/domain.js";

interface Seed {
  profile?: ProfileMetrics;
  foods?: FoodLog[];
  exercises?: ExerciseLog[];
  weights?: WeightLog[];
}

function createStorage(seed: Seed = {}): StorageService {
  const foods = seed.foods ?? [];
  const exercises = seed.exercises ?? [];
  const weights = seed.weights ?? [];

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
    async getLatestProfile(userId) {
      return seed.profile?.userId === userId ? seed.profile : undefined;
    },
    async getFoodLogs(userId, date) {
      return foods.filter((food) => food.userId === userId && food.loggedAt.startsWith(date));
    },
    async getExerciseLogs(userId, date) {
      return exercises.filter(
        (exercise) => exercise.userId === userId && exercise.loggedAt.startsWith(date)
      );
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
  goal: "maintain",
  loggedAt: "2026-06-01T00:00:00.000Z"
};

describe("coachSummaryService", () => {
  it("returns today's food details, exercise details, totals, and analysis", async () => {
    const response = await getCoachSummary(
      createStorage({
        profile,
        foods: [
          {
            userId: "demo",
            name: "Chicken rice",
            quantity: "1 plate",
            calories: 650,
            loggedAt: "2026-06-11T05:00:00.000Z"
          }
        ],
        exercises: [
          {
            userId: "demo",
            name: "Walk",
            durationMinutes: 30,
            caloriesBurned: 120,
            loggedAt: "2026-06-11T11:00:00.000Z"
          }
        ],
        weights: [
          {
            userId: "demo",
            weightKg: 74.8,
            loggedAt: "2026-06-11T01:00:00.000Z"
          }
        ]
      }),
      "demo",
      { scope: "today", date: "2026-06-11" },
      "2026-06-10"
    );

    expect(response.period).toEqual({
      scope: "today",
      startDate: "2026-06-11",
      endDate: "2026-06-11",
      calendarDays: 1
    });
    expect(response.days[0]).toMatchObject({
      date: "2026-06-11",
      foods: [expect.objectContaining({ name: "Chicken rice", calories: 650 })],
      exercises: [expect.objectContaining({ name: "Walk", durationMinutes: 30 })],
      totals: {
        caloriesIn: 650,
        caloriesOut: 120,
        exerciseMinutes: 30
      }
    });
    expect(response.analysis).toHaveLength(4);
  });

  it("summarizes only the requested date range", async () => {
    const response = await getCoachSummary(
      createStorage({
        foods: [
          food("2026-06-09", 300),
          food("2026-06-10", 400),
          food("2026-06-11", 500),
          food("2026-06-12", 600)
        ],
        exercises: [exercise("2026-06-11", 20)]
      }),
      "demo",
      {
        scope: "range",
        startDate: "2026-06-10",
        endDate: "2026-06-11"
      },
      "2026-06-12"
    );

    expect(response.period).toMatchObject({
      scope: "range",
      startDate: "2026-06-10",
      endDate: "2026-06-11",
      calendarDays: 2
    });
    expect(response.days.map((day) => day.date)).toEqual(["2026-06-10", "2026-06-11"]);
    expect(response.totals).toMatchObject({
      caloriesIn: 900,
      caloriesOut: 80,
      exerciseMinutes: 20
    });
  });

  it("starts an all-time summary at the first confirmed weight", async () => {
    const response = await getCoachSummary(
      createStorage({
        foods: [food("2026-06-01", 300), food("2026-06-05", 500), food("2026-06-11", 700)],
        weights: [
          weight("2026-06-03", 76),
          weight("2026-06-11", 74.5)
        ]
      }),
      "demo",
      { scope: "all" },
      "2026-06-11"
    );

    expect(response.period).toMatchObject({
      scope: "all",
      startDate: "2026-06-03",
      endDate: "2026-06-11",
      calendarDays: 9
    });
    expect(response.days.map((day) => day.date)).toEqual(["2026-06-03", "2026-06-05", "2026-06-11"]);
    expect(response.totals.caloriesIn).toBe(1200);
    expect(response.weight).toMatchObject({
      firstInPeriod: expect.objectContaining({ weightKg: 76 }),
      latestInPeriod: expect.objectContaining({ weightKg: 74.5 }),
      deltaKg: -1.5
    });
  });
});

function food(date: string, calories: number): FoodLog {
  return {
    userId: "demo",
    name: "Recorded meal",
    calories,
    loggedAt: `${date}T05:00:00.000Z`
  };
}

function exercise(date: string, durationMinutes: number): ExerciseLog {
  return {
    userId: "demo",
    name: "Walk",
    durationMinutes,
    intensity: "low",
    loggedAt: `${date}T11:00:00.000Z`
  };
}

function weight(date: string, weightKg: number): WeightLog {
  return {
    userId: "demo",
    weightKg,
    loggedAt: `${date}T01:00:00.000Z`
  };
}
