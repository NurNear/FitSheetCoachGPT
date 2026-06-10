# Vercel Deployment

This project is prepared for Vercel with an Express API entrypoint at `api/index.ts`.

## Storage

Vercel Functions should not use local JSON files for durable storage. Production deployment uses Upstash Redis via the REST SDK.

Required environment variables:

```env
API_KEY=
OWNER_USER_ID=
STORAGE_DRIVER=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=fitsheet
```

Production startup requires `API_KEY` and `OWNER_USER_ID`. Custom GPT integration does not require `OPENAI_API_KEY`; ChatGPT handles text and image analysis.

## Upstash Setup

Option A: Vercel Marketplace

1. Open the Vercel project.
2. Go to `Storage` or `Marketplace`.
3. Add `Upstash for Redis`.
4. Create or link an Upstash Redis database.
5. Vercel injects the Redis REST environment variables into the project.

Option B: Upstash Console

1. Create an Upstash Redis database.
2. Copy the REST URL and REST token.
3. Add them to Vercel environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Vercel Setup

1. Push the latest code to GitHub.
2. Import the repository in Vercel.
3. Use the default framework setting or `Other`.
4. Build command:

```bash
npm run build
```

5. Leave output directory empty.
6. Add the environment variables above.
7. Deploy.

## Smoke Test

After deploy, run the automated smoke test from the repository root:

```bash
BASE_URL=https://<vercel-url> \
API_KEY=<production-api-key> \
OWNER_USER_ID=<production-owner-user-id> \
./scripts/production-smoke-test.sh
```

The script verifies:

- Public health access.
- Missing and invalid API-key rejection.
- Owner binding.
- Confirmation-required rejection.
- Confirmed profile, food, exercise, and weight writes.
- Dashboard and seven-day behavior read-back.

The smoke test appends clearly named records to the configured Upstash database. Use a preview deployment and separate database when production data must remain clean. The script requires `curl` and `jq`.

## After Deploy

After Vercel gives you the production URL, update both `openapi.yaml` and `custom-gpt-actions.yaml`:

```yaml
servers:
  - url: https://your-project.vercel.app
```

Import `custom-gpt-actions.yaml` into Custom GPT, configure API-key authentication, and apply `docs/CUSTOM_GPT_INSTRUCTIONS.md` after replacing `<OWNER_USER_ID>`.
