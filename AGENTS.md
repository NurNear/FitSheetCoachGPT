# Agent Guide

This file describes how coding agents should work in this repository.

## Project Purpose

FitSheet Coach GPT is a TypeScript Express middleware API for a Custom GPT personal trainer. It validates requests, normalizes health data, stores logs in Google Sheets, and exposes summary endpoints for GPT Actions.

## Local Constraint

Do not run Node.js or npm commands from the assistant environment unless the user explicitly asks and the environment supports it. If a task requires Node.js or npm, provide the exact command for the user to run.

Examples:

```bash
npm run build
npm test
npm run sheets:check
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
  scripts/
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
- `src/constants/`: stable lookup tables and shared schema constants.
- `src/middleware/`: Express middleware only.
- `src/routes/`: route handlers. Keep these thin.
- `src/services/`: business logic and external integrations.
- `src/scripts/`: operational scripts run through npm.
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
- Keep Google Sheets details behind the storage service abstraction.
- Keep domain types in `types/domain.ts` unless the domain grows enough to split.
- Prefer small, explicit functions over broad utility modules.
- Do not commit `.env`, credentials, generated secrets, `node_modules/`, or `dist/`.
- Update `openapi.yaml` whenever endpoint behavior or response shape changes.
- Update README or docs when setup steps change.

## Google Sheets Contract

Required spreadsheet ID for the current project:

```txt
1u8-jhWnVB_xLjOeboR-HkEj8gh9umYYC0cNSDRtrqFQ
```

Required tabs:

- `Profile`
- `FoodLog`
- `ExerciseLog`
- `WeightLog`

Header definitions live in:

```txt
src/constants/sheets.ts
```

After Google credentials are configured, ask the user to run:

```bash
npm run sheets:check
```

## Verification

When code changes are made, ask the user to run the relevant commands:

```bash
npm run build
npm test
```

If Google Sheets behavior changes, also ask for:

```bash
npm run sheets:check
```

## Git Workflow

- Keep commits focused.
- Do not rewrite history unless the user explicitly requests it.
- Do not revert user changes without explicit permission.
- Push checkpoints after meaningful completed steps when remote access is available.

## Deployment Notes

Deploy only after local build, tests, and Google Sheets verification pass.

Recommended order:

```txt
Google Sheets setup
-> local verification
-> Vercel project
-> Vercel environment variables
-> deploy
-> update openapi.yaml production server URL
-> connect Custom GPT Actions
```
