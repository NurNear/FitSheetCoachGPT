import { google } from "googleapis";
import { env, hasGoogleSheetsConfig } from "../config/env.js";
import type { ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../types/domain.js";

export interface StorageService {
  saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics>;
  saveFood(log: FoodLog): Promise<FoodLog>;
  saveExercise(log: ExerciseLog): Promise<ExerciseLog>;
  saveWeight(log: WeightLog): Promise<WeightLog>;
  getLatestProfile(userId: string): Promise<ProfileMetrics | undefined>;
  getFoodLogs(userId: string, date: string): Promise<FoodLog[]>;
  getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]>;
  getLatestWeight(userId: string): Promise<WeightLog | undefined>;
}

function sameDate(loggedAt: string, date: string): boolean {
  return loggedAt.slice(0, 10) === date;
}

class MemoryStorageService implements StorageService {
  private profiles: ProfileMetrics[] = [];
  private foods: FoodLog[] = [];
  private exercises: ExerciseLog[] = [];
  private weights: WeightLog[] = [];

  async saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics> {
    this.profiles.push(profile);
    return profile;
  }

  async saveFood(log: FoodLog): Promise<FoodLog> {
    this.foods.push(log);
    return log;
  }

  async saveExercise(log: ExerciseLog): Promise<ExerciseLog> {
    this.exercises.push(log);
    return log;
  }

  async saveWeight(log: WeightLog): Promise<WeightLog> {
    this.weights.push(log);
    return log;
  }

  async getLatestProfile(userId: string): Promise<ProfileMetrics | undefined> {
    return this.profiles.filter((profile) => profile.userId === userId).at(-1);
  }

  async getFoodLogs(userId: string, date: string): Promise<FoodLog[]> {
    return this.foods.filter((food) => food.userId === userId && sameDate(food.loggedAt, date));
  }

  async getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]> {
    return this.exercises.filter((exercise) => exercise.userId === userId && sameDate(exercise.loggedAt, date));
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    return this.weights.filter((weight) => weight.userId === userId).at(-1);
  }
}

class GoogleSheetsStorageService implements StorageService {
  private sheets = google.sheets("v4");

  private auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  async saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics> {
    await this.append(env.PROFILE_SHEET, [
      profile.userId,
      profile.sex,
      profile.age,
      profile.heightCm,
      profile.weightKg,
      profile.activityLevel,
      profile.goal ?? "",
      profile.loggedAt
    ]);
    return profile;
  }

  async saveFood(log: FoodLog): Promise<FoodLog> {
    await this.append(env.FOOD_LOG_SHEET, [
      log.userId,
      log.name,
      log.quantity ?? "",
      log.calories ?? "",
      log.proteinG ?? "",
      log.carbsG ?? "",
      log.fatG ?? "",
      log.mealType ?? "",
      log.loggedAt
    ]);
    return log;
  }

  async saveExercise(log: ExerciseLog): Promise<ExerciseLog> {
    await this.append(env.EXERCISE_LOG_SHEET, [
      log.userId,
      log.name,
      log.durationMinutes,
      log.caloriesBurned ?? "",
      log.intensity ?? "",
      log.loggedAt
    ]);
    return log;
  }

  async saveWeight(log: WeightLog): Promise<WeightLog> {
    await this.append(env.WEIGHT_LOG_SHEET, [log.userId, log.weightKg, log.loggedAt]);
    return log;
  }

  async getLatestProfile(_userId: string): Promise<ProfileMetrics | undefined> {
    const rows = await this.getRows(env.PROFILE_SHEET);
    return rows
      .map((row) => this.parseProfile(row))
      .filter((profile): profile is ProfileMetrics => profile !== undefined && profile.userId === _userId)
      .at(-1);
  }

  async getFoodLogs(_userId: string, _date: string): Promise<FoodLog[]> {
    const rows = await this.getRows(env.FOOD_LOG_SHEET);
    return rows
      .map((row) => this.parseFood(row))
      .filter((food): food is FoodLog => food !== undefined && food.userId === _userId && sameDate(food.loggedAt, _date));
  }

  async getExerciseLogs(_userId: string, _date: string): Promise<ExerciseLog[]> {
    const rows = await this.getRows(env.EXERCISE_LOG_SHEET);
    return rows
      .map((row) => this.parseExercise(row))
      .filter(
        (exercise): exercise is ExerciseLog =>
          exercise !== undefined && exercise.userId === _userId && sameDate(exercise.loggedAt, _date)
      );
  }

  async getLatestWeight(_userId: string): Promise<WeightLog | undefined> {
    const rows = await this.getRows(env.WEIGHT_LOG_SHEET);
    return rows
      .map((row) => this.parseWeight(row))
      .filter((weight): weight is WeightLog => weight !== undefined && weight.userId === _userId)
      .at(-1);
  }

  private async append(sheetName: string, values: unknown[]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      auth: this.auth,
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values]
      }
    });
  }

  private async getRows(sheetName: string): Promise<string[][]> {
    const response = await this.sheets.spreadsheets.values.get({
      auth: this.auth,
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A2:Z`
    });

    return (response.data.values ?? []) as string[][];
  }

  private parseProfile(row: string[]): ProfileMetrics | undefined {
    const [userId, sex, age, heightCm, weightKg, activityLevel, goal, loggedAt] = row;
    if (!userId || !loggedAt) return undefined;

    return {
      userId,
      sex: sex as ProfileMetrics["sex"],
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel: activityLevel as ProfileMetrics["activityLevel"],
      goal: goal ? (goal as ProfileMetrics["goal"]) : undefined,
      loggedAt
    };
  }

  private parseFood(row: string[]): FoodLog | undefined {
    const [userId, name, quantity, calories, proteinG, carbsG, fatG, mealType, loggedAt] = row;
    if (!userId || !name || !loggedAt) return undefined;

    return {
      userId,
      name,
      quantity: quantity || undefined,
      calories: calories ? Number(calories) : undefined,
      proteinG: proteinG ? Number(proteinG) : undefined,
      carbsG: carbsG ? Number(carbsG) : undefined,
      fatG: fatG ? Number(fatG) : undefined,
      mealType: mealType ? (mealType as FoodLog["mealType"]) : undefined,
      loggedAt
    };
  }

  private parseExercise(row: string[]): ExerciseLog | undefined {
    const [userId, name, durationMinutes, caloriesBurned, intensity, loggedAt] = row;
    if (!userId || !name || !durationMinutes || !loggedAt) return undefined;

    return {
      userId,
      name,
      durationMinutes: Number(durationMinutes),
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
      intensity: intensity ? (intensity as ExerciseLog["intensity"]) : undefined,
      loggedAt
    };
  }

  private parseWeight(row: string[]): WeightLog | undefined {
    const [userId, weightKg, loggedAt] = row;
    if (!userId || !weightKg || !loggedAt) return undefined;

    return {
      userId,
      weightKg: Number(weightKg),
      loggedAt
    };
  }
}

export const storage: StorageService = hasGoogleSheetsConfig
  ? new GoogleSheetsStorageService()
  : new MemoryStorageService();
