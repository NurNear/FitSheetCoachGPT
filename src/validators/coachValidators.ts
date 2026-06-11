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

export const coachSummaryQuerySchema = z
  .object({
    userId: z.string().min(1),
    scope: z.enum(["today", "range", "all"]),
    date: isoDateSchema.optional(),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional()
  })
  .superRefine((value, context) => {
    if (value.scope !== "range") return;

    if (!value.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "startDate is required when scope=range"
      });
    }

    if (!value.endDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "endDate is required when scope=range"
      });
    }

    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "endDate must be on or after startDate"
      });
    }
  });
