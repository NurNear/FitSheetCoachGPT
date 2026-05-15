# Architecture Decisions

## ADR-001: Use TypeScript Express for the Middleware API

Status: Accepted

Decision: Build the API with TypeScript and Express.

Context: GPT Actions need stable HTTP endpoints with JSON request and response bodies. Express keeps routing simple, and TypeScript gives the project a typed domain model.

Consequences:

- Route handlers are easy to map to OpenAPI operations.
- TypeScript build checks can catch contract drift inside the codebase.
- The project remains backend-focused and lightweight.

## ADR-002: Use Zod for Request Validation

Status: Accepted

Decision: Validate incoming request bodies and query parameters with Zod schemas in `src/validators/`.

Context: GPT Actions can send malformed or incomplete data. Validation needs to happen before business logic or persistence.

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

## ADR-006: Use OpenAPI 3.1 as the GPT Actions Contract

Status: Accepted

Decision: Maintain `openapi.yaml` as the source schema for Custom GPT Actions.

Context: GPT Actions import OpenAPI schemas and depend on operation IDs, request schemas, and response schemas.

Consequences:

- Endpoint behavior changes require `openapi.yaml` updates.
- Production deployment requires updating the `servers` URL.
- Examples and error schemas should be improved as the API matures.

## ADR-007: Keep the MVP API-First

Status: Accepted

Decision: Prioritize the API and GPT Actions workflow before implementing a browser UI.

Context: The main product experience is currently conversational through a Custom GPT.

Consequences:

- `docs/UI_SPEC.md` describes planned UI behavior but no UI code is implemented yet.
- Dashboard needs are served first by `GET /api/dashboard/summary`.
- A frontend can be added later without changing the core API contract.
