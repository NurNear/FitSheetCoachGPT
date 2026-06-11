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

- [x] Verify `openapi.yaml` matches every implemented route.
- [x] Add documented error response schemas to `openapi.yaml`.
- [x] Add example request and response objects to `openapi.yaml`.
- [ ] Confirm implemented API examples match the production schema.
- [ ] Update the OpenAPI `servers` URL after production deployment.
- [x] Add coach endpoints to `openapi.yaml` only after they are implemented.

## Validation

- [ ] Add validator tests for profile metrics.
- [ ] Add validator tests for food logs.
- [ ] Add validator tests for exercise logs.
- [ ] Add validator tests for weight logs.
- [ ] Add validator tests for dashboard query parameters.
- [x] Confirm all validation error responses use the same envelope.

## Fitness Logic

- [ ] Add tests for BMR calculation by sex.
- [ ] Add tests for TDEE calculation by activity level.
- [ ] Add tests for goal-based calorie target adjustments.
- [ ] Add tests for food calorie estimation from macros.
- [ ] Add tests for exercise calorie estimation by intensity.
- [ ] Document calculation formulas in `docs/DATA_MODEL.md` if formulas change.

## Storage

- [ ] Add storage contract tests that can run against memory storage.
- [x] Add Upstash storage smoke test checklist for production.
- [ ] Document Redis key examples for each stored record type.
- [ ] Review whether list growth needs retention or archival rules.

## Security

- [x] Confirm `API_KEY` is required in production deployment.
- [x] Document API key and owner setup in deployment docs.
- [ ] Add tests for unauthorized API requests when `API_KEY` is set.
- [ ] Add tests confirming `GET /health` remains public.
- [ ] Review CORS policy before exposing the API to any browser frontend.
- [x] Document that the primary Custom GPT flow does not require backend `OPENAI_API_KEY`.
- [ ] Confirm backend `API_KEY` can be safely configured for GPT Actions.

## Dashboard

- [ ] Add daily summary examples for users with no profile.
- [ ] Add daily summary examples for users with profile and logs.
- [x] Add a separate read endpoint for daily food items instead of expanding the summary response.
- [x] Add combined today, date-range, and all-time coach summary reports.
- [x] Accept timezone-offset measurement timestamps and smart-scale body-composition details.
- [ ] Decide whether summary date should use user timezone in a future phase.
- [ ] Add UI-ready response fields only after updating `openapi.yaml`.

## Deployment

- [ ] Create Upstash Redis database.
- [ ] Add Upstash environment variables to Vercel.
- [ ] Add `API_KEY` to Vercel.
- [ ] Add `OWNER_USER_ID` to Vercel.
- [ ] Deploy to Vercel.
- [ ] Run production smoke tests.
- [x] Update `openapi.yaml` with the production URL.
- [ ] Configure Custom GPT Actions authentication with the production backend `API_KEY`.
- [ ] Configure Custom GPT Actions to use the production `custom-gpt-actions.yaml` server URL.

## Custom GPT Coach Flow

- [x] Choose Custom GPT as the default text/image input and analysis surface.
- [x] Write Custom GPT instructions for Thai/English health input, image analysis, candidate review, and confirm-before-save behavior.
- [x] Create the restricted `custom-gpt-actions.yaml` schema.
- [x] Design `POST /api/coach/confirm` request and response schemas.
- [x] Remove server-side OpenAI analysis from the MVP.
- [x] Ensure Custom GPT can send structured profile, food, exercise, and weight candidates to the backend.
- [x] Require Custom GPT to estimate food calories from text or images when the user does not provide them.
- [x] Require explicit user confirmation before saving candidates.
- [x] Add behavior insights based only on submitted inputs and stored logs.
- [ ] Test text input, image input, edit, reject, and confirm flows inside Custom GPT.
- [ ] Decide whether a separate browser dashboard is still needed.
