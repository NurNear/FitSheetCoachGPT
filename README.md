# FitSheet Coach GPT

Middleware API for a Custom GPT personal trainer and health tracker. The API validates user input, normalizes food and exercise logs, writes data to Google Sheets, and returns dashboard summaries for GPT Actions.

## Architecture

```txt
User
-> Custom GPT
-> Middleware API
-> Google Sheets
-> Dashboard summary
```

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Zod
- Google Sheets API
- OpenAPI 3.1
- Vitest

## Current Status

- REST API scaffold is implemented.
- Google Sheet file has been created.
- Google Sheets setup guide is available.
- In-memory storage is used when Google credentials are missing.
- Google Sheets storage is used when all required credentials are present.

## Local Machine Constraint

If a task requires running Node.js or npm commands on this machine, the user should run the command directly. The assistant will provide the exact command to run instead of executing it.

## Quick Start

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Run the development server:

```bash
npm run dev
```

The API runs on:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run dev
```

Run the API locally with file watching.

```bash
npm run build
```

Compile TypeScript to `dist/`.

```bash
npm start
```

Run the compiled server from `dist/server.js`.

```bash
npm test
```

Run the Vitest test suite.

```bash
npm run lint
```

Run TypeScript checks without emitting files.

```bash
npm run sheets:check
```

Verify Google Sheets credentials, required tabs, and header rows.

## Environment Variables

See [.env.example](.env.example).

Required for Google Sheets mode:

```env
GOOGLE_SHEET_ID=1u8-jhWnVB_xLjOeboR-HkEj8gh9umYYC0cNSDRtrqFQ
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

Optional API protection:

```env
API_KEY=
```

Sheet tab names:

```env
FOOD_LOG_SHEET=FoodLog
EXERCISE_LOG_SHEET=ExerciseLog
WEIGHT_LOG_SHEET=WeightLog
PROFILE_SHEET=Profile
```

## Google Sheets

Setup guide:

[docs/google-sheets-setup.md](docs/google-sheets-setup.md)

Spreadsheet:

```txt
https://docs.google.com/spreadsheets/d/1u8-jhWnVB_xLjOeboR-HkEj8gh9umYYC0cNSDRtrqFQ/edit
```

Required tabs and headers:

- `Profile`: `userId, sex, age, heightCm, weightKg, activityLevel, goal, loggedAt`
- `FoodLog`: `userId, name, quantity, calories, proteinG, carbsG, fatG, mealType, loggedAt`
- `ExerciseLog`: `userId, name, durationMinutes, caloriesBurned, intensity, loggedAt`
- `WeightLog`: `userId, weightKg, loggedAt`

After adding Google credentials to `.env`, verify the connection:

```bash
npm run sheets:check
```

## API Endpoints

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
- Profile metrics return BMR, TDEE, and daily calorie target immediately after saving.

## Project Structure

```txt
src/
  app.ts
  server.ts
  config/
    env.ts
  constants/
    activity.ts
    sheets.ts
  middleware/
    apiKey.ts
    errorHandler.ts
    notFound.ts
  routes/
    dashboard.ts
    health.ts
    logs.ts
    profile.ts
  scripts/
    checkGoogleSheets.ts
  services/
    dashboardService.ts
    fitnessService.ts
    logNormalizationService.ts
    storageService.ts
  types/
    domain.ts
  utils/
    date.ts
    http.ts
  validators/
    logValidators.ts
tests/
docs/
openapi.yaml
```

## Structure Guidelines

- `routes/` owns HTTP handlers and should stay thin.
- `validators/` owns request validation with Zod.
- `services/` owns business logic and integrations.
- `storageService.ts` owns the storage abstraction and Google Sheets adapter.
- `types/` owns shared domain types.
- `constants/` owns shared lookup tables and stable schema constants.
- `utils/` owns small generic helpers only.
- `scripts/` owns operational scripts run with npm.
- `docs/` owns setup and operational documentation.
- `openapi.yaml` is the source for Custom GPT Actions.

## GPT Actions

Use [openapi.yaml](openapi.yaml) as the schema source for Custom GPT Actions.

Before connecting a Custom GPT:

1. Verify local build and tests.
2. Verify Google Sheets access with `npm run sheets:check`.
3. Deploy the API.
4. Update the `servers` URL in `openapi.yaml` to the production URL.
5. Import `openapi.yaml` into GPT Actions.

## Deployment

Recommended sequence:

```txt
Google Sheets setup
-> local .env
-> npm run sheets:check
-> local API test
-> Vercel project
-> Vercel environment variables
-> deploy
-> update OpenAPI production URL
-> Custom GPT Actions
```

Vercel environment variables should match local `.env` values, especially:

- `API_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `FOOD_LOG_SHEET`
- `EXERCISE_LOG_SHEET`
- `WEIGHT_LOG_SHEET`
- `PROFILE_SHEET`
