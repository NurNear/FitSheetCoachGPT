# Render Deployment

This project is prepared for Render using `render.yaml`.

## Why Render

The app currently uses JSON file storage. Render can attach a persistent disk to a web service, which lets the JSON file survive deploys and restarts. Without a persistent disk, Render service files are ephemeral and runtime writes are lost after restarts.

## Important Cost Note

Persistent disks require a paid Render service. The blueprint uses:

```yaml
plan: starter
disk:
  mountPath: /var/data
  sizeGB: 5
```

## Blueprint

Render will read:

```txt
render.yaml
```

Main settings:

```yaml
buildCommand: npm install && npm run build
startCommand: npm start
healthCheckPath: /health
DATA_FILE_PATH: /var/data/fitsheet.json
```

The mounted disk path is:

```txt
/var/data
```

The JSON data file is:

```txt
/var/data/fitsheet.json
```

## Deploy Steps

1. Push the latest code to GitHub.
2. Open Render Dashboard.
3. Choose `New` > `Blueprint`.
4. Connect the GitHub repository.
5. Select the repo containing `render.yaml`.
6. Review the service settings.
7. Set `API_KEY` when prompted, or leave it empty only for private testing.
8. Apply the blueprint.
9. Wait for the first deploy to finish.
10. Open `/health` on the Render URL.

## Environment Variables

Render blueprint sets:

```env
NODE_ENV=production
STORAGE_DRIVER=json
DATA_FILE_PATH=/var/data/fitsheet.json
```

Set manually in Render:

```env
API_KEY=
```

If `API_KEY` is set, requests must include:

```txt
x-api-key: your-api-key
```

## Smoke Test

After deploy, replace `<render-url>` with your service URL:

```bash
curl https://<render-url>/health
```

Create a profile:

```bash
curl -X POST https://<render-url>/api/profile/metrics \
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

Get a summary:

```bash
curl -H "x-api-key: your-api-key" "https://<render-url>/api/dashboard/summary?userId=demo"
```

## After Deploy

After Render gives you the production URL, update `openapi.yaml`:

```yaml
servers:
  - url: https://your-render-service.onrender.com
```

Then import `openapi.yaml` into Custom GPT Actions.
