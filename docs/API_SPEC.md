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

Local development may omit `API_KEY` and `OWNER_USER_ID`. Production startup requires both values, and every protected request must use the configured owner ID.

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

Owner mismatches use:

```json
{
  "ok": false,
  "error": "Forbidden",
  "message": "The requested userId is not allowed."
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

Optional smart-scale fields:

- `bmi`
- `bodyFatPercent`
- `fatMassKg`
- `changeFromPreviousKg`
- `previousMeasurementDate`
- `assessment`
- `loggedAt`, as an ISO 8601 datetime with `Z` or a timezone offset

Example:

```bash
curl -X POST http://localhost:3000/api/logs/weight \
  -H "content-type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "userId": "demo",
    "weightKg": 76.8,
    "bmi": 26.9,
    "bodyFatPercent": 25.1,
    "fatMassKg": 19.3,
    "changeFromPreviousKg": -1.2,
    "previousMeasurementDate": "2026-06-10",
    "assessment": "The app classified the displayed metrics as obese.",
    "loggedAt": "2026-06-11T07:33:47+07:00"
  }'
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "demo",
    "weightKg": 76.8,
    "bmi": 26.9,
    "bodyFatPercent": 25.1,
    "fatMassKg": 19.3,
    "changeFromPreviousKg": -1.2,
    "previousMeasurementDate": "2026-06-10",
    "assessment": "The app classified the displayed metrics as obese.",
    "loggedAt": "2026-06-11T00:33:47.000Z"
  }
}
```

### GET /api/logs/food

Returns confirmed food records for one calendar date in chronological order.

Query parameters:

- `userId`: required string.
- `date`: optional `yyyy-mm-dd`; defaults to today's server date.

Example:

```bash
curl "http://localhost:3000/api/logs/food?userId=demo&date=2026-06-11" \
  -H "x-api-key: your-api-key"
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "demo",
    "date": "2026-06-11",
    "foods": [
      {
        "userId": "demo",
        "name": "Chicken rice",
        "quantity": "1 plate",
        "calories": 650,
        "mealType": "lunch",
        "loggedAt": "2026-06-11T05:00:00.000Z"
      }
    ]
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

The implemented backend API contract lives in:

```txt
openapi.yaml
```

The restricted schema imported into Custom GPT lives in:

```txt
custom-gpt-actions.yaml
```

Update both schemas when an Actions endpoint changes. Direct profile and log write endpoints stay in the full backend contract only.

## Custom GPT Actions API Foundation

Custom GPT analyzes text and images inside ChatGPT. The backend accepts only structured confirmed candidates and read requests; it does not receive raw images or require `OPENAI_API_KEY`.

For food input, Custom GPT estimates calories when the user does not provide them. It sends one central estimate in `candidate.data.calories`, records important portion and ingredient assumptions in candidate metadata, and shows the estimate to the user before confirmation. Direct backend food-log clients may still omit calories when macros are available for server-side normalization.

When the user asks which foods were logged, Custom GPT calls `getDailyFoodLogs`. Dashboard summaries contain aggregate totals and must not be presented as item-level food history.

### GET /api/coach/summary

Returns one detailed report containing itemized food and exercise records, weight records, totals, averages, coverage, and structured analysis.

Query parameters:

- `userId`: required string.
- `scope`: required `today`, `range`, or `all`.
- `date`: user-local `yyyy-mm-dd` for `scope=today` or the current end date for `scope=all`.
- `startDate`: inclusive start for `scope=range`.
- `endDate`: inclusive end for `scope=range`.

`scope=all` starts at the first confirmed weight and ends on the current date. Missing calendar days are unknown and are not counted as zero intake or missed exercise.

Examples:

```txt
scope=today&date=2026-06-11
scope=range&startDate=2026-06-10&endDate=2026-06-11
scope=all&date=2026-06-11
```

### POST /api/coach/confirm

Persists one selected Custom GPT-proposed candidate after explicit user confirmation. Candidate data is validated against the same rules as existing profile and log endpoints.

Request fields:

- `userId`: required string.
- `candidate`: selected structured candidate.
- `edits`: optional audit metadata for user corrections. Send final corrected values in `candidate.data`.
- `confirm`: must be the literal value `true`.

Behavior:

- Reject requests without explicit confirmation.
- Reject a candidate whose nested `userId` differs from the top-level `userId`.
- Expect Custom GPT food candidates to include explicit or estimated calories.
- Save confirmed candidates through the existing normalization and storage services.
- Return the saved record and any post-save coaching message.

### GET /api/coach/behavior

Returns structured insights for the seven calendar days ending on optional `endDate`.

- Response includes `period`, data `coverage`, and five insight categories.
- Protein evaluation uses `1.2 g/kg` as a coaching reference only when protein fields are complete.
- Calorie balance uses the profile target and a `+/-300 kcal` reference range only on calorie-complete food days.
- Exercise reports recorded frequency and duration without treating missing days as missed workouts.
- Weight trend requires at least two weight records in the period.
- Missing or incomplete data returns `insufficient_data` rather than an inferred behavior.

### Owner Binding

When `OWNER_USER_ID` is configured, every protected request must use that exact `userId`. A different ID returns `403 Forbidden`. Production startup also requires `API_KEY`.
