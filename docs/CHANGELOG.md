# Changelog

All notable project changes should be recorded here.

## Unreleased

- Updated product requirements to an AI coach-mediated tracker with text/image input, backend OpenAI analysis, and confirm-before-save behavior.
- Reframed `openapi.yaml` as the implemented backend API contract.
- Made the simple Express-served frontend the default coach UI direction.
- Added AI coach API foundation with analyze and confirm routes, validators, domain types, OpenAPI entries, and confirm-before-save service behavior.
- Kept behavior insights documented as a future endpoint until implemented.

## 0.1.0 - Initial Setup

- Created TypeScript Express backend API for FitSheet Coach.
- Added Vercel Function entrypoint.
- Added health endpoint.
- Added profile metrics endpoint with BMR, TDEE, and calorie target calculations.
- Added food, exercise, and weight log endpoints.
- Added daily dashboard summary endpoint.
- Added Zod validators for request bodies and query parameters.
- Added storage abstraction with Upstash Redis and memory drivers.
- Added OpenAPI 3.1 schema for the API contract.
- Added Vercel and Upstash Redis documentation.
- Added project documentation set under `docs/`.
