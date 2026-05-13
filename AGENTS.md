# Agent Guide

This file describes how coding agents should work in this repository.

## Project Purpose

FitSheet Coach GPT is a TypeScript Express middleware API for a Custom GPT personal trainer. It validates requests, normalizes health data, stores logs in JSON file storage by default, and exposes summary endpoints for GPT Actions.

## Local Constraint

Do not run Node.js or npm commands from the assistant environment unless the user explicitly asks and the environment supports it. If a task requires Node.js or npm, provide the exact command for the user to run.

Examples:

```bash
npm run build
npm test
npm run dev
```

## Repository Structure

```txt
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
```

## Ownership Rules

- `src/app.ts`: Express app composition.
- `src/server.ts`: runtime server entrypoint.
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

Default storage:

```env
STORAGE_DRIVER=json
DATA_FILE_PATH=./data/fitsheet.json
```

Runtime data shape:

```json
{
  "schemaVersion": 1,
  "profiles": [],
  "foods": [],
  "exercises": [],
  "weights": []
}
```

JSON file storage is acceptable for local development and MVP testing. It is not durable on Vercel serverless deployment. For production, preserve the `StorageService` interface and replace the adapter with a hosted NoSQL backend.

## Verification

When code changes are made, ask the user to run the relevant commands:

```bash
npm run build
npm test
```

If storage behavior changes, also ask the user to run the API locally and verify that `data/fitsheet.json` is updated after sample requests.

## Git Workflow

- Keep commits focused.
- Do not rewrite history unless the user explicitly requests it.
- Do not revert user changes without explicit permission.
- Push checkpoints after meaningful completed steps when remote access is available.

## Deployment Notes

Deploy only after local build, tests, and local API storage verification pass.

Recommended order:

```txt
local JSON storage verification
-> choose production storage
-> deploy API
-> update openapi.yaml production server URL
-> connect Custom GPT Actions
```
