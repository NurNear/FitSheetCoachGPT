# Project: FitSheet Coach

## Vision

สร้างระบบ Custom GPT + Health Tracker ที่ให้ผู้ใช้ส่งข้อความหรือรูปผ่าน Custom GPT ใน ChatGPT จากนั้น Custom GPT วิเคราะห์และเรียก Backend API ผ่าน GPT Actions เพื่อบันทึกข้อมูลหลังผู้ใช้ยืนยัน

Architecture:

```txt
User
→ Custom GPT ใน ChatGPT
→ GPT Actions
→ Backend API
→ Backend Storage API
→ Upstash Redis
→ Dashboard summary
```

ระบบต้องรองรับ:

- Food logging
- Exercise logging
- Weight tracking
- Text and image input ผ่าน Custom GPT
- Custom GPT analysis
- Confirm-before-save workflow
- Calories estimation
- BMR/TDEE calculation
- Personal trainer recommendation
- Behavior insight จากข้อมูลที่ผู้ใช้ส่งและประวัติที่บันทึกไว้
- Dashboard summary

---

# Tech Stack

## Backend

- Node.js
- TypeScript
- Express.js
- Zod
- Custom GPT Actions
- Upstash Redis

## Deployment

- Vercel Functions

## Storage

- Default production: Upstash Redis
- Local fallback: memory storage
- Future migration option: NoSQL backend อื่น เช่น MongoDB Atlas, Firestore, หรือ Supabase

## API Style

- REST API
- JSON for structured data
- GPT Actions schema สำหรับให้ Custom GPT ส่งข้อมูล structured ไปที่ backend
- OpenAPI 3.1

---

# Project Goals

1. ผู้ใช้สามารถส่งข้อมูลสุขภาพและรูปผ่าน Custom GPT ใน ChatGPT
2. Custom GPT วิเคราะห์ข้อความ/รูป และแปลงเป็น structured log candidate
3. Custom GPT ถามยืนยันหรือถามเพิ่มเมื่อข้อมูลไม่พอ
4. หลังผู้ใช้ยืนยัน Custom GPT เรียก Backend API ผ่าน GPT Actions เพื่อบันทึกลง Upstash Redis ผ่าน storage abstraction
5. มี business logic สำหรับ calories/BMR/TDEE และ behavior insight จากข้อมูลที่บันทึก
6. มี dashboard endpoint
7. Future-proof สำหรับ migration ไป NoSQL/database อื่น

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
custom-gpt-actions.yaml
vercel.json
```
