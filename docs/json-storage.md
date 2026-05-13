# JSON File Storage

FitSheet Coach GPT can store data in a local JSON file for local development. Production on Vercel should use Upstash Redis instead.

## Environment

```env
STORAGE_DRIVER=json
DATA_FILE_PATH=./data/fitsheet.json
```

`STORAGE_DRIVER=json` persists data to disk.

`STORAGE_DRIVER=memory` keeps data in memory only and resets when the server restarts.

## File Shape

The JSON file is created automatically on first write.

```json
{
  "schemaVersion": 1,
  "profiles": [],
  "foods": [],
  "exercises": [],
  "weights": []
}
```

## Local Development

Run the API:

```bash
npm run dev
```

Then write data through the API. The file at `DATA_FILE_PATH` will be created automatically.

## Git Behavior

Runtime JSON data is ignored by git:

```txt
data/*.json
```

Do not commit personal health data or test user data.

## Deployment Note

JSON file storage is best for local development only. For Vercel deployment, use `STORAGE_DRIVER=upstash`.
