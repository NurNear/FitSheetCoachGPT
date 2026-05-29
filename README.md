# FitSheet Coach

FitSheet Coach is a TypeScript Express API for an AI coach-mediated personal health tracker. The frontend sends text and image input to a backend coach layer, the backend uses OpenAI to propose structured health logs and coaching advice, and records are saved only after explicit user confirmation.

## Architecture

```txt
User
-> Frontend
-> Backend Coach API
-> OpenAI
-> Backend Storage API
-> Upstash Redis
-> Dashboard summary
```

Storage is Upstash Redis for Vercel deployment. Temporary local testing can use the in-memory driver.

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- Zod
- OpenAI API
- Upstash Redis
- Vercel Functions
- OpenAPI 3.1
- Vitest

## Current Status

- Core API scaffold is implemented.
- Profile, food, exercise, weight, health, and dashboard summary endpoints exist.
- Upstash Redis is the persistent storage driver.
- Local JSON file storage has been removed.
- AI coach requirements are documented in `docs/PRD.md` and `docs/UI_SPEC.md`; analyze and confirm endpoints now have backend foundation routes, while OpenAI analysis and UI code are not implemented yet.

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

Planned AI coach integration:

```env
OPENAI_API_KEY=
```

`OPENAI_API_KEY` must stay server-side. The frontend should call backend coach endpoints, not OpenAI directly.

## Implemented API Endpoints

- `GET /health`
- `POST /api/profile/metrics`
- `POST /api/logs/food`
- `POST /api/logs/exercise`
- `POST /api/logs/weight`
- `GET /api/dashboard/summary?userId=demo`

See [docs/API_SPEC.md](docs/API_SPEC.md) for examples.

## AI Coach Endpoints

- `POST /api/coach/analyze`
- `POST /api/coach/confirm`

## Future AI Coach Endpoint

- `GET /api/coach/behavior?userId=demo`

Behavior insights are documented as a future requirement and should be added to [openapi.yaml](openapi.yaml) after implementation.

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

## AI Coach Integration

Use [openapi.yaml](openapi.yaml) as the contract for implemented backend endpoints. Future AI coach endpoints should be documented in [docs/API_SPEC.md](docs/API_SPEC.md) before implementation and added to the schema after they exist.

Before wiring the AI coach flow to production:

1. Run local build and tests.
2. Configure Upstash Redis.
3. Configure `OPENAI_API_KEY` server-side.
4. Deploy to Vercel.
5. Smoke test production endpoints.
6. Update the `servers` URL in `openapi.yaml`.
7. Configure the frontend to call the deployed backend coach API URL.

## Verification

After code changes, run:

```bash
npm run build
npm test
```

For documentation-only changes, review the Markdown files for accuracy and link consistency.
