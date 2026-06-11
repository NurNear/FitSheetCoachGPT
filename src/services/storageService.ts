import { Redis } from "@upstash/redis";
import { env } from "../config/env.js";
import type { ExerciseLog, FoodLog, ProfileMetrics, WeightLog } from "../types/domain.js";

const PIPELINE_DATE_BATCH_SIZE = 90;

export interface StorageService {
  saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics>;
  saveFood(log: FoodLog): Promise<FoodLog>;
  saveExercise(log: ExerciseLog): Promise<ExerciseLog>;
  saveWeight(log: WeightLog): Promise<WeightLog>;
  getLatestProfile(userId: string): Promise<ProfileMetrics | undefined>;
  getFoodLogs(userId: string, date: string): Promise<FoodLog[]>;
  getFoodLogsForDates?(userId: string, dates: string[]): Promise<FoodLog[][]>;
  getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]>;
  getExerciseLogsForDates?(userId: string, dates: string[]): Promise<ExerciseLog[][]>;
  getLatestWeight(userId: string): Promise<WeightLog | undefined>;
  getWeightLogs(userId: string): Promise<WeightLog[]>;
}

interface DataStore {
  schemaVersion: 1;
  profiles: ProfileMetrics[];
  foods: FoodLog[];
  exercises: ExerciseLog[];
  weights: WeightLog[];
}

function emptyStore(): DataStore {
  return {
    schemaVersion: 1,
    profiles: [],
    foods: [],
    exercises: [],
    weights: []
  };
}

function sameDate(loggedAt: string, date: string): boolean {
  return loggedAt.slice(0, 10) === date;
}

class MemoryStorageService implements StorageService {
  private store = emptyStore();

  async saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics> {
    this.store.profiles.push(profile);
    return profile;
  }

  async saveFood(log: FoodLog): Promise<FoodLog> {
    this.store.foods.push(log);
    return log;
  }

  async saveExercise(log: ExerciseLog): Promise<ExerciseLog> {
    this.store.exercises.push(log);
    return log;
  }

  async saveWeight(log: WeightLog): Promise<WeightLog> {
    this.store.weights.push(log);
    return log;
  }

  async getLatestProfile(userId: string): Promise<ProfileMetrics | undefined> {
    return this.store.profiles.filter((profile) => profile.userId === userId).at(-1);
  }

  async getFoodLogs(userId: string, date: string): Promise<FoodLog[]> {
    return this.store.foods.filter((food) => food.userId === userId && sameDate(food.loggedAt, date));
  }

  async getFoodLogsForDates(userId: string, dates: string[]): Promise<FoodLog[][]> {
    return dates.map((date) =>
      this.store.foods.filter((food) => food.userId === userId && sameDate(food.loggedAt, date))
    );
  }

  async getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]> {
    return this.store.exercises.filter((exercise) => exercise.userId === userId && sameDate(exercise.loggedAt, date));
  }

  async getExerciseLogsForDates(userId: string, dates: string[]): Promise<ExerciseLog[][]> {
    return dates.map((date) =>
      this.store.exercises.filter(
        (exercise) => exercise.userId === userId && sameDate(exercise.loggedAt, date)
      )
    );
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    return this.store.weights.filter((weight) => weight.userId === userId).at(-1);
  }

  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    return this.store.weights.filter((weight) => weight.userId === userId);
  }
}

class UpstashRedisStorageService implements StorageService {
  private readonly redis = new Redis({
    url: this.requiredEnv(env.UPSTASH_REDIS_REST_URL, "UPSTASH_REDIS_REST_URL"),
    token: this.requiredEnv(env.UPSTASH_REDIS_REST_TOKEN, "UPSTASH_REDIS_REST_TOKEN"),
    automaticDeserialization: false
  });

  async saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics> {
    await this.append(this.userKey("profiles", profile.userId), profile);
    return profile;
  }

  async saveFood(log: FoodLog): Promise<FoodLog> {
    await this.append(this.dateKey("foods", log.userId, log.loggedAt), log);
    return log;
  }

  async saveExercise(log: ExerciseLog): Promise<ExerciseLog> {
    await this.append(this.dateKey("exercises", log.userId, log.loggedAt), log);
    return log;
  }

  async saveWeight(log: WeightLog): Promise<WeightLog> {
    await this.append(this.userKey("weights", log.userId), log);
    return log;
  }

  async getLatestProfile(userId: string): Promise<ProfileMetrics | undefined> {
    const value = await this.redis.lindex(this.userKey("profiles", userId), -1);
    return this.parseJson<ProfileMetrics>(value);
  }

  async getFoodLogs(userId: string, date: string): Promise<FoodLog[]> {
    return this.getList<FoodLog>(this.dateKey("foods", userId, date));
  }

  async getFoodLogsForDates(userId: string, dates: string[]): Promise<FoodLog[][]> {
    return this.getListsForDates<FoodLog>("foods", userId, dates);
  }

  async getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]> {
    return this.getList<ExerciseLog>(this.dateKey("exercises", userId, date));
  }

  async getExerciseLogsForDates(userId: string, dates: string[]): Promise<ExerciseLog[][]> {
    return this.getListsForDates<ExerciseLog>("exercises", userId, dates);
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    const value = await this.redis.lindex(this.userKey("weights", userId), -1);
    return this.parseJson<WeightLog>(value);
  }

  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    return this.getList<WeightLog>(this.userKey("weights", userId));
  }

  private async append(key: string, value: unknown): Promise<void> {
    await this.redis.rpush(key, JSON.stringify(value));
  }

  private async getList<T>(key: string): Promise<T[]> {
    const values = await this.redis.lrange(key, 0, -1);
    return values.flatMap((value) => {
      const parsed = this.parseJson<T>(value);
      return parsed ? [parsed] : [];
    });
  }

  private async getListsForDates<T>(
    collection: string,
    userId: string,
    dates: string[]
  ): Promise<T[][]> {
    if (dates.length === 0) return [];

    const lists: T[][] = [];

    for (let index = 0; index < dates.length; index += PIPELINE_DATE_BATCH_SIZE) {
      const batch = dates.slice(index, index + PIPELINE_DATE_BATCH_SIZE);
      const pipeline = this.redis.pipeline();
      batch.forEach((date) => {
        pipeline.lrange<string>(this.dateKey(collection, userId, date), 0, -1);
      });
      const values = await pipeline.exec<string[][]>();
      lists.push(
        ...values.map((items) =>
          items.flatMap((value) => {
            const parsed = this.parseJson<T>(value);
            return parsed ? [parsed] : [];
          })
        )
      );
    }

    return lists;
  }

  private parseJson<T>(value: unknown): T | undefined {
    if (!value) return undefined;
    if (typeof value === "string") return JSON.parse(value) as T;
    return value as T;
  }

  private userKey(collection: string, userId: string): string {
    return `${env.REDIS_KEY_PREFIX}:${collection}:${userId}`;
  }

  private dateKey(collection: string, userId: string, loggedAtOrDate: string): string {
    const date = loggedAtOrDate.slice(0, 10);
    return `${env.REDIS_KEY_PREFIX}:${collection}:${userId}:${date}`;
  }

  private requiredEnv(value: string | undefined, name: string): string {
    if (!value) {
      throw new Error(`${name} is required when STORAGE_DRIVER=upstash`);
    }

    return value;
  }
}

function createStorage(): StorageService {
  if (env.STORAGE_DRIVER === "memory") return new MemoryStorageService();
  return new UpstashRedisStorageService();
}

export const storage: StorageService = createStorage();
