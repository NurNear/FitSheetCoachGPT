# Data Model

## Domain Types

The canonical domain types live in `src/types/domain.ts`.

```ts
export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface ProfileMetrics {
  userId: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal?: "lose_fat" | "maintain" | "gain_muscle";
  loggedAt: string;
}

export interface FoodLog {
  userId: string;
  name: string;
  quantity?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt: string;
}

export interface ExerciseLog {
  userId: string;
  name: string;
  durationMinutes: number;
  caloriesBurned?: number;
  intensity?: "low" | "moderate" | "high";
  loggedAt: string;
}

export interface WeightLog {
  userId: string;
  weightKg: number;
  loggedAt: string;
}

export interface DashboardSummary {
  userId: string;
  date: string;
  totals: {
    caloriesIn: number;
    caloriesOut: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  latestWeightKg?: number;
  bmr?: number;
  tdee?: number;
  calorieTarget?: number;
  recommendation: string;
}
```

`BehaviorInsightsResponse` contains a seven-day period, explicit data coverage, and structured protein, calorie, exercise, weight, and logging insights. Each insight includes metrics and stored-record evidence so Custom GPT can explain it in the user's language.

## Validation Rules

### ProfileMetrics

- `userId`: non-empty string.
- `sex`: `male` or `female`.
- `age`: integer from `10` to `120`.
- `heightCm`: positive number up to `260`.
- `weightKg`: positive number up to `500`.
- `activityLevel`: `sedentary`, `light`, `moderate`, `active`, or `very_active`.
- `goal`: optional `lose_fat`, `maintain`, or `gain_muscle`.
- `loggedAt`: optional ISO datetime; defaults to current time when omitted.

### FoodLog

- `userId`: non-empty string.
- `name`: non-empty string.
- `quantity`: optional string.
- `calories`: optional non-negative number.
- `proteinG`: optional non-negative number.
- `carbsG`: optional non-negative number.
- `fatG`: optional non-negative number.
- `mealType`: optional `breakfast`, `lunch`, `dinner`, or `snack`.
- `loggedAt`: optional ISO datetime; defaults to current time when omitted.

### ExerciseLog

- `userId`: non-empty string.
- `name`: non-empty string.
- `durationMinutes`: positive number up to `1440`.
- `caloriesBurned`: optional non-negative number.
- `intensity`: optional `low`, `moderate`, or `high`.
- `loggedAt`: optional ISO datetime; defaults to current time when omitted.

### WeightLog

- `userId`: non-empty string.
- `weightKg`: positive number up to `500`.
- `loggedAt`: optional ISO datetime; defaults to current time when omitted.

## Calculation Rules

### BMR

The project uses the Mifflin-St Jeor style calculation:

```txt
base = 10 * weightKg + 6.25 * heightCm - 5 * age
male BMR = base + 5
female BMR = base - 161
```

The result is rounded to the nearest integer.

### TDEE

```txt
TDEE = BMR * activityFactor
```

Activity factors are defined in `src/constants/activity.ts`.

### Calorie Target

```txt
lose_fat = TDEE - 400
gain_muscle = TDEE + 250
maintain or missing goal = TDEE
```

### Food Calories

If `calories` is provided, it is rounded and preserved.

If `calories` is missing and at least one macro field is present:

```txt
calories = proteinG * 4 + carbsG * 4 + fatG * 9
```

Missing macro fields count as `0`.

For the Custom GPT flow, food candidates should include a calorie value before confirmation. When the user does not provide one, Custom GPT estimates a central value from the text description or image, discloses meaningful uncertainty during review, and records key portion or ingredient assumptions in candidate metadata. The backend does not analyze raw text or images.

### Exercise Calories

If `caloriesBurned` is provided, it is rounded and preserved.

If missing:

```txt
low = durationMinutes * 4
moderate = durationMinutes * 7
high = durationMinutes * 10
```

Missing intensity defaults to `moderate`.

## Storage Model

### Storage Service Interface

```ts
export interface StorageService {
  saveProfile(profile: ProfileMetrics): Promise<ProfileMetrics>;
  saveFood(log: FoodLog): Promise<FoodLog>;
  saveExercise(log: ExerciseLog): Promise<ExerciseLog>;
  saveWeight(log: WeightLog): Promise<WeightLog>;
  getLatestProfile(userId: string): Promise<ProfileMetrics | undefined>;
  getFoodLogs(userId: string, date: string): Promise<FoodLog[]>;
  getExerciseLogs(userId: string, date: string): Promise<ExerciseLog[]>;
  getLatestWeight(userId: string): Promise<WeightLog | undefined>;
  getWeightLogs(userId: string): Promise<WeightLog[]>;
}
```

## Behavior Insight Rules

- The period is seven UTC calendar days including `endDate`.
- Missing days remain unknown and are not counted as zero intake or missed exercise.
- Protein evaluation requires complete protein fields for the evaluated food day and uses `1.2 g/kg` as a coaching reference.
- Calorie evaluation requires complete calorie values for the evaluated food day and compares net calories with the profile target using a `+/-300 kcal` range.
- Exercise frequency reports only confirmed sessions.
- Weight direction requires at least two records and treats changes within `0.2 kg` as stable.

### Upstash Redis Keys

With `REDIS_KEY_PREFIX=fitsheet`:

```txt
fitsheet:profiles:<userId>
fitsheet:foods:<userId>:<yyyy-mm-dd>
fitsheet:exercises:<userId>:<yyyy-mm-dd>
fitsheet:weights:<userId>
```

Values are JSON-stringified records stored in Redis lists.

### Memory Store Shape

Temporary memory storage uses this in-process shape:

```ts
interface DataStore {
  schemaVersion: 1;
  profiles: ProfileMetrics[];
  foods: FoodLog[];
  exercises: ExerciseLog[];
  weights: WeightLog[];
}
```

Memory storage is non-durable and resets when the process restarts.
