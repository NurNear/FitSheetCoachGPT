# Vercel Deployment

This project is prepared for Vercel with an Express API entrypoint at `api/index.ts`.

## Storage

Vercel Functions should not use local JSON files for durable storage. Production deployment uses Upstash Redis via the REST SDK.

Required environment variables:

```env
STORAGE_DRIVER=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
REDIS_KEY_PREFIX=fitsheet
```

Optional API protection:

```env
API_KEY=
```

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

After deploy, replace `<vercel-url>` with your project URL:

```bash
curl https://<vercel-url>/health
```

Create a profile:

```bash
curl -X POST https://<vercel-url>/api/profile/metrics \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "sex": "male",
    "age": 35,
    "heightCm": 175,
    "weightKg": 75,
    "activityLevel": "moderate",
    "goal": "lose_fat"
  }'
```

Log food:

```bash
curl -X POST https://<vercel-url>/api/logs/food \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "name": "Chicken rice",
    "quantity": "1 plate",
    "proteinG": 35,
    "carbsG": 60,
    "fatG": 12,
    "mealType": "lunch"
  }'
```

Get a summary:

```bash
curl -H "x-api-key: your-api-key" "https://<vercel-url>/api/dashboard/summary?userId=demo"
```

## After Deploy

After Vercel gives you the production URL, update `openapi.yaml`:

```yaml
servers:
  - url: https://your-project.vercel.app
```

Then import `openapi.yaml` into Custom GPT Actions.
