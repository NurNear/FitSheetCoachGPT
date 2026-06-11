#!/usr/bin/env bash

set -euo pipefail

required_vars=(BASE_URL API_KEY OWNER_USER_ID)
for name in "${required_vars[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    printf 'Missing required environment variable: %s\n' "$name" >&2
    exit 1
  fi
done

for command_name in curl jq; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  fi
done

BASE_URL="${BASE_URL%/}"
TODAY_UTC="${SMOKE_TEST_DATE:-$(date -u +%F)}"
OTHER_USER_ID="${SMOKE_TEST_OTHER_USER_ID:-smoke-test-not-owner}"
RESPONSE_BODY="$(mktemp)"
trap 'rm -f "$RESPONSE_BODY"' EXIT

request() {
  local expected_status="$1"
  local label="$2"
  shift 2

  local actual_status
  actual_status="$(curl --silent --show-error --output "$RESPONSE_BODY" --write-out '%{http_code}' "$@")"

  if [[ "$actual_status" != "$expected_status" ]]; then
    printf 'FAIL: %s (expected %s, got %s)\n' "$label" "$expected_status" "$actual_status" >&2
    cat "$RESPONSE_BODY" >&2
    printf '\n' >&2
    exit 1
  fi

  printf 'PASS: %s (%s)\n' "$label" "$actual_status"
}

assert_json() {
  local expression="$1"
  local label="$2"

  if ! jq -e "$expression" "$RESPONSE_BODY" >/dev/null; then
    printf 'FAIL: %s returned an unexpected response\n' "$label" >&2
    cat "$RESPONSE_BODY" >&2
    printf '\n' >&2
    exit 1
  fi
}

confirm_payload() {
  local candidate_type="$1"
  local candidate_data="$2"
  local confirmed="$3"

  jq -nc \
    --arg userId "$OWNER_USER_ID" \
    --arg type "$candidate_type" \
    --argjson data "$candidate_data" \
    --argjson confirm "$confirmed" \
    '{userId: $userId, candidate: {type: $type, data: $data}, confirm: $confirm}'
}

auth_headers=(-H "content-type: application/json" -H "x-api-key: ${API_KEY}")

request 200 "public health check" "${BASE_URL}/health"
assert_json '.ok == true and .data.status == "healthy"' "public health check"

request 401 "missing API key" \
  --get \
  --data-urlencode "userId=${OWNER_USER_ID}" \
  --data-urlencode "date=${TODAY_UTC}" \
  "${BASE_URL}/api/dashboard/summary"
assert_json '.ok == false and .error == "Unauthorized"' "missing API key"

request 401 "invalid API key" \
  --get \
  -H "x-api-key: invalid-smoke-test-key" \
  --data-urlencode "userId=${OWNER_USER_ID}" \
  --data-urlencode "date=${TODAY_UTC}" \
  "${BASE_URL}/api/dashboard/summary"
assert_json '.ok == false and .error == "Unauthorized"' "invalid API key"

request 403 "owner binding" \
  --get \
  -H "x-api-key: ${API_KEY}" \
  --data-urlencode "userId=${OTHER_USER_ID}" \
  --data-urlencode "date=${TODAY_UTC}" \
  "${BASE_URL}/api/dashboard/summary"
assert_json '.ok == false and .error == "Forbidden"' "owner binding"

weight_data="$(jq -nc --arg userId "$OWNER_USER_ID" '{userId: $userId, weightKg: 75}')"
request 400 "confirmation required" \
  -X POST \
  "${auth_headers[@]}" \
  --data "$(confirm_payload weight "$weight_data" false)" \
  "${BASE_URL}/api/coach/confirm"
assert_json '.ok == false and .error == "ValidationError"' "confirmation required"

profile_data="$(
  jq -nc \
    --arg userId "$OWNER_USER_ID" \
    --arg loggedAt "${TODAY_UTC}T06:00:00.000Z" \
    '{
      userId: $userId,
      sex: "male",
      age: 35,
      heightCm: 175,
      weightKg: 75,
      activityLevel: "moderate",
      goal: "maintain",
      loggedAt: $loggedAt
    }'
)"
request 201 "confirmed profile" \
  -X POST \
  "${auth_headers[@]}" \
  --data "$(confirm_payload profile "$profile_data" true)" \
  "${BASE_URL}/api/coach/confirm"
assert_json '.ok == true and .data.saved.activityLevel == "moderate"' "confirmed profile"

food_data="$(
  jq -nc \
    --arg userId "$OWNER_USER_ID" \
    --arg loggedAt "${TODAY_UTC}T07:00:00.000Z" \
    '{
      userId: $userId,
      name: "Production smoke meal",
      proteinG: 30,
      carbsG: 50,
      fatG: 10,
      loggedAt: $loggedAt
    }'
)"
request 201 "confirmed food" \
  -X POST \
  "${auth_headers[@]}" \
  --data "$(confirm_payload food "$food_data" true)" \
  "${BASE_URL}/api/coach/confirm"
assert_json '.ok == true and .data.saved.calories == 410' "confirmed food"

exercise_data="$(
  jq -nc \
    --arg userId "$OWNER_USER_ID" \
    --arg loggedAt "${TODAY_UTC}T08:00:00.000Z" \
    '{
      userId: $userId,
      name: "Production smoke walk",
      durationMinutes: 30,
      intensity: "low",
      loggedAt: $loggedAt
    }'
)"
request 201 "confirmed exercise" \
  -X POST \
  "${auth_headers[@]}" \
  --data "$(confirm_payload exercise "$exercise_data" true)" \
  "${BASE_URL}/api/coach/confirm"
assert_json '.ok == true and .data.saved.caloriesBurned == 120' "confirmed exercise"

weight_data="$(
  jq -nc \
    --arg userId "$OWNER_USER_ID" \
    --arg loggedAt "${TODAY_UTC}T09:00:00+07:00" \
    '{
      userId: $userId,
      weightKg: 74.8,
      bmi: 24.4,
      bodyFatPercent: 20,
      fatMassKg: 15,
      changeFromPreviousKg: -0.2,
      assessment: "Production smoke body composition",
      loggedAt: $loggedAt
    }'
)"
request 201 "confirmed weight" \
  -X POST \
  "${auth_headers[@]}" \
  --data "$(confirm_payload weight "$weight_data" true)" \
  "${BASE_URL}/api/coach/confirm"
assert_json \
  '.ok == true and .data.saved.weightKg == 74.8 and .data.saved.bmi == 24.4 and (.data.saved.loggedAt | endswith("Z"))' \
  "confirmed weight"

request 200 "dashboard read-back" \
  --get \
  -H "x-api-key: ${API_KEY}" \
  --data-urlencode "userId=${OWNER_USER_ID}" \
  --data-urlencode "date=${TODAY_UTC}" \
  "${BASE_URL}/api/dashboard/summary"
assert_json \
  '.ok == true and .data.totals.caloriesIn >= 410 and .data.totals.caloriesOut >= 120 and .data.latestWeightKg == 74.8' \
  "dashboard read-back"

request 200 "daily food read-back" \
  --get \
  -H "x-api-key: ${API_KEY}" \
  --data-urlencode "userId=${OWNER_USER_ID}" \
  --data-urlencode "date=${TODAY_UTC}" \
  "${BASE_URL}/api/logs/food"
assert_json \
  ".ok == true and .data.date == \"${TODAY_UTC}\" and any(.data.foods[]; .name == \"Production smoke meal\")" \
  "daily food read-back"

request 200 "coach summary read-back" \
  --get \
  -H "x-api-key: ${API_KEY}" \
  --data-urlencode "userId=${OWNER_USER_ID}" \
  --data-urlencode "scope=today" \
  --data-urlencode "date=${TODAY_UTC}" \
  "${BASE_URL}/api/coach/summary"
assert_json \
  ".ok == true and .data.period.startDate == \"${TODAY_UTC}\" and any(.data.days[].foods[]; .name == \"Production smoke meal\") and any(.data.days[].exercises[]; .name == \"Production smoke walk\")" \
  "coach summary read-back"

request 200 "behavior read-back" \
  --get \
  -H "x-api-key: ${API_KEY}" \
  --data-urlencode "userId=${OWNER_USER_ID}" \
  --data-urlencode "endDate=${TODAY_UTC}" \
  "${BASE_URL}/api/coach/behavior"
assert_json \
  ".ok == true and .data.period.endDate == \"${TODAY_UTC}\" and .data.coverage.anyLoggedDays >= 1" \
  "behavior read-back"

printf 'Production smoke tests passed for %s\n' "$BASE_URL"
