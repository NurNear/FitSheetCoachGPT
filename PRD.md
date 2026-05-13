# Project: FitSheet Coach GPT

## Vision

สร้างระบบ AI Personal Trainer + Health Tracker ที่เชื่อมต่อกับ Custom GPT ผ่าน Middleware API

Architecture:

User
→ Custom GPT
→ Middleware API
→ Google Sheets
→ Dashboard

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
- Google Sheets API

## Deployment

- Vercel or Render

## Storage

- Google Sheets

## API Style

- REST API
- JSON only
- OpenAPI 3.1

---

# Project Goals

1. GPT สามารถเรียก API ได้ผ่าน GPT Actions
2. Middleware API validate และ normalize data
3. Backend เขียนข้อมูลลง Google Sheets
4. มี business logic สำหรับ calories/BMR/TDEE
5. มี dashboard endpoint
6. Future-proof สำหรับ migration ไป database จริง

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
  openapi/
  app.ts
  server.ts

tests/

.env.example
README.md
openapi.yaml