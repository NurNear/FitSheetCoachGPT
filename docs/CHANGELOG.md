# Changelog

All notable project changes should be recorded here.

## Unreleased

- Updated product requirements to a Custom GPT-mediated tracker with text/image input, GPT Actions, and confirm-before-save behavior.
- Reframed `openapi.yaml` as the implemented backend API contract.
- Superseded the simple Express-served frontend direction with a Custom GPT Actions input flow.
- Removed server-side OpenAI analysis from the MVP so ChatGPT handles text and image interpretation.
- Added owner-bound access through `OWNER_USER_ID` and production environment validation.
- Added confirmed candidate persistence for profile, food, exercise, and weight records.
- Added structured seven-day behavior insights with coverage and evidence.
- Added a restricted `custom-gpt-actions.yaml` schema and reusable Custom GPT instructions.
- Added an automated production smoke test for authentication, owner binding, confirmed writes, and read-back.
- Added automatic food calorie estimation guidance for text and image input when the user does not provide calories.
- Added a read-only daily food-log action so Custom GPT can answer item-level meal-history questions.
- Added detailed today, date-range, and all-time reports with itemized food, exercise, weight, coverage, totals, and analysis.

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
