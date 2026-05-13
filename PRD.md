# Project: FitSheet Coach GPT

## Vision

สร้างระบบ AI Personal Trainer + Health Tracker ที่เชื่อมต่อกับ Custom GPT ผ่าน Middleware API

Architecture:

```txt
User
→ Custom GPT
→ Middleware API
→ JSON file storage
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
- JSON file storage

## Deployment

- Render หรือ long-running Node server สำหรับ JSON file storage
- Vercel ใช้ได้สำหรับ API แต่ไม่ควรใช้ JSON file storage เป็น production storage เพราะ filesystem ไม่ durable

## Storage

- Default: JSON file storage
- Optional future migration: NoSQL backend เช่น Vercel KV, Upstash Redis, MongoDB Atlas, Firestore, หรือ Supabase

## API Style

- REST API
- JSON only
- OpenAPI 3.1

---

# Project Goals

1. GPT สามารถเรียก API ได้ผ่าน GPT Actions
2. Middleware API validate และ normalize data
3. Backend เขียนข้อมูลลง JSON file ผ่าน storage abstraction
4. มี business logic สำหรับ calories/BMR/TDEE
5. มี dashboard endpoint
6. Future-proof สำหรับ migration ไป NoSQL/database จริง

---

# Folder Structure

```txt
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
```
