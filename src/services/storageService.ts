import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Redis } from "@upstash/redis";
import { env } from "../config/env.js";
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

function normalizeStore(value: unknown): DataStore {
  if (!value || typeof value !== "object") return emptyStore();

  const record = value as Partial<DataStore>;
  return {
    schemaVersion: 1,
    profiles: Array.isArray(record.profiles) ? record.profiles : [],
    foods: Array.isArray(record.foods) ? record.foods : [],
    exercises: Array.isArray(record.exercises) ? record.exercises : [],
    weights: Array.isArray(record.weights) ? record.weights : []
  };
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

  async getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]> {
    return this.store.exercises.filter((exercise) => exercise.userId === userId && sameDate(exercise.loggedAt, date));
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    return this.store.weights.filter((weight) => weight.userId === userId).at(-1);
  }
}

class JsonFileStorageService implements StorageService {
  private readonly filePath = resolve(env.DATA_FILE_PATH);
  private writeQueue: Promise<void> = Promise.resolve();

  async saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics> {
    return this.updateStore((store) => {
      store.profiles.push(profile);
      return profile;
    });
  }

  async saveFood(log: FoodLog): Promise<FoodLog> {
    return this.updateStore((store) => {
      store.foods.push(log);
      return log;
    });
  }

  async saveExercise(log: ExerciseLog): Promise<ExerciseLog> {
    return this.updateStore((store) => {
      store.exercises.push(log);
      return log;
    });
  }

  async saveWeight(log: WeightLog): Promise<WeightLog> {
    return this.updateStore((store) => {
      store.weights.push(log);
      return log;
    });
  }

  async getLatestProfile(userId: string): Promise<ProfileMetrics | undefined> {
    const store = await this.readStore();
    return store.profiles.filter((profile) => profile.userId === userId).at(-1);
  }

  async getFoodLogs(userId: string, date: string): Promise<FoodLog[]> {
    const store = await this.readStore();
    return store.foods.filter((food) => food.userId === userId && sameDate(food.loggedAt, date));
  }

  async getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]> {
    const store = await this.readStore();
    return store.exercises.filter((exercise) => exercise.userId === userId && sameDate(exercise.loggedAt, date));
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    const store = await this.readStore();
    return store.weights.filter((weight) => weight.userId === userId).at(-1);
  }

  private async updateStore<T>(updater: (store: DataStore) => T): Promise<T> {
    let result: T | undefined;

    const operation = this.writeQueue.then(async () => {
      const store = await this.readStore();
      result = updater(store);
      await this.writeStore(store);
    });

    this.writeQueue = operation.then(
      () => undefined,
      () => undefined
    );

    await operation;
    return result as T;
  }

  private async readStore(): Promise<DataStore> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return normalizeStore(JSON.parse(raw));
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return emptyStore();
      }

      throw error;
    }
  }

  private async writeStore(store: DataStore): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
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

  async getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]> {
    return this.getList<ExerciseLog>(this.dateKey("exercises", userId, date));
  }

  async getLatestWeight(userId: string): Promise<WeightLog | undefined> {
    const value = await this.redis.lindex(this.userKey("weights", userId), -1);
    return this.parseJson<WeightLog>(value);
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
  if (env.STORAGE_DRIVER === "json") return new JsonFileStorageService();
  return new UpstashRedisStorageService();
}

export const storage: StorageService = createStorage();
