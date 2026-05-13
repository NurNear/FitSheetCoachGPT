# FitSheet Coach GPT

Middleware API for a Custom GPT personal trainer and health tracker. The API validates user input, normalizes food and exercise logs, stores data in Upstash Redis for Vercel deployment, and returns dashboard summaries for GPT Actions.

## Architecture

```txt
User
-> Custom GPT
-> Middleware API
-> Upstash Redis
-> Dashboard summary
```

The storage layer is abstracted behind `StorageService`, so the project can still use JSON file storage locally or migrate to another NoSQL backend later.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Zod
- Upstash Redis
- Vercel Functions
- OpenAPI 3.1
- Vitest

## Current Status

- REST API scaffold is implemented.
- Upstash Redis is the recommended storage for Vercel.
- JSON file storage remains available for local-only development.
- In-memory storage is available for temporary testing.
- Google Sheets and Render persistent disk are no longer active requirements.

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

For local JSON-file testing, set:

```env
STORAGE_DRIVER=json
DATA_FILE_PATH=./data/fitsheet.json
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

Production storage:

```env
STORAGE_DRIVER=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=fitsheet
```

Local JSON fallback:

```env
STORAGE_DRIVER=json
DATA_FILE_PATH=./data/fitsheet.json
```

Optional API protection:

```env
API_KEY=
```

## Storage

- Upstash Redis guide: [docs/vercel-deploy.md](docs/vercel-deploy.md)
- Local JSON guide: [docs/json-storage.md](docs/json-storage.md)

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
api/
  index.ts
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
vercel.json
```

## Structure Guidelines

- `api/` owns the Vercel Function entrypoint.
- `routes/` owns HTTP handlers and should stay thin.
- `validators/` owns request validation with Zod.
- `services/` owns business logic and integrations.
- `storageService.ts` owns the storage abstraction and adapters.
- `types/` owns shared domain types.
- `constants/` owns shared lookup tables.
- `utils/` owns small generic helpers only.
- `docs/` owns setup and operational documentation.
- `openapi.yaml` is the source for Custom GPT Actions.

## GPT Actions

Use [openapi.yaml](openapi.yaml) as the schema source for Custom GPT Actions.

Before connecting a Custom GPT:

1. Verify local build and tests.
2. Create or link Upstash Redis in Vercel.
3. Deploy the API to Vercel.
4. Update the `servers` URL in `openapi.yaml` to the production URL.
5. Import `openapi.yaml` into GPT Actions.

## Deployment

Recommended sequence:

```txt
Upstash Redis setup
-> local build/test
-> Vercel deploy
-> smoke test production API
-> update OpenAPI production URL
-> Custom GPT Actions
```

Vercel deployment guide:

[docs/vercel-deploy.md](docs/vercel-deploy.md)
