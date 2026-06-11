# UI Specification

## Status

FitSheet Coach is a Custom GPT-mediated tracker. The active input requirement is a Custom GPT in ChatGPT: users submit Thai/English text and images there, review the GPT's interpretation in the conversation, and the GPT calls the backend through GPT Actions after explicit confirmation.

## UX Principles

- Prioritize fast natural input over long structured forms.
- Show AI interpretation clearly before saving anything.
- Require explicit user confirmation before persistence.
- Treat health data and image uploads as sensitive.
- Make AI uncertainty visible and ask follow-up questions when needed.
- Keep behavior insights based only on submitted inputs and stored logs.

## Primary Workflow

```txt
User text/image
-> Custom GPT in ChatGPT
-> GPT analyzes and proposes structured log candidates
-> User reviews, edits, and confirms in ChatGPT
-> POST /api/coach/confirm
-> Existing profile/log storage
-> Dashboard summary
```

## Pages

### 1. Custom GPT Input

Purpose: Let users submit Thai or English text and optional images in ChatGPT for AI analysis.

Primary surface:

```txt
Custom GPT conversation
```

Inputs:

- Fixed owner ID configured in the Custom GPT instructions and backend environment.
- Free-text message.
- Optional image upload in ChatGPT.
- Optional context date.

Components:

- Custom GPT instructions for extracting profile, food, exercise, and weight candidates.
- Follow-up question behavior when input is incomplete.
- GPT Actions configuration using `openapi.yaml`.

Behavior:

- Keep image analysis inside ChatGPT.
- Do not send raw images to the backend unless a future endpoint explicitly requires it.
- Estimate food calories from either text or images when the user does not provide them.
- Use stated quantities and ingredients when available; otherwise use visible portions or common serving sizes and disclose the assumption.
- Do not ask the user to calculate calories. Ask about food identity or serving size only when the input is too ambiguous for a responsible estimate.
- If the coach needs more information, ask a follow-up question before calling a save action.

### 2. AI Review and Confirmation

Purpose: Let users inspect Custom GPT-proposed records before saving.

Endpoint:

```txt
POST /api/coach/confirm
```

Content:

- Coaching message in ChatGPT.
- One or more structured log candidates.
- Candidate type: profile, food, exercise, or weight.
- Confidence notes and assumptions.
- An approximate calorie value and, when useful, a conversational uncertainty range for each food candidate.
- Editable fields for candidate corrections.

Components:

- Conversational candidate summary.
- User correction prompts matching existing validation rules.
- Explicit confirmation phrase before calling the backend.
- Reject or discard option.
- Save success and validation error responses from GPT Actions.

Behavior:

- Never auto-save from analysis alone.
- Save only the candidate the user confirms.
- Route confirmed records through existing backend persistence services or endpoints.

### 3. Dashboard

Purpose: Show today's nutrition, exercise, weight, coaching recommendation, and confirmed-data summary.

Primary data source:

```txt
GET /api/dashboard/summary?userId=<userId>&date=<yyyy-mm-dd>
```

Detailed conversational summaries use:

```txt
GET /api/coach/summary?userId=<userId>&scope=today&date=<yyyy-mm-dd>
GET /api/coach/summary?userId=<userId>&scope=range&startDate=<yyyy-mm-dd>&endDate=<yyyy-mm-dd>
GET /api/coach/summary?userId=<userId>&scope=all
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
- Empty state asking the user to submit profile metrics when no profile exists.

Components:

- Date picker.
- Summary metric tiles.
- Macro breakdown.
- Recommendation panel.
- Loading state.
- Error state.

### 4. Behavior Insights

Purpose: Help the coach point out patterns from submitted and stored user data.

Endpoint:

```txt
GET /api/coach/behavior?userId=<userId>&endDate=<yyyy-mm-dd>
```

Structured insights include:

- Repeated low-protein days.
- Recorded exercise frequency.
- Consistent calorie surplus or deficit.
- Weight trend changes.
- Frequently incomplete logs that need follow-up questions.

Privacy rules:

- Do not infer behavior from hidden tracking.
- Do not use browser activity outside submitted app input.
- Show the evidence source for each insight when possible.
- Treat missing coverage as unknown, not as zero intake or missed exercise.

### 5. Manual Correction

Purpose: Let users correct confirmed data when AI interpretation was wrong.

Content:

- Recent confirmed food logs.
- Recent confirmed exercise logs.
- Weight history.
- Normalized calorie values.
- Timestamps.

Future API needs:

- `GET /api/logs/food` provides read-only daily food records.
- Read endpoints for raw exercise logs.
- Read endpoints for weight history.
- Update or delete endpoints if correction is supported.

## Global Components

- API status indicator from `GET /health`.
- Fixed owner identity; do not expose a user ID selector in the personal MVP.
- Date picker.
- Toast notifications for confirm, save success, and validation errors.
- Error panel for unauthorized, forbidden, upload, and server errors.
- Loading indicators for network requests.

## Accessibility

- All inputs need visible labels.
- Error messages should be associated with fields.
- Numeric inputs should include units in labels.
- Keyboard navigation must work for all forms and candidate actions.
- Color must not be the only signal for validation state, confidence, or save status.

## Security and Privacy

- Keep backend `API_KEY` restricted to trusted GPT Actions configuration and trusted clients.
- Do not expose backend keys in public client-side code.
- Avoid storing sensitive health data or image payloads in browser local storage unless intentionally designed.
- Images should be analyzed only when the user explicitly sends them to Custom GPT.
