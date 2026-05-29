# Product Requirements Document

## Product Name

FitSheet Coach

## Purpose

FitSheet Coach is an AI coach-mediated personal health tracker. It receives user text and image input from a frontend, sends that input to a backend coach layer for OpenAI analysis, returns structured log candidates and coaching guidance, and only saves health records after the user explicitly confirms.

## Problem

Users need a fast way to describe meals, workouts, weight updates, and goals naturally, including with food or activity photos, without manually filling every structured field. The project bridges natural input and persistent health tracking through an AI coach flow that analyzes text/images, asks follow-up questions when needed, proposes structured records, gives coaching advice, and waits for confirmation before storing data.

## Target Users

- A person using an AI-assisted fitness and nutrition coach.
- A developer building or maintaining the frontend, backend coach API, and storage API.
- A maintainer deploying the API to Vercel with Upstash Redis.

## Goals

- Accept Thai or English text and image input from the frontend.
- Analyze user input with OpenAI through a server-side coach layer.
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
- Requirement specification for an AI coach input experience.
- Planned backend-mediated OpenAI coach endpoints for analyze and confirm flows.
- OpenAPI 3.1 schema in `openapi.yaml`.
- Deployment docs for Vercel and Upstash Redis.

## User Stories

- As a user, I want to send a meal photo or meal description so the coach can estimate what should be logged.
- As a user, I want to describe workouts naturally so the coach can infer duration, intensity, and calories when possible.
- As a user, I want to review and edit AI-proposed logs before anything is saved.
- As a user, I want the coach to detect patterns in my submitted history and give practical next-step advice.
- As a maintainer, I want OpenAI calls to stay server-side so credentials are never exposed to the frontend.
- As a maintainer, I want one schema for implemented backend endpoints and separate docs for planned coach endpoints.
- As a maintainer, I want storage drivers to be swappable without rewriting routes.

## Success Metrics

- The frontend can send text and image input to a backend coach flow.
- The coach flow returns structured log candidates, confidence notes, and coaching guidance.
- Confirmed candidates save profile, food, exercise, or weight data through existing storage services.
- Invalid requests return clear validation errors.
- Daily summary includes calories in, calories out, macros, latest weight, BMR, TDEE, calorie target, and a recommendation when data exists.
- Production deployment uses Upstash Redis without filesystem writes.
- Local smoke testing can use temporary memory storage when persistence is not needed.

## Risks

- Health data is sensitive and must be protected by environment management and API key usage.
- Food calorie estimates are approximate and should be treated as coaching support, not medical truth.
- Local memory storage is non-durable and should not be used for production.
- OpenAI output can be approximate, so the user must confirm before saving records.
- Behavior detection must be based only on submitted inputs and stored health records.
- OpenAPI drift can break the implemented backend contract if endpoint behavior changes without schema updates.
- A browser frontend must avoid exposing server-only API keys, including `OPENAI_API_KEY`, or sensitive data in client-side storage.
