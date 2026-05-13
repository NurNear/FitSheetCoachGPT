# Project: FitSheet Coach GPT

## Vision

สร้างระบบ AI Personal Trainer + Health Tracker ที่เชื่อมต่อกับ Custom GPT ผ่าน Middleware API

Architecture:

```txt
User
→ Custom GPT
→ Middleware API
→ Upstash Redis
→ Dashboard summary
```

ระบบต้องรองรับ:

- Food logging
- Exercise logging
- Weight tracking
- Calories estimation
- BMR/TDEE calculation
- Personal trainer recommendation
- Dashboard summary

---

# Tech Stack

## Backend

- Node.js
- TypeScript
- Express.js
- Zod
- Upstash Redis

## Deployment

- Vercel Functions

## Storage

- Default production: Upstash Redis
- Local fallback: JSON file storage
- Future migration option: NoSQL backend อื่น เช่น MongoDB Atlas, Firestore, หรือ Supabase

## API Style

- REST API
- JSON only
- OpenAPI 3.1

---

# Project Goals

1. GPT สามารถเรียก API ได้ผ่าน GPT Actions
2. Middleware API validate และ normalize data
3. Backend เขียนข้อมูลลง Upstash Redis ผ่าน storage abstraction
4. มี business logic สำหรับ calories/BMR/TDEE
5. มี dashboard endpoint
6. Future-proof สำหรับ migration ไป NoSQL/database อื่น

---

# Folder Structure

```txt
api/
  index.ts

src/
  config/
  constants/
  middleware/
  routes/
  services/
  utils/
  validators/
  types/
  app.ts
  server.ts

tests/
docs/

.env.example
README.md
AGENTS.md
openapi.yaml
vercel.json
```
