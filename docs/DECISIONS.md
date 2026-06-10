# Architecture Decisions

## ADR-001: Use TypeScript Express for the Backend API

Status: Accepted

Decision: Build the backend API with TypeScript and Express.

Context: The frontend needs stable HTTP endpoints with JSON request and response bodies. Express keeps routing simple, and TypeScript gives the project a typed domain model.

Consequences:

- Route handlers are easy to map to OpenAPI operations.
- TypeScript build checks can catch contract drift inside the codebase.
- The project remains backend-focused and lightweight.

## ADR-002: Use Zod for Request Validation

Status: Accepted

Decision: Validate incoming request bodies and query parameters with Zod schemas in `src/validators/`.

Context: Frontend forms and direct API clients can send malformed or incomplete data. Validation needs to happen before business logic or persistence.

Consequences:

- Invalid input returns a structured `400` response.
- Route handlers stay thin.
- Validation rules must be kept aligned with `openapi.yaml`.

## ADR-003: Keep Storage Behind `StorageService`

Status: Accepted

Decision: Route handlers and business services depend on a storage interface instead of a concrete database client.

Context: Production uses Upstash Redis on Vercel, and temporary local testing can use memory storage. Future storage backends should not require route rewrites.

Consequences:

- Storage drivers can be swapped with `STORAGE_DRIVER`.
- Persistence details remain in `src/services/storageService.ts`.
- New data access methods should be added to the interface deliberately.

## ADR-004: Use Upstash Redis for Production Storage

Status: Accepted

Decision: Use Upstash Redis as the default production storage driver.

Context: Vercel Functions are serverless and should not depend on persistent local disk. Upstash Redis provides an HTTP-friendly Redis option.

Consequences:

- Production requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Logs are stored in Redis lists.
- Redis key names must remain stable because they are part of the storage contract.

## ADR-005: Remove JSON File Storage

Status: Accepted

Decision: Do not support local JSON file storage.

Context: JSON storage is convenient for local inspection but does not fit serverless production and can create misleading persistence behavior.

Consequences:

- Persistent storage uses Upstash Redis.
- `STORAGE_DRIVER=json` and `DATA_FILE_PATH` are not supported.
- Temporary local smoke tests can use the non-durable memory driver.

## ADR-006: Use OpenAPI 3.1 as the API Contract

Status: Accepted

Decision: Maintain `openapi.yaml` as the source schema for implemented backend endpoints.

Context: The backend exposes direct write endpoints for trusted clients, while Custom GPT must receive only the confirmed coach write and approved read actions.

Consequences:

- Endpoint behavior changes require `openapi.yaml` updates.
- Production deployment requires updating the `servers` URL when the deployed API URL changes.
- Planned endpoints should not be added to `openapi.yaml` until implemented.
- Examples and error schemas should be improved as the API matures.

## ADR-007: Use a Custom GPT-Mediated Coach Flow

Status: Accepted

Decision: Make the primary product flow `User -> Custom GPT in ChatGPT -> GPT Actions -> Backend API -> Backend Storage API`.

Context: Users should be able to use their own ChatGPT Plus/Custom GPT experience for natural text and image input. ChatGPT Plus cannot be used as a backend API key, so the backend should not depend on a server-side OpenAI API key for the primary flow.

Consequences:

- Custom GPT analyzes text/images inside ChatGPT and calls backend endpoints through GPT Actions.
- The backend validates and persists structured candidates after explicit confirmation.
- Records are saved only after explicit user confirmation.
- Behavior insights must come only from submitted inputs and stored records.
- Server-side OpenAI analysis is excluded from the MVP.
- `openapi.yaml` remains the full backend contract while `custom-gpt-actions.yaml` exposes only approved GPT Actions.
- Production requests are restricted to `OWNER_USER_ID`.
