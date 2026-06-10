import type {
  BehaviorInsight,
  BehaviorInsightsResponse,
  ExerciseLog,
  FoodLog,
  ProfileMetrics,
  WeightLog
} from "../types/domain.js";
import { dateRangeEnding } from "../utils/date.js";
import { estimateCalorieTarget, estimateExerciseCalories } from "./fitnessService.js";
import type { StorageService } from "./storageService.js";

const PERIOD_DAYS = 7;
const CALORIE_DEVIATION_THRESHOLD = 300;
const PROTEIN_GRAMS_PER_KG = 1.2;
const STABLE_WEIGHT_THRESHOLD_KG = 0.2;

interface DayLogs {
  date: string;
  foods: FoodLog[];
  exercises: ExerciseLog[];
}

export async function getBehaviorInsights(
  storage: StorageService,
  userId: string,
  endDate: string
): Promise<BehaviorInsightsResponse> {
  const dates = dateRangeEnding(endDate, PERIOD_DAYS);
  const startDate = dates[0]!;
  const [profile, allWeights, dayLogs] = await Promise.all([
    storage.getLatestProfile(userId),
    storage.getWeightLogs(userId),
    Promise.all(
      dates.map(async (date) => {
        const [foods, exercises] = await Promise.all([
          storage.getFoodLogs(userId, date),
          storage.getExerciseLogs(userId, date)
        ]);
        return { date, foods, exercises };
      })
    )
  ]);

  const weights = allWeights
    .filter((weight) => {
      const date = weight.loggedAt.slice(0, 10);
      return date >= startDate && date <= endDate;
    })
    .sort((left, right) => left.loggedAt.localeCompare(right.loggedAt));

  const foodLoggedDays = dayLogs.filter((day) => day.foods.length > 0);
  const calorieCompleteDays = foodLoggedDays.filter((day) =>
    day.foods.every((food) => typeof food.calories === "number")
  );
  const proteinCompleteDays = foodLoggedDays.filter((day) =>
    day.foods.every((food) => typeof food.proteinG === "number")
  );
  const exerciseLoggedDays = dayLogs.filter((day) => day.exercises.length > 0);
  const anyLoggedDates = new Set([
    ...foodLoggedDays.map((day) => day.date),
    ...exerciseLoggedDays.map((day) => day.date),
    ...weights.map((weight) => weight.loggedAt.slice(0, 10))
  ]);

  const referenceWeightKg = weights.at(-1)?.weightKg ?? profile?.weightKg;
  const insights = [
    buildProteinInsight(proteinCompleteDays, referenceWeightKg),
    buildCalorieInsight(calorieCompleteDays, profile),
    buildExerciseInsight(exerciseLoggedDays),
    buildWeightInsight(weights),
    buildLoggingInsight([...anyLoggedDates].sort())
  ];

  return {
    userId,
    period: {
      startDate,
      endDate,
      days: PERIOD_DAYS
    },
    coverage: {
      anyLoggedDays: anyLoggedDates.size,
      foodLoggedDays: foodLoggedDays.length,
      calorieCompleteDays: calorieCompleteDays.length,
      proteinCompleteDays: proteinCompleteDays.length,
      exerciseLoggedDays: exerciseLoggedDays.length,
      weightEntries: weights.length
    },
    insights
  };
}

function buildProteinInsight(days: DayLogs[], weightKg?: number): BehaviorInsight {
  if (!weightKg || days.length === 0) {
    return insufficientInsight("protein_consistency", {
      proteinCompleteDays: days.length
    });
  }

  const targetProteinG = round(weightKg * PROTEIN_GRAMS_PER_KG, 1);
  const dailyProtein = days.map((day) => ({
    date: day.date,
    proteinG: round(day.foods.reduce((sum, food) => sum + (food.proteinG ?? 0), 0), 1)
  }));
  const averageProteinG = round(average(dailyProtein.map((day) => day.proteinG)), 1);
  const targetMetDays = dailyProtein.filter((day) => day.proteinG >= targetProteinG).length;

  return {
    type: "protein_consistency",
    status: averageProteinG >= targetProteinG ? "on_track" : "attention",
    metrics: {
      referenceWeightKg: weightKg,
      targetProteinG,
      averageProteinG,
      targetMetDays,
      evaluatedDays: dailyProtein.length
    },
    evidence: dailyProtein.map((day) => ({
      date: day.date,
      value: day.proteinG,
      unit: "g",
      note: "Protein total from fully logged protein fields."
    }))
  };
}

function buildCalorieInsight(
  days: DayLogs[],
  profile?: ProfileMetrics
): BehaviorInsight {
  if (!profile || days.length === 0) {
    return insufficientInsight("calorie_balance", {
      calorieCompleteDays: days.length,
      profileAvailable: profile ? 1 : 0
    });
  }

  const targetKcal = estimateCalorieTarget(profile);
  const dailyDeviation = days.map((day) => {
    const caloriesIn = day.foods.reduce((sum, food) => sum + (food.calories ?? 0), 0);
    const caloriesOut = day.exercises.reduce((sum, exercise) => sum + estimateExerciseCalories(exercise), 0);
    return {
      date: day.date,
      deviationKcal: Math.round(caloriesIn - caloriesOut - targetKcal)
    };
  });
  const averageDeviationKcal = Math.round(average(dailyDeviation.map((day) => day.deviationKcal)));
  const aboveTargetDays = dailyDeviation.filter(
    (day) => day.deviationKcal > CALORIE_DEVIATION_THRESHOLD
  ).length;
  const belowTargetDays = dailyDeviation.filter(
    (day) => day.deviationKcal < -CALORIE_DEVIATION_THRESHOLD
  ).length;
  const withinTargetDays = dailyDeviation.length - aboveTargetDays - belowTargetDays;

  return {
    type: "calorie_balance",
    status: Math.abs(averageDeviationKcal) <= CALORIE_DEVIATION_THRESHOLD ? "on_track" : "attention",
    metrics: {
      targetKcal,
      averageDeviationKcal,
      aboveTargetDays,
      belowTargetDays,
      withinTargetDays,
      evaluatedDays: dailyDeviation.length
    },
    evidence: dailyDeviation.map((day) => ({
      date: day.date,
      value: day.deviationKcal,
      unit: "kcal",
      note: "Net calories minus the profile calorie target."
    }))
  };
}

function buildExerciseInsight(days: DayLogs[]): BehaviorInsight {
  if (days.length === 0) {
    return insufficientInsight("exercise_frequency", {
      recordedExerciseDays: 0,
      recordedSessions: 0,
      recordedDurationMinutes: 0
    });
  }

  const sessions = days.flatMap((day) => day.exercises.map((exercise) => ({ date: day.date, exercise })));
  const totalDurationMinutes = sessions.reduce((sum, item) => sum + item.exercise.durationMinutes, 0);

  return {
    type: "exercise_frequency",
    status: days.length >= 3 ? "on_track" : "neutral",
    metrics: {
      recordedExerciseDays: days.length,
      recordedSessions: sessions.length,
      recordedDurationMinutes: totalDurationMinutes
    },
    evidence: days.map((day) => ({
      date: day.date,
      value: day.exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0),
      unit: "minutes",
      note: `${day.exercises.length} recorded exercise session(s).`
    }))
  };
}

function buildWeightInsight(weights: WeightLog[]): BehaviorInsight {
  if (weights.length < 2) {
    return insufficientInsight("weight_trend", {
      weightEntries: weights.length
    });
  }

  const first = weights[0]!;
  const last = weights.at(-1)!;
  const deltaKg = round(last.weightKg - first.weightKg, 2);
  const direction =
    deltaKg > STABLE_WEIGHT_THRESHOLD_KG
      ? "increasing"
      : deltaKg < -STABLE_WEIGHT_THRESHOLD_KG
        ? "decreasing"
        : "stable";

  return {
    type: "weight_trend",
    status: "neutral",
    metrics: {
      firstWeightKg: first.weightKg,
      latestWeightKg: last.weightKg,
      deltaKg,
      direction,
      weightEntries: weights.length
    },
    evidence: weights.map((weight) => ({
      date: weight.loggedAt.slice(0, 10),
      value: weight.weightKg,
      unit: "kg"
    }))
  };
}

function buildLoggingInsight(loggedDates: string[]): BehaviorInsight {
  if (loggedDates.length === 0) {
    return insufficientInsight("logging_completeness", {
      loggedDays: 0,
      periodDays: PERIOD_DAYS,
      coveragePercent: 0
    });
  }

  const coveragePercent = Math.round((loggedDates.length / PERIOD_DAYS) * 100);
  return {
    type: "logging_completeness",
    status: loggedDates.length >= 5 ? "on_track" : "neutral",
    metrics: {
      loggedDays: loggedDates.length,
      periodDays: PERIOD_DAYS,
      coveragePercent
    },
    evidence: loggedDates.map((date) => ({
      date,
      value: "recorded_data",
      note: "At least one food, exercise, or weight record exists."
    }))
  };
}

function insufficientInsight(
  type: BehaviorInsight["type"],
  metrics: BehaviorInsight["metrics"]
): BehaviorInsight {
  return {
    type,
    status: "insufficient_data",
    metrics,
    evidence: []
  };
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, digits: number): number {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}
