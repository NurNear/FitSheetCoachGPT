import { z } from "zod";
import {
  exerciseLogSchema,
  foodLogSchema,
  isoDateSchema,
  profileMetricsSchema,
  weightLogSchema
} from "./logValidators.js";

const candidateBaseSchema = z.object({
  confidence: z.number().min(0).max(1).optional(),
  assumptions: z.array(z.string()).optional()
});

export const coachCandidateSchema = z.discriminatedUnion("type", [
  candidateBaseSchema.extend({
    type: z.literal("profile"),
    data: profileMetricsSchema
  }),
  candidateBaseSchema.extend({
    type: z.literal("food"),
    data: foodLogSchema
  }),
  candidateBaseSchema.extend({
    type: z.literal("exercise"),
    data: exerciseLogSchema
  }),
  candidateBaseSchema.extend({
    type: z.literal("weight"),
    data: weightLogSchema
  })
]);

export const coachConfirmSchema = z.object({
  userId: z.string().min(1),
  candidate: coachCandidateSchema,
  edits: z.record(z.unknown()).optional(),
  confirm: z.literal(true)
});

export const behaviorQuerySchema = z.object({
  userId: z.string().min(1),
  endDate: isoDateSchema.optional()
});
