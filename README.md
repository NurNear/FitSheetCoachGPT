# FitSheet Coach GPT

Middleware API for a Custom GPT personal trainer that logs health data to Google Sheets and returns dashboard summaries.

## Quick Start

```bash
npm install
npm run dev
```

The API runs on `http://localhost:3000` by default.

## Environment

Copy `.env.example` to `.env` and fill in Google Sheets credentials when ready.

```bash
cp .env.example .env
```

For local development without Google credentials, the API runs with in-memory storage.

Google Sheets setup guide: [docs/google-sheets-setup.md](docs/google-sheets-setup.md)

After adding Google credentials to `.env`, verify the connection:

```bash
npm run sheets:check
```

## Google Sheet Tabs

Create these tabs with a header row before enabling Google credentials:

- `Profile`: `userId, sex, age, heightCm, weightKg, activityLevel, goal, loggedAt`
- `FoodLog`: `userId, name, quantity, calories, proteinG, carbsG, fatG, mealType, loggedAt`
- `ExerciseLog`: `userId, name, durationMinutes, caloriesBurned, intensity, loggedAt`
- `WeightLog`: `userId, weightKg, loggedAt`

## Main Endpoints

- `GET /health`
- `POST /api/profile/metrics`
- `POST /api/logs/food`
- `POST /api/logs/exercise`
- `POST /api/logs/weight`
- `GET /api/dashboard/summary?userId=demo`

## Normalization Rules

- Food calories are preserved when provided.
- If food calories are missing but macros exist, calories are estimated from `proteinG * 4 + carbsG * 4 + fatG * 9`.
- Exercise calories are preserved when provided.
- If exercise calories are missing, calories are estimated from duration and intensity.
- Profile metrics return BMR, TDEE, and the daily calorie target immediately after saving.

## GPT Actions

Use `openapi.yaml` as the schema source for Custom GPT Actions.
