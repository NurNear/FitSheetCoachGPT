# Agent Guide

This file describes how coding agents should work in this repository.

## Project Purpose

FitSheet Coach GPT is a TypeScript Express middleware API for a Custom GPT personal trainer. It validates requests, normalizes health data, stores logs in Upstash Redis for Vercel deployment, and exposes summary endpoints for GPT Actions.

## Local Constraint

Do not run Node.js or npm commands from the assistant environment unless the user explicitly asks and the environment supports it. If a task requires Node.js or npm, provide the exact command for the user to run.

Examples:

```bash
npm install
npm run build
npm test
npm run dev
```

## Repository Structure

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

## Ownership Rules

- `api/index.ts`: Vercel Function entrypoint.
- `src/app.ts`: Express app composition.
- `src/server.ts`: local runtime server entrypoint.
- `src/config/`: environment parsing and config.
- `src/constants/`: stable lookup tables.
- `src/middleware/`: Express middleware only.
- `src/routes/`: route handlers. Keep these thin.
- `src/services/`: business logic and external integrations.
- `src/types/`: shared domain types.
- `src/utils/`: small framework-agnostic helpers.
- `src/validators/`: Zod request schemas.
- `tests/`: automated tests.
- `docs/`: human setup and operational docs.
- `openapi.yaml`: GPT Actions schema.
- `vercel.json`: Vercel routing/build configuration.

## Coding Guidelines

- Keep route handlers focused on parsing, calling services, and returning responses.
- Put validation in `validators/`, not inline in routes.
- Put reusable business logic in `services/`.
- Keep persistence details behind the storage service abstraction.
- Keep domain types in `types/domain.ts` unless the domain grows enough to split.
- Prefer small, explicit functions over broad utility modules.
- Do not commit `.env`, credentials, generated secrets, `node_modules/`, `dist/`, or runtime JSON data.
- Update `openapi.yaml` whenever endpoint behavior or response shape changes.
- Update README or docs when setup steps change.

## Storage Contract

Production storage:

```env
STORAGE_DRIVER=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=fitsheet
```

Local-only fallback:

```env
STORAGE_DRIVER=json
DATA_FILE_PATH=./data/fitsheet.json
```

Upstash key pattern:

```txt
fitsheet:profiles:<userId>
fitsheet:foods:<userId>:<yyyy-mm-dd>
fitsheet:exercises:<userId>:<yyyy-mm-dd>
fitsheet:weights:<userId>
```

## Verification

When code changes are made, ask the user to run the relevant commands:

```bash
npm install
npm run build
npm test
```

If storage behavior changes, also ask the user to run local API smoke tests or production Vercel smoke tests.

## Git Workflow

- Keep commits focused.
- Do not rewrite history unless the user explicitly requests it.
- Do not revert user changes without explicit permission.
- Push checkpoints after meaningful completed steps when remote access is available.

## Deployment Notes

Deploy only after local build and tests pass.

Recommended order:

```txt
Upstash Redis setup
-> local build/test
-> Vercel deploy
-> production smoke test
-> update openapi.yaml production server URL
-> connect Custom GPT Actions
```
