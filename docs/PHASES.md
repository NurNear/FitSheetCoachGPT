# MVP Phases

## Phase 0: Project Foundation

Goal: Establish a deployable TypeScript API scaffold.

Deliverables:

- Express app composition.
- Vercel Function entrypoint.
- TypeScript configuration.
- Environment parsing.
- Health endpoint.
- Basic README and agent guide.

Exit criteria:

- The app can start locally when dependencies are installed.
- `GET /health` returns a successful response.

## Phase 1: Core Tracking API

Goal: Support the minimum useful health tracking workflow.

Deliverables:

- Profile metrics endpoint.
- Food logging endpoint.
- Exercise logging endpoint.
- Weight logging endpoint.
- Zod validators for all request bodies.
- Domain types for profile, food, exercise, weight, and dashboard summary.

Exit criteria:

- Each write endpoint validates required fields.
- Each write endpoint returns the normalized saved record.

## Phase 2: Fitness Calculations and Normalization

Goal: Convert raw logs into coaching-ready data.

Deliverables:

- BMR calculation.
- TDEE calculation from activity level.
- Goal-based calorie target.
- Food calories estimated from macros when calories are missing.
- Exercise calories estimated from duration and intensity when calories are missing.
- Default `loggedAt` normalization.

Exit criteria:

- Profile responses include BMR, TDEE, and calorie target.
- Food and exercise logs store normalized calorie values when enough input exists.

## Phase 3: Storage and Deployment

Goal: Persist data safely across production requests.

Deliverables:

- `StorageService` abstraction.
- Upstash Redis storage driver for production.
- Memory storage driver for temporary testing.
- Vercel deployment documentation.
- Upstash Redis setup documentation.

Exit criteria:

- Production can run with `STORAGE_DRIVER=upstash`.
- Temporary local testing can run with `STORAGE_DRIVER=memory`.
- Storage behavior is isolated from routes.

## Phase 4: Implemented API Contract

Goal: Keep the implemented backend endpoints reliable for coach-confirmed persistence and dashboard reads.

Deliverables:

- OpenAPI 3.1 schema.
- Stable operation IDs for implemented API clients and documentation.
- API key security scheme.
- Endpoint examples in docs.
- Production server URL update after deployment.

Exit criteria:

- `openapi.yaml` matches every implemented route.
- Confirmed coach output can be saved through write endpoints with expected responses.

## Phase 5: AI Coach-Mediated Input Experience

Goal: Add backend-mediated AI coach analysis for text and image input before saving records.

Deliverables:

- `POST /api/coach/analyze` endpoint for text/image analysis foundation.
- `POST /api/coach/confirm` endpoint for explicit save confirmation.
- Frontend input surface for Thai/English text and image upload.
- Candidate review UI with edit and confirm actions.
- Coaching response panel with follow-up questions when confidence is low.
- Behavior insight requirements based only on submitted inputs and stored logs.

Exit criteria:

- A user can submit text or image input and receive structured log candidates.
- No health log is saved until the user explicitly confirms.
- OpenAI credentials remain server-side.
- Behavior insights do not rely on hidden tracking.
