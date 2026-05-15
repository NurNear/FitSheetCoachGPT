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

## Phase 4: GPT Actions Contract

Goal: Make the API usable by a Custom GPT.

Deliverables:

- OpenAPI 3.1 schema.
- Operation IDs for GPT Actions.
- API key security scheme.
- Endpoint examples in docs.
- Production server URL update after deployment.

Exit criteria:

- The Custom GPT can import `openapi.yaml`.
- GPT Actions can call write and summary endpoints with expected responses.

## Phase 5: Dashboard and UX Expansion

Goal: Add human-readable views after API stability.

Deliverables:

- Dashboard page for daily summary.
- Profile setup page.
- Log review pages.
- Client-side validation aligned with API validation.
- Optional manual correction flows for logged data.

Exit criteria:

- A user can inspect recent health data without using raw API responses.
- UI behavior matches documented validation and data model rules.
