# FitSheet Coach GPT

Middleware API for a Custom GPT personal trainer and health tracker. The API validates user input, normalizes food and exercise logs, stores data in a JSON file by default, and returns dashboard summaries for GPT Actions.

## Architecture

```txt
User
-> Custom GPT
-> Middleware API
-> JSON file storage
-> Dashboard summary
```

The storage layer is abstracted behind `StorageService`, so the project can later migrate from JSON file storage to a hosted NoSQL database.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Zod
- JSON file storage
- OpenAPI 3.1
- Vitest

## Current Status

- REST API scaffold is implemented.
- JSON file storage is the default.
- In-memory storage is available for temporary testing.
- Google Sheets has been removed from the active requirement to reduce setup friction.

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

## Environment Variables

See [.env.example](.env.example).

Storage:

```env
STORAGE_DRIVER=json
DATA_FILE_PATH=./data/fitsheet.json
```

Optional API protection:

```env
API_KEY=
```

## Storage

JSON file storage guide:

[docs/json-storage.md](docs/json-storage.md)

Default data file:

```txt
data/fitsheet.json
```

Runtime JSON files are ignored by git:

```txt
data/*.json
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
  middleware/
    apiKey.ts
    errorHandler.ts
    notFound.ts
  routes/
    dashboard.ts
    health.ts
    logs.ts
    profile.ts
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
- `storageService.ts` owns the storage abstraction and JSON file adapter.
- `types/` owns shared domain types.
- `constants/` owns shared lookup tables.
- `utils/` owns small generic helpers only.
- `docs/` owns setup and operational documentation.
- `openapi.yaml` is the source for Custom GPT Actions.

## GPT Actions

Use [openapi.yaml](openapi.yaml) as the schema source for Custom GPT Actions.

Before connecting a Custom GPT:

1. Verify local build and tests.
2. Run the API locally and write sample logs.
3. Confirm `data/fitsheet.json` is updated.
4. Deploy the API.
5. Update the `servers` URL in `openapi.yaml` to the production URL.
6. Import `openapi.yaml` into GPT Actions.

## Deployment

Recommended Render-first sequence:

```txt
JSON storage setup
-> local API test
-> Render Blueprint deploy
-> Render persistent disk verification
-> update OpenAPI production URL
-> Custom GPT Actions
```

Render deployment guide:

[docs/render-deploy.md](docs/render-deploy.md)

This repo includes [render.yaml](render.yaml). It configures a Node web service with a persistent disk mounted at `/var/data` and stores runtime JSON data at `/var/data/fitsheet.json`.

Important: JSON file storage needs a persistent disk in production. On Render, persistent disks require a paid service and prevent scaling to multiple instances. For a larger production system, migrate `StorageService` to a hosted NoSQL option such as Render Key Value, Upstash Redis, MongoDB Atlas, Firestore, or Supabase.
