# Task Backlog

## Documentation

- [x] Create `docs/PRD.md` with goals, scope, users, and risks.
- [x] Create `docs/PHASES.md` with MVP phases and exit criteria.
- [x] Create `docs/TASKS.md` with small actionable tasks.
- [x] Create `docs/DECISIONS.md` with architecture decisions.
- [x] Create `docs/API_SPEC.md` with endpoint examples.
- [x] Create `docs/DATA_MODEL.md` with TypeScript types and storage notes.
- [x] Create `docs/UI_SPEC.md` with planned pages, components, and validations.
- [x] Create `docs/CHANGELOG.md` starting with initial setup.
- [x] Refresh root `README.md`.
- [x] Refresh root `AGENTS.md`.

## API Contract

- [ ] Verify `openapi.yaml` matches every implemented route.
- [ ] Add documented error response schemas to `openapi.yaml`.
- [ ] Add example request and response objects to `openapi.yaml`.
- [ ] Confirm implemented API examples match the production schema.
- [ ] Update the OpenAPI `servers` URL after production deployment.
- [x] Add AI coach endpoints to `openapi.yaml` only after they are implemented.

## Validation

- [ ] Add validator tests for profile metrics.
- [ ] Add validator tests for food logs.
- [ ] Add validator tests for exercise logs.
- [ ] Add validator tests for weight logs.
- [ ] Add validator tests for dashboard query parameters.
- [ ] Confirm all validation error responses use the same envelope.

## Fitness Logic

- [ ] Add tests for BMR calculation by sex.
- [ ] Add tests for TDEE calculation by activity level.
- [ ] Add tests for goal-based calorie target adjustments.
- [ ] Add tests for food calorie estimation from macros.
- [ ] Add tests for exercise calorie estimation by intensity.
- [ ] Document calculation formulas in `docs/DATA_MODEL.md` if formulas change.

## Storage

- [ ] Add storage contract tests that can run against memory storage.
- [ ] Add Upstash storage smoke test checklist for production.
- [ ] Document Redis key examples for each stored record type.
- [ ] Review whether list growth needs retention or archival rules.

## Security

- [ ] Confirm `API_KEY` is required in production deployment.
- [ ] Document API key setup in deployment docs.
- [ ] Add tests for unauthorized API requests when `API_KEY` is set.
- [ ] Add tests confirming `GET /health` remains public.
- [ ] Review CORS policy before exposing the API to the frontend.
- [ ] Document `OPENAI_API_KEY` setup as a server-side-only secret.
- [ ] Confirm the frontend never calls OpenAI directly.

## Dashboard

- [ ] Add daily summary examples for users with no profile.
- [ ] Add daily summary examples for users with profile and logs.
- [ ] Decide whether summary should include raw food and exercise lists.
- [ ] Decide whether summary date should use user timezone in a future phase.
- [ ] Add UI-ready response fields only after updating `openapi.yaml`.

## Deployment

- [ ] Create Upstash Redis database.
- [ ] Add Upstash environment variables to Vercel.
- [ ] Add `API_KEY` to Vercel.
- [ ] Deploy to Vercel.
- [ ] Run production smoke tests.
- [ ] Update `openapi.yaml` with the production URL.
- [ ] Add `OPENAI_API_KEY` to Vercel.
- [ ] Configure frontend environment to call the production backend coach API URL.

## AI Coach Flow

- [x] Choose simple Express-served frontend as the default implementation direction.
- [x] Design `POST /api/coach/analyze` request and response schemas.
- [x] Design `POST /api/coach/confirm` request and response schemas.
- [ ] Build server-side OpenAI analysis service for Thai and English text.
- [ ] Add image analysis support through the backend coach endpoint.
- [ ] Return structured profile, food, exercise, and weight log candidates.
- [x] Require explicit user confirmation before saving candidates.
- [ ] Add behavior insights based only on submitted inputs and stored logs.
- [ ] Build coach input page for text and image submissions.
- [ ] Build candidate review, edit, reject, and confirm UI.
- [ ] Build dashboard summary page.
- [ ] Add client-side validation matching Zod schemas.
