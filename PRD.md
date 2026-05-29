# Project: FitSheet Coach

## Vision

สร้างระบบ AI Coach + Health Tracker ที่รับข้อความหรือรูปจากหน้า Frontend ให้ Backend Coach API เรียก OpenAI วิเคราะห์ แล้วรอผู้ใช้ยืนยันก่อนบันทึกข้อมูล

Architecture:

```txt
User
→ Frontend
→ Backend Coach API
→ OpenAI
→ Backend Storage API
→ Upstash Redis
→ Dashboard summary
```

ระบบต้องรองรับ:

- Food logging
- Exercise logging
- Weight tracking
- Text and image input
- OpenAI analysis
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
- OpenAI API
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
- Planned image upload or image reference support for coach analysis
- OpenAPI 3.1

---

# Project Goals

1. ผู้ใช้สามารถกรอกข้อมูลสุขภาพผ่านหน้า Frontend
2. Backend Coach API วิเคราะห์ข้อความ/รูปด้วย OpenAI โดยเก็บ API key ไว้ฝั่ง server
3. AI เสนอ structured log candidate และคำแนะนำก่อนบันทึก
4. ผู้ใช้ต้องยืนยันก่อน Backend จึงบันทึกลง Upstash Redis ผ่าน storage abstraction
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
vercel.json
```
