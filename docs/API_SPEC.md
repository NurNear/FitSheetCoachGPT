# API Specification

## Base URL

Local development:

```txt
http://localhost:3000
```

Production:

```txt
https://<your-vercel-project>.vercel.app
```

## Authentication

`GET /health` is public.

All `/api/*` endpoints use the `x-api-key` header when `API_KEY` is configured:

```http
x-api-key: your-api-key
```

If `API_KEY` is not configured, the middleware allows requests without the header. Production should configure `API_KEY`.

## Response Envelope

Successful responses use:

```json
{
  "ok": true,
  "data": {}
}
```

Validation errors use:

```json
{
  "ok": false,
  "error": "ValidationError",
  "details": {}
}
```

Unauthorized responses use:

```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

## Endpoints

### GET /health

Checks whether the API is running.

Example:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "service": "fitsheet-coach-gpt"
  }
}
```

### POST /api/profile/metrics

Saves profile metrics and returns calculated BMR, TDEE, and calorie target.

Required fields:

- `userId`
- `sex`
- `age`
- `heightCm`
- `weightKg`
- `activityLevel`

Example:

```bash
curl -X POST http://localhost:3000/api/profile/metrics \
  -H "content-type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "sex": "male",
    "age": 34,
    "heightCm": 178,
    "weightKg": 82,
    "activityLevel": "moderate",
    "goal": "lose_fat"
  }'
```

Response:

```json
{
  "ok": true,
  "data": {
    "profile": {
      "userId": "demo",
      "sex": "male",
      "age": 34,
      "heightCm": 178,
      "weightKg": 82,
      "activityLevel": "moderate",
      "goal": "lose_fat",
      "loggedAt": "2026-05-14T08:00:00.000Z"
    },
    "bmr": 1769,
    "tdee": 2742,
    "calorieTarget": 2342
  }
}
```

### POST /api/logs/food

Logs food intake. If `calories` is missing but macros are present, calories are estimated from macros.

Required fields:

- `userId`
- `name`

Example:

```bash
curl -X POST http://localhost:3000/api/logs/food \
  -H "content-type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "name": "Chicken rice",
    "quantity": "1 plate",
    "proteinG": 35,
    "carbsG": 55,
    "fatG": 12,
    "mealType": "lunch"
  }'
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "demo",
    "name": "Chicken rice",
    "quantity": "1 plate",
    "proteinG": 35,
    "carbsG": 55,
    "fatG": 12,
    "mealType": "lunch",
    "loggedAt": "2026-05-14T08:10:00.000Z",
    "calories": 468
  }
}
```

### POST /api/logs/exercise

Logs exercise. If `caloriesBurned` is missing, calories are estimated from `durationMinutes` and `intensity`.

Required fields:

- `userId`
- `name`
- `durationMinutes`

Example:

```bash
curl -X POST http://localhost:3000/api/logs/exercise \
  -H "content-type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "name": "Strength training",
    "durationMinutes": 45,
    "intensity": "moderate"
  }'
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "demo",
    "name": "Strength training",
    "durationMinutes": 45,
    "intensity": "moderate",
    "loggedAt": "2026-05-14T08:20:00.000Z",
    "caloriesBurned": 315
  }
}
```

### POST /api/logs/weight

Logs body weight.

Required fields:

- `userId`
- `weightKg`

Example:

```bash
curl -X POST http://localhost:3000/api/logs/weight \
  -H "content-type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "weightKg": 81.6
  }'
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "demo",
    "weightKg": 81.6,
    "loggedAt": "2026-05-14T08:30:00.000Z"
  }
}
```

### GET /api/dashboard/summary

Returns daily totals and a coaching recommendation.

Query parameters:

- `userId`: required string.
- `date`: optional `yyyy-mm-dd`; defaults to today's server date.

Example:

```bash
curl "http://localhost:3000/api/dashboard/summary?userId=demo&date=2026-05-14" \
  -H "x-api-key: your-api-key"
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "demo",
    "date": "2026-05-14",
    "totals": {
      "caloriesIn": 468,
      "caloriesOut": 315,
      "proteinG": 35,
      "carbsG": 55,
      "fatG": 12
    },
    "latestWeightKg": 81.6,
    "bmr": 1769,
    "tdee": 2742,
    "calorieTarget": 2342,
    "recommendation": "You are about 2189 kcal under target. Prioritize protein and a balanced meal."
  }
}
```

## OpenAPI

The GPT Actions schema lives in:

```txt
openapi.yaml
```

Update the schema whenever endpoint behavior, request shape, response shape, or authentication behavior changes.

