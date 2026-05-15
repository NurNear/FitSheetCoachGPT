# UI Specification

## Status

FitSheet Coach GPT is API-first. No production browser UI is implemented in the current MVP. This document defines the intended UI behavior for a future dashboard or companion app.

## UX Principles

- Prioritize fast logging over complex forms.
- Show calculated values clearly, with enough context to avoid overconfidence.
- Treat health data as sensitive.
- Match API validation rules exactly.
- Make corrections easy because GPT-parsed logs may be approximate.

## Pages

### 1. Dashboard

Purpose: Show today's nutrition, exercise, weight, and coaching recommendation.

Primary data source:

```txt
GET /api/dashboard/summary?userId=<userId>&date=<yyyy-mm-dd>
```

Content:

- Date selector.
- Calories in.
- Calories out.
- Net calories.
- Protein, carbs, and fat totals.
- Latest weight.
- BMR, TDEE, and calorie target when profile data exists.
- Recommendation text.
- Empty state asking the user to log profile metrics when no profile exists.

Components:

- Date picker.
- Summary metric tiles.
- Macro breakdown.
- Recommendation panel.
- Loading state.
- Error state.

Validations:

- `userId` is required.
- `date` must be `yyyy-mm-dd` if provided.

### 2. Profile Setup

Purpose: Capture profile metrics for BMR, TDEE, and calorie target calculations.

Endpoint:

```txt
POST /api/profile/metrics
```

Fields:

- User ID.
- Sex.
- Age.
- Height in centimeters.
- Weight in kilograms.
- Activity level.
- Goal.

Components:

- Text input for user ID.
- Segmented control or radio group for sex.
- Number inputs for age, height, and weight.
- Select menu for activity level.
- Select menu for goal.
- Submit button.
- Result summary for BMR, TDEE, and calorie target.

Validations:

- User ID is required.
- Age must be an integer from `10` to `120`.
- Height must be greater than `0` and no more than `260`.
- Weight must be greater than `0` and no more than `500`.
- Sex, activity level, and goal values must match API enums.

### 3. Food Log

Purpose: Let users manually add or correct food logs.

Endpoint:

```txt
POST /api/logs/food
```

Fields:

- User ID.
- Food name.
- Quantity.
- Calories.
- Protein grams.
- Carbs grams.
- Fat grams.
- Meal type.
- Logged time.

Components:

- Text input for food name.
- Text input for quantity.
- Number inputs for calories and macros.
- Meal type select.
- Optional datetime input.
- Submit button.
- Preview of estimated calories when macros are entered.

Validations:

- User ID is required.
- Food name is required.
- Calories and macro fields must be non-negative.
- Meal type must be `breakfast`, `lunch`, `dinner`, or `snack`.
- Logged time must be a valid ISO datetime if supplied.

### 4. Exercise Log

Purpose: Let users manually add or correct exercise logs.

Endpoint:

```txt
POST /api/logs/exercise
```

Fields:

- User ID.
- Exercise name.
- Duration in minutes.
- Calories burned.
- Intensity.
- Logged time.

Components:

- Text input for exercise name.
- Number input for duration.
- Number input for calories burned.
- Intensity segmented control.
- Optional datetime input.
- Submit button.
- Preview of estimated calories burned when duration and intensity are entered.

Validations:

- User ID is required.
- Exercise name is required.
- Duration must be greater than `0` and no more than `1440`.
- Calories burned must be non-negative.
- Intensity must be `low`, `moderate`, or `high`.
- Logged time must be a valid ISO datetime if supplied.

### 5. Weight Log

Purpose: Let users add body weight entries.

Endpoint:

```txt
POST /api/logs/weight
```

Fields:

- User ID.
- Weight in kilograms.
- Logged time.

Components:

- Number input for weight.
- Optional datetime input.
- Submit button.
- Latest weight display.

Validations:

- User ID is required.
- Weight must be greater than `0` and no more than `500`.
- Logged time must be a valid ISO datetime if supplied.

### 6. Log Review

Purpose: Let users inspect recent logs and catch GPT parsing mistakes.

Content:

- Food logs by date.
- Exercise logs by date.
- Weight history.
- Normalized calorie values.
- Timestamps.

Components:

- Date selector.
- Tables or compact lists.
- Empty states.
- Correction entry points.

Future API needs:

- Read endpoints for raw food logs.
- Read endpoints for raw exercise logs.
- Read endpoints for weight history.
- Update or delete endpoints if correction is supported.

## Global Components

- API status indicator from `GET /health`.
- User ID selector or persisted user setting.
- Date picker.
- Toast notifications for save success and validation errors.
- Error panel for unauthorized and server errors.
- Loading indicators for network requests.

## Accessibility

- All inputs need visible labels.
- Error messages should be associated with fields.
- Numeric inputs should include units in labels.
- Keyboard navigation must work for all forms.
- Color must not be the only signal for validation state.

## Security and Privacy

- Do not expose API keys in client-side code unless the UI is private and protected by another server layer.
- Avoid storing sensitive health data in browser local storage unless intentionally designed.
- Production UI should use a server-side proxy or authenticated session model.

