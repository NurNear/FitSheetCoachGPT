# FitSheet Coach GPT

FitSheet Coach GPT is a TypeScript Express middleware API for a Custom GPT personal trainer. It validates requests, normalizes health data, stores logs through a storage abstraction, and exposes summary endpoints that GPT Actions can call.

## Architecture

```txt
User
-> Custom GPT
-> Middleware API
-> Upstash Redis
-> Dashboard summary
```

Storage is Upstash Redis for Vercel deployment. Temporary local testing can use the in-memory driver.

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- Zod
- Upstash Redis
- Vercel Functions
- OpenAPI 3.1
- Vitest

## Current Status

- Core API scaffold is implemented.
- Profile, food, exercise, weight, health, and dashboard summary endpoints exist.
- Upstash Redis is the persistent storage driver.
- Local JSON file storage has been removed.
- Browser UI is not implemented yet; see `docs/UI_SPEC.md` for the planned UI.

## Local Machine Constraint

Coding agents should not run Node.js or npm commands from the assistant environment unless the user explicitly asks and the environment supports it. When verification is needed, agents should provide the exact command for the user to run.

## Quick Start

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

For persistent storage, set:

```env
STORAGE_DRIVER=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=fitsheet
```

Run the development server:

```bash
npm run dev
```

The API runs at:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
npm run lint
```

## Environment Variables

Persistent storage:

```env
STORAGE_DRIVER=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=fitsheet
```

Temporary local testing without persistence:

```env
STORAGE_DRIVER=memory
```

Optional API protection:

```env
API_KEY=
```

## API Endpoints

- `GET /health`
- `POST /api/profile/metrics`
- `POST /api/logs/food`
- `POST /api/logs/exercise`
- `POST /api/logs/weight`
- `GET /api/dashboard/summary?userId=demo`

See [docs/API_SPEC.md](docs/API_SPEC.md) for examples.

## Project Documentation

- [Product requirements](docs/PRD.md)
- [MVP phases](docs/PHASES.md)
- [Task backlog](docs/TASKS.md)
- [Architecture decisions](docs/DECISIONS.md)
- [API specification](docs/API_SPEC.md)
- [Data model](docs/DATA_MODEL.md)
- [UI specification](docs/UI_SPEC.md)
- [Changelog](docs/CHANGELOG.md)
- [Vercel deployment](docs/vercel-deploy.md)

## Project Structure

```txt
api/
  index.ts
src/
  app.ts
  server.ts
  config/
  constants/
  middleware/
  routes/
  services/
  types/
  utils/
  validators/
tests/
docs/
openapi.yaml
vercel.json
```

## GPT Actions

Use [openapi.yaml](openapi.yaml) as the schema source for Custom GPT Actions.

Before connecting a Custom GPT:

1. Run local build and tests.
2. Configure Upstash Redis.
3. Deploy to Vercel.
4. Smoke test production endpoints.
5. Update the `servers` URL in `openapi.yaml`.
6. Import the schema into GPT Actions.

## Verification

After code changes, run:

```bash
npm run build
npm test
```

For documentation-only changes, review the Markdown files for accuracy and link consistency.
