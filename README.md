# FitSheet Coach

FitSheet Coach is a TypeScript Express API for a Custom GPT-mediated personal health tracker. The user sends Thai/English text and images to a Custom GPT in ChatGPT, the Custom GPT interprets the input and calls this backend through GPT Actions, and records are saved only after explicit user confirmation.

## Architecture

```txt
User
-> Custom GPT in ChatGPT
-> GPT Actions
-> Backend API
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
- Custom GPT Actions
- Upstash Redis
- Vercel Functions
- OpenAPI 3.1
- Vitest

## Current Status

- Core API scaffold is implemented.
- Profile, food, exercise, weight, health, and dashboard summary endpoints exist.
- Confirm-before-save coach persistence and seven-day behavior insights are implemented.
- Custom GPT estimates food calories from text or images when the user does not provide them, then asks for confirmation.
- Protected routes can be bound to one owner with `OWNER_USER_ID`.
- Upstash Redis is the persistent storage driver.
- Local JSON file storage has been removed.
- Coach requirements are documented in `docs/PRD.md` and `docs/UI_SPEC.md`; the active product direction is Custom GPT input and image analysis through GPT Actions, with the backend focused on validation, confirmed persistence, and dashboard summaries.

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
OWNER_USER_ID=
```

Production requires both `API_KEY` and `OWNER_USER_ID`. Custom GPT integration does not require `OPENAI_API_KEY`; ChatGPT handles text and image analysis.

## Implemented API Endpoints

- `GET /health`
- `POST /api/profile/metrics`
- `POST /api/logs/food`
- `POST /api/logs/exercise`
- `POST /api/logs/weight`
- `GET /api/dashboard/summary?userId=demo`
- `POST /api/coach/confirm`
- `GET /api/coach/behavior?userId=demo`

See [docs/API_SPEC.md](docs/API_SPEC.md) for examples.

## Project Documentation

- [Product requirements](docs/PRD.md)
- [MVP phases](docs/PHASES.md)
- [Task backlog](docs/TASKS.md)
- [Architecture decisions](docs/DECISIONS.md)
- [API specification](docs/API_SPEC.md)
- [Data model](docs/DATA_MODEL.md)
- [UI specification](docs/UI_SPEC.md)
- [Custom GPT instructions](docs/CUSTOM_GPT_INSTRUCTIONS.md)
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
custom-gpt-actions.yaml
vercel.json
```

## Custom GPT Integration

Use [openapi.yaml](openapi.yaml) as the complete backend contract. Import [custom-gpt-actions.yaml](custom-gpt-actions.yaml) into Custom GPT so it can access only health, confirmed persistence, dashboard summaries, and behavior insights. Apply [the Custom GPT instructions](docs/CUSTOM_GPT_INSTRUCTIONS.md) after replacing `<OWNER_USER_ID>`.

Before wiring the Custom GPT flow to production:

1. Run local build and tests.
2. Configure Upstash Redis.
3. Configure `API_KEY` and `OWNER_USER_ID`.
4. Deploy to Vercel.
5. Run `scripts/production-smoke-test.sh` against the deployment.
6. Update the `servers` URL in both OpenAPI files.
7. Configure Custom GPT Actions with `custom-gpt-actions.yaml`.
8. Test text, image, edit, reject, confirmation, dashboard, and behavior flows.

## Verification

After code changes, run:

```bash
npm run build
npm test
```

For documentation-only changes, review the Markdown files for accuracy and link consistency.
