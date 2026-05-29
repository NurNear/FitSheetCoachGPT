import { z } from "zod";
import { exerciseLogSchema, foodLogSchema, profileMetricsSchema, weightLogSchema } from "./logValidators.js";

const contextDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const coachImageSchema = z
  .object({
    mimeType: z.string().min(1),
    dataUrl: z.string().min(1).optional(),
    url: z.string().url().optional(),
    altText: z.string().optional()
  })
  .refine((image) => image.dataUrl || image.url, {
    message: "Image input requires either dataUrl or url"
  });

export const coachAnalyzeSchema = z
  .object({
    userId: z.string().min(1),
    message: z.string().min(1).optional(),
    image: coachImageSchema.optional(),
    contextDate: contextDate.optional()
  })
  .refine((input) => input.message || input.image, {
    message: "Either message or image is required"
  });

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
