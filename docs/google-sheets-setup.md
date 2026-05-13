# Google Sheets Setup

Use this guide to connect the API to the Google Sheet storage backend.

## 1. Spreadsheet

The project data spreadsheet has already been created:

```txt
https://docs.google.com/spreadsheets/d/1u8-jhWnVB_xLjOeboR-HkEj8gh9umYYC0cNSDRtrqFQ/edit
```

Use this value in `.env`:

```env
GOOGLE_SHEET_ID=1u8-jhWnVB_xLjOeboR-HkEj8gh9umYYC0cNSDRtrqFQ
```

Required tabs:

- `Profile`
- `FoodLog`
- `ExerciseLog`
- `WeightLog`

## 2. Create a Google Cloud Project

1. Open Google Cloud Console.
2. Create a new project, for example `FitSheet Coach GPT`.
3. Enable the `Google Sheets API` for the project.

## 3. Create a Service Account

1. Go to `IAM & Admin` > `Service Accounts`.
2. Click `Create service account`.
3. Name it `fitsheet-coach-api`.
4. Create the account.
5. Open the service account.
6. Go to `Keys`.
7. Click `Add key` > `Create new key`.
8. Choose `JSON`.
9. Download the JSON file.

The JSON contains values like:

```json
{
  "client_email": "fitsheet-coach-api@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

## 4. Share the Spreadsheet

Open the spreadsheet and share it with the service account email:

```txt
fitsheet-coach-api@your-project.iam.gserviceaccount.com
```

Give it `Editor` permission.

## 5. Local Environment

Copy the env example:

```bash
cp .env.example .env
```

Fill in:

```env
GOOGLE_SHEET_ID=1u8-jhWnVB_xLjOeboR-HkEj8gh9umYYC0cNSDRtrqFQ
GOOGLE_SERVICE_ACCOUNT_EMAIL=fitsheet-coach-api@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Keep the `\n` sequences in the private key. The API converts them to real newlines at runtime.

## 6. Verify Locally

Start the API:

```bash
npm run dev
```

Save profile metrics:

```bash
curl -X POST http://localhost:3000/api/profile/metrics \
  -H "Content-Type: application/json" \
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
curl -X POST http://localhost:3000/api/logs/food \
  -H "Content-Type: application/json" \
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

Get dashboard summary:

```bash
curl "http://localhost:3000/api/dashboard/summary?userId=demo"
```

If the setup is correct, new rows will appear in the spreadsheet tabs.
