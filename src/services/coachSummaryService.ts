import type {
  CoachSummaryAnalysis,
  CoachSummaryDay,
  CoachSummaryReport,
  CoachSummaryScope,
  ProfileMetrics,
  WeightLog
} from "../types/domain.js";
import { dateRange } from "../utils/date.js";
import { estimateCalorieTarget, estimateExerciseCalories } from "./fitnessService.js";
import type { StorageService } from "./storageService.js";

const CALORIE_DEVIATION_THRESHOLD = 300;

interface SummaryPeriodInput {
  scope: CoachSummaryScope;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export async function getCoachSummary(
  storage: StorageService,
  userId: string,
  input: SummaryPeriodInput,
  currentDate: string
): Promise<CoachSummaryReport> {
  const [profile, allWeights] = await Promise.all([
    storage.getLatestProfile(userId),
    storage.getWeightLogs(userId)
  ]);
  const sortedWeights = [...allWeights].sort((left, right) =>
    left.loggedAt.localeCompare(right.loggedAt)
  );
  const period = resolvePeriod(input, sortedWeights, currentDate);
  const dates = dateRange(period.startDate, period.endDate);
  const [foodsByDate, exercisesByDate] = await Promise.all([
    storage.getFoodLogsForDates
      ? storage.getFoodLogsForDates(userId, dates)
      : Promise.all(dates.map((date) => storage.getFoodLogs(userId, date))),
    storage.getExerciseLogsForDates
      ? storage.getExerciseLogsForDates(userId, dates)
      : Promise.all(dates.map((date) => storage.getExerciseLogs(userId, date)))
  ]);
  const dayRecords = dates.map((date, index): CoachSummaryDay => {
    const foods = foodsByDate[index] ?? [];
    const exercises = exercisesByDate[index] ?? [];
    const weights = sortedWeights.filter((weight) => weight.loggedAt.startsWith(date));

    return buildDay(date, foods, exercises, weights);
  });
  const days = dayRecords.filter(
    (day) => day.foods.length > 0 || day.exercises.length > 0 || day.weights.length > 0
  );
  const periodWeights = sortedWeights.filter((weight) => {
    const date = weight.loggedAt.slice(0, 10);
    return date >= period.startDate && date <= period.endDate;
  });
  const knownWeights = sortedWeights.filter(
    (weight) => weight.loggedAt.slice(0, 10) <= period.endDate
  );
  const foodDays = days.filter((day) => day.foods.length > 0);
  const calorieCompleteDays = foodDays.filter((day) =>
    day.foods.every((food) => typeof food.calories === "number")
  );
  const exerciseDays = days.filter((day) => day.exercises.length > 0);
  const totals = sumTotals(days);
  const firstInPeriod = periodWeights[0];
  const latestInPeriod = periodWeights.at(-1);
  const latestKnown = knownWeights.at(-1);
  const deltaKg =
    firstInPeriod && latestInPeriod
      ? round(latestInPeriod.weightKg - firstInPeriod.weightKg, 2)
      : undefined;

  return {
    userId,
    period: {
      ...period,
      calendarDays: dates.length
    },
    coverage: {
      recordedDays: days.length,
      foodLoggedDays: foodDays.length,
      calorieCompleteDays: calorieCompleteDays.length,
      exerciseLoggedDays: exerciseDays.length,
      weightEntries: periodWeights.length
    },
    totals,
    averages: {
      caloriesInPerFoodLoggedDay:
        foodDays.length > 0 ? Math.round(totals.caloriesIn / foodDays.length) : undefined,
      exerciseMinutesPerExerciseDay:
        exerciseDays.length > 0 ? Math.round(totals.exerciseMinutes / exerciseDays.length) : undefined
    },
    weight: {
      firstInPeriod,
      latestInPeriod,
      latestKnown,
      deltaKg
    },
    days,
    analysis: buildAnalysis({
      profile,
      period,
      days,
      foodDays,
      calorieCompleteDays,
      exerciseDays,
      periodWeights,
      deltaKg
    })
  };
}

function resolvePeriod(
  input: SummaryPeriodInput,
  weights: WeightLog[],
  currentDate: string
): { scope: CoachSummaryScope; startDate: string; endDate: string } {
  if (input.scope === "today") {
    const date = input.date ?? currentDate;
    return { scope: input.scope, startDate: date, endDate: date };
  }

  if (input.scope === "range") {
    return {
      scope: input.scope,
      startDate: input.startDate!,
      endDate: input.endDate!
    };
  }

  const endDate = input.date ?? currentDate;
  const firstWeightDate = weights
    .filter((weight) => weight.loggedAt.slice(0, 10) <= endDate)
    .at(0)
    ?.loggedAt.slice(0, 10);

  return {
    scope: input.scope,
    startDate: firstWeightDate ?? endDate,
    endDate
  };
}

function buildDay(
  date: string,
  foods: CoachSummaryDay["foods"],
  exercises: CoachSummaryDay["exercises"],
  weights: CoachSummaryDay["weights"]
): CoachSummaryDay {
  return {
    date,
    foods: [...foods].sort((left, right) => left.loggedAt.localeCompare(right.loggedAt)),
    exercises: [...exercises].sort((left, right) => left.loggedAt.localeCompare(right.loggedAt)),
    weights: [...weights].sort((left, right) => left.loggedAt.localeCompare(right.loggedAt)),
    totals: {
      caloriesIn: foods.reduce((sum, food) => sum + (food.calories ?? 0), 0),
      caloriesOut: exercises.reduce((sum, exercise) => sum + estimateExerciseCalories(exercise), 0),
      proteinG: round(foods.reduce((sum, food) => sum + (food.proteinG ?? 0), 0), 1),
      carbsG: round(foods.reduce((sum, food) => sum + (food.carbsG ?? 0), 0), 1),
      fatG: round(foods.reduce((sum, food) => sum + (food.fatG ?? 0), 0), 1),
      exerciseMinutes: exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0)
    }
  };
}

function sumTotals(days: CoachSummaryDay[]): CoachSummaryDay["totals"] {
  return days.reduce(
    (totals, day) => ({
      caloriesIn: totals.caloriesIn + day.totals.caloriesIn,
      caloriesOut: totals.caloriesOut + day.totals.caloriesOut,
      proteinG: round(totals.proteinG + day.totals.proteinG, 1),
      carbsG: round(totals.carbsG + day.totals.carbsG, 1),
      fatG: round(totals.fatG + day.totals.fatG, 1),
      exerciseMinutes: totals.exerciseMinutes + day.totals.exerciseMinutes
    }),
    {
      caloriesIn: 0,
      caloriesOut: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      exerciseMinutes: 0
    }
  );
}

function buildAnalysis(input: {
  profile?: ProfileMetrics;
  period: { scope: CoachSummaryScope; startDate: string; endDate: string };
  days: CoachSummaryDay[];
  foodDays: CoachSummaryDay[];
  calorieCompleteDays: CoachSummaryDay[];
  exerciseDays: CoachSummaryDay[];
  periodWeights: WeightLog[];
  deltaKg?: number;
}): CoachSummaryAnalysis[] {
  const calorieAnalysis = buildCalorieAnalysis(input.calorieCompleteDays, input.profile);
  const exerciseAnalysis = buildExerciseAnalysis(input.exerciseDays);
  const weightAnalysis = buildWeightAnalysis(input.periodWeights, input.deltaKg, input.period.scope);
  const coveragePercent = dateRange(input.period.startDate, input.period.endDate).length;
  const recordedPercent =
    coveragePercent > 0 ? Math.round((input.days.length / coveragePercent) * 100) : 0;

  return [
    calorieAnalysis,
    exerciseAnalysis,
    weightAnalysis,
    {
      type: "logging_coverage",
      status: input.days.length > 0 ? "neutral" : "insufficient_data",
      summary:
        input.days.length > 0
          ? `Recorded data exists on ${input.days.length} of ${coveragePercent} calendar day(s). Missing days are unknown.`
          : "No confirmed food, exercise, or weight records were found in the requested period.",
      metrics: {
        recordedDays: input.days.length,
        calendarDays: coveragePercent,
        coveragePercent: recordedPercent,
        foodLoggedDays: input.foodDays.length
      }
    }
  ];
}

function buildCalorieAnalysis(
  days: CoachSummaryDay[],
  profile?: ProfileMetrics
): CoachSummaryAnalysis {
  if (!profile || days.length === 0) {
    return {
      type: "calorie_balance",
      status: "insufficient_data",
      summary: "Calorie balance needs a profile and at least one day with complete food calories.",
      metrics: {
        profileAvailable: profile ? 1 : 0,
        calorieCompleteDays: days.length
      }
    };
  }

  const targetKcal = estimateCalorieTarget(profile);
  const averageNetCalories = Math.round(
    days.reduce((sum, day) => sum + day.totals.caloriesIn - day.totals.caloriesOut, 0) / days.length
  );
  const averageDeviationKcal = averageNetCalories - targetKcal;

  return {
    type: "calorie_balance",
    status: Math.abs(averageDeviationKcal) <= CALORIE_DEVIATION_THRESHOLD ? "on_track" : "attention",
    summary: `Average net calories on complete food-log days were ${averageNetCalories} kcal, ${Math.abs(averageDeviationKcal)} kcal ${averageDeviationKcal >= 0 ? "above" : "below"} the profile target.`,
    metrics: {
      targetKcal,
      averageNetCalories,
      averageDeviationKcal,
      evaluatedDays: days.length
    }
  };
}

function buildExerciseAnalysis(days: CoachSummaryDay[]): CoachSummaryAnalysis {
  if (days.length === 0) {
    return {
      type: "exercise",
      status: "insufficient_data",
      summary: "No confirmed exercise sessions were found in the requested period.",
      metrics: {
        recordedExerciseDays: 0,
        recordedSessions: 0,
        recordedDurationMinutes: 0
      }
    };
  }

  const sessions = days.reduce((sum, day) => sum + day.exercises.length, 0);
  const duration = days.reduce((sum, day) => sum + day.totals.exerciseMinutes, 0);

  return {
    type: "exercise",
    status: "neutral",
    summary: `${sessions} exercise session(s) were recorded across ${days.length} day(s), totaling ${duration} minutes.`,
    metrics: {
      recordedExerciseDays: days.length,
      recordedSessions: sessions,
      recordedDurationMinutes: duration
    }
  };
}

function buildWeightAnalysis(
  weights: WeightLog[],
  deltaKg: number | undefined,
  scope: CoachSummaryScope
): CoachSummaryAnalysis {
  if (weights.length < 2 || deltaKg === undefined) {
    return {
      type: "weight_trend",
      status: "insufficient_data",
      summary:
        scope === "all" && weights.length === 0
          ? "An all-time summary starts from the first weight entry, but no confirmed weight was found."
          : "At least two confirmed weights are required to calculate a trend for this period.",
      metrics: {
        weightEntries: weights.length
      }
    };
  }

  const first = weights[0]!;
  const latest = weights.at(-1)!;
  const direction = deltaKg > 0.2 ? "increasing" : deltaKg < -0.2 ? "decreasing" : "stable";

  return {
    type: "weight_trend",
    status: "neutral",
    summary: `Weight changed from ${first.weightKg} kg to ${latest.weightKg} kg (${deltaKg >= 0 ? "+" : ""}${deltaKg} kg).`,
    metrics: {
      firstWeightKg: first.weightKg,
      latestWeightKg: latest.weightKg,
      deltaKg,
      direction,
      weightEntries: weights.length
    }
  };
}

function round(value: number, digits: number): number {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}
