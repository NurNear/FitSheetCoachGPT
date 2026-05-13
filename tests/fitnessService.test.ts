import { describe, expect, it } from "vitest";
import { estimateBmr, estimateCalorieTarget, estimateExerciseCalories, estimateTdee } from "../src/services/fitnessService.js";
import type { ProfileMetrics } from "../src/types/domain.js";

const profile: ProfileMetrics = {
  userId: "demo",
  sex: "male",
  age: 35,
  heightCm: 175,
  weightKg: 75,
  activityLevel: "moderate",
  goal: "lose_fat",
  loggedAt: "2026-05-13T00:00:00.000Z"
};

describe("fitnessService", () => {
  it("estimates BMR and TDEE with Mifflin-St Jeor", () => {
    expect(estimateBmr(profile)).toBe(1674);
    expect(estimateTdee(profile)).toBe(2595);
  });

  it("adjusts calorie targets by goal", () => {
    expect(estimateCalorieTarget(profile)).toBe(2195);
  });

  it("estimates exercise calories when not provided", () => {
    expect(
      estimateExerciseCalories({
        userId: "demo",
        name: "Walk",
        durationMinutes: 30,
        intensity: "low",
        loggedAt: "2026-05-13T00:00:00.000Z"
      })
    ).toBe(120);
  });
});
