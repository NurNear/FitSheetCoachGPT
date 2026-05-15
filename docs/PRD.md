# Product Requirements Document

## Product Name

FitSheet Coach GPT

## Purpose

FitSheet Coach GPT is middleware for a Custom GPT personal trainer. It receives structured health and fitness logs from GPT Actions, validates and normalizes the data, stores it in a deployment-friendly backend, and returns useful daily summaries for coaching.

## Problem

Users can describe food, exercise, and weight updates naturally to a Custom GPT, but GPT Actions need a reliable API contract. The project bridges conversational input and persistent health tracking by providing a focused REST API with predictable validation, storage, and summary behavior.

## Target Users

- A person using a Custom GPT as a fitness and nutrition assistant.
- A developer configuring GPT Actions for personal health tracking.
- A maintainer deploying the API to Vercel with Upstash Redis.

## Goals

- Save profile metrics needed for BMR, TDEE, and calorie targets.
- Log food intake with optional macro-based calorie estimation.
- Log exercise with optional intensity-based calorie estimation.
- Log body weight over time.
- Return a daily dashboard summary for GPT coaching.
- Keep storage behind an abstraction while using Upstash Redis for persistent storage.
- Publish an OpenAPI schema compatible with GPT Actions.

## Non-Goals

- Medical diagnosis or clinical decision support.
- A full consumer mobile app.
- Payment, account management, or multi-tenant organization management.
- Replacing nutrition databases or wearable integrations.
- Rendering a production web dashboard in the current MVP.

## MVP Scope

- TypeScript Express API.
- Zod request validation.
- API key protection for non-health endpoints when `API_KEY` is set.
- Storage drivers for Upstash Redis and temporary memory storage.
- Endpoints for health, profile metrics, food logs, exercise logs, weight logs, and dashboard summary.
- OpenAPI 3.1 schema in `openapi.yaml`.
- Deployment docs for Vercel and Upstash Redis.

## User Stories

- As a GPT user, I want to save my profile metrics so the coach can calculate my calorie target.
- As a GPT user, I want to log meals without always knowing exact calories so the system can estimate from macros when possible.
- As a GPT user, I want to log workouts quickly so the system can estimate calories burned from duration and intensity.
- As a GPT user, I want to ask for today's summary so the coach can tell me what to do next.
- As a maintainer, I want one OpenAPI schema so I can connect the API to GPT Actions.
- As a maintainer, I want storage drivers to be swappable without rewriting routes.

## Success Metrics

- GPT Actions can call all documented endpoints successfully.
- Invalid requests return clear validation errors.
- Daily summary includes calories in, calories out, macros, latest weight, BMR, TDEE, calorie target, and a recommendation when data exists.
- Production deployment uses Upstash Redis without filesystem writes.
- Local smoke testing can use temporary memory storage when persistence is not needed.

## Risks

- Health data is sensitive and must be protected by environment management and API key usage.
- Food calorie estimates are approximate and should be treated as coaching support, not medical truth.
- Local memory storage is non-durable and should not be used for production.
- OpenAPI drift can break GPT Actions if endpoint behavior changes without schema updates.
