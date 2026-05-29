# UI Specification

## Status

FitSheet Coach is an AI coach-mediated tracker. No production browser UI is implemented yet, but the active UI requirement is a simple Express-served frontend that sends text and image input to backend coach endpoints. The frontend must not call OpenAI directly.

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
-> Frontend coach input
-> POST /api/coach/analyze
-> AI coaching response + structured log candidates
-> User reviews, edits, and confirms
-> POST /api/coach/confirm
-> Existing profile/log storage
-> Dashboard summary
```

## Pages

### 1. Coach Input

Purpose: Let users submit Thai or English text and optional images for AI analysis.

Endpoint:

```txt
POST /api/coach/analyze
```

Inputs:

- User ID.
- Free-text message.
- Optional image upload or image reference.
- Optional context date.

Components:

- User ID selector or persisted user setting.
- Multiline message input.
- Image upload control with preview and remove action.
- Date picker.
- Submit button.
- Loading state.
- Error state.

Behavior:

- Send input to the backend coach endpoint.
- Do not send images or OpenAI credentials directly from the frontend to OpenAI.
- If the coach needs more information, show the follow-up question instead of a save button.

### 2. AI Review and Confirmation

Purpose: Let users inspect AI-proposed records before saving.

Endpoint:

```txt
POST /api/coach/confirm
```

Content:

- Coaching message.
- One or more structured log candidates.
- Candidate type: profile, food, exercise, or weight.
- Confidence notes and assumptions.
- Editable fields for candidate corrections.

Components:

- Candidate cards.
- Edit controls matching existing validation rules.
- Confirm button.
- Reject or discard button.
- Follow-up question panel.
- Save success and validation error states.

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

Future endpoint:

```txt
GET /api/coach/behavior?userId=<userId>
```

Insights may include:

- Repeated low-protein days.
- Missed workout patterns.
- Consistent calorie surplus or deficit.
- Weight trend changes.
- Frequently incomplete logs that need follow-up questions.

Privacy rules:

- Do not infer behavior from hidden tracking.
- Do not use browser activity outside submitted app input.
- Show the evidence source for each insight when possible.

### 5. Manual Correction

Purpose: Let users correct confirmed data when AI interpretation was wrong.

Content:

- Recent confirmed food logs.
- Recent confirmed exercise logs.
- Weight history.
- Normalized calorie values.
- Timestamps.

Future API needs:

- Read endpoints for raw food logs.
- Read endpoints for raw exercise logs.
- Read endpoints for weight history.
- Update or delete endpoints if correction is supported.

## Global Components

- API status indicator from `GET /health`.
- User ID selector or persisted user setting.
- Date picker.
- Toast notifications for analyze, confirm, save success, and validation errors.
- Error panel for unauthorized, AI analysis, upload, and server errors.
- Loading indicators for network requests.

## Accessibility

- All inputs need visible labels.
- Error messages should be associated with fields.
- Numeric inputs should include units in labels.
- Keyboard navigation must work for all forms and candidate actions.
- Color must not be the only signal for validation state, confidence, or save status.

## Security and Privacy

- Keep `OPENAI_API_KEY` and API keys server-side only.
- Do not expose server-only keys in client-side code.
- Avoid storing sensitive health data or image payloads in browser local storage unless intentionally designed.
- Production UI should use a server-side proxy or authenticated session model.
- Images should be uploaded only for analysis that the user explicitly initiates.
