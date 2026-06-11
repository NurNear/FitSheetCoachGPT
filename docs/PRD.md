# Product Requirements Document

## Product Name

FitSheet Coach

## Purpose

FitSheet Coach is a Custom GPT-mediated personal health tracker. The user sends Thai/English text and images to a Custom GPT in ChatGPT, the Custom GPT analyzes the input and proposes structured log candidates, and this backend stores records only after the user explicitly confirms through GPT Actions.

## Problem

Users need a fast way to describe meals, workouts, weight updates, and goals naturally, including with food or activity photos, without manually filling every structured field. The project uses Custom GPT as the natural-language and image input surface, then uses the backend as a validated persistence and dashboard API.

## Target Users

- A person using an AI-assisted fitness and nutrition coach.
- A developer building or maintaining the Custom GPT Actions schema, backend API, and storage API.
- A maintainer deploying the API to Vercel with Upstash Redis.

## Goals

- Accept Thai or English text and image input through Custom GPT in ChatGPT.
- Let Custom GPT analyze input and call backend GPT Actions with structured candidates.
- Infer likely profile, food, exercise, and weight log candidates.
- Ask clarifying questions when input is incomplete or confidence is low.
- Provide coaching advice before and after confirmed saves.
- Save records only after explicit user confirmation.
- Detect behavior patterns from submitted inputs and stored history.
- Keep storage behind an abstraction while using Upstash Redis for persistent storage.
- Maintain an OpenAPI schema for implemented backend endpoints.

## Non-Goals

- Medical diagnosis or clinical decision support.
- A full consumer mobile app.
- Payment, account management, or multi-tenant organization management.
- Replacing nutrition databases or wearable integrations.
- Native mobile apps.
- Hidden behavior tracking outside submitted inputs and stored records.
- Automatic save without user confirmation in v1.

## MVP Scope

- TypeScript Express API.
- Zod request validation.
- API key protection for non-health endpoints when `API_KEY` is set.
- Storage drivers for Upstash Redis and temporary memory storage.
- Endpoints for health, profile metrics, food logs, exercise logs, weight logs, and dashboard summary.
- Requirement specification for a Custom GPT input and confirmation experience.
- GPT Actions-compatible backend endpoints for confirmed persistence and dashboard reads.
- Full OpenAPI 3.1 backend schema in `openapi.yaml`.
- Restricted GPT Actions schema in `custom-gpt-actions.yaml`.
- Deployment docs for Vercel and Upstash Redis.

## User Stories

- As a user, I want to send a meal photo or meal description without calculating calories so the coach can estimate them for review.
- As a user, I want to describe workouts naturally so the coach can infer duration, intensity, and calories when possible.
- As a user, I want to review and edit AI-proposed logs before anything is saved.
- As a user, I want the coach to detect patterns in my submitted history and give practical next-step advice.
- As a maintainer, I want the backend to avoid requiring an OpenAI API key for the primary flow because ChatGPT/Custom GPT provides the AI interface.
- As a maintainer, I want a full backend schema and a restricted schema containing only approved GPT Actions.
- As a maintainer, I want storage drivers to be swappable without rewriting routes.

## Success Metrics

- The Custom GPT can accept text and image input and produce structured log candidates, confidence notes, and coaching guidance.
- Food candidates include explicit or automatically estimated calories even when the user did not provide a calorie value.
- The Custom GPT can call backend GPT Actions with confirmed candidates.
- Confirmed candidates save profile, food, exercise, or weight data through existing storage services.
- Invalid requests return clear validation errors.
- Daily summary includes calories in, calories out, macros, latest weight, BMR, TDEE, calorie target, and a recommendation when data exists.
- Users can retrieve the confirmed food items behind a day's aggregate calorie total.
- Production deployment uses Upstash Redis without filesystem writes.
- Local smoke testing can use temporary memory storage when persistence is not needed.

## Risks

- Health data is sensitive and must be protected by environment management and API key usage.
- Food calorie estimates are approximate and should be treated as coaching support, not medical truth.
- Local memory storage is non-durable and should not be used for production.
- Custom GPT output can be approximate, so the user must confirm before saving records.
- Behavior detection must be based only on submitted inputs and stored health records.
- OpenAPI drift can break the implemented backend contract if endpoint behavior changes without schema updates.
- The backend API key must not be exposed outside the Custom GPT Actions configuration or trusted clients.
