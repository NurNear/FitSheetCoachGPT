import { describe, expect, it } from "vitest";
import { behaviorQuerySchema, coachConfirmSchema } from "../src/validators/coachValidators.js";
import { foodLogsQuerySchema } from "../src/validators/logValidators.js";

describe("coachValidators", () => {
  it("requires explicit confirmation before persistence", () => {
    expect(() =>
      coachConfirmSchema.parse({
        userId: "demo",
        confirm: false,
        candidate: {
          type: "weight",
          data: {
            userId: "demo",
            weightKg: 80
          }
        }
      })
    ).toThrow();
  });

  it("validates the selected candidate with the existing log rules", () => {
    expect(() =>
      coachConfirmSchema.parse({
        userId: "demo",
        confirm: true,
        candidate: {
          type: "exercise",
          data: {
            userId: "demo",
            name: "Run",
            durationMinutes: 0
          }
        }
      })
    ).toThrow();
  });

  it("accepts a valid behavior query", () => {
    expect(
      behaviorQuerySchema.parse({
        userId: "demo",
        endDate: "2026-06-10"
      })
    ).toEqual({
      userId: "demo",
      endDate: "2026-06-10"
    });
  });

  it("rejects an invalid behavior end date", () => {
    expect(() =>
      behaviorQuerySchema.parse({
        userId: "demo",
        endDate: "10-06-2026"
      })
    ).toThrow();
  });

  it("rejects a nonexistent calendar date", () => {
    expect(() =>
      behaviorQuerySchema.parse({
        userId: "demo",
        endDate: "2026-02-30"
      })
    ).toThrow();
  });

  it("accepts a valid daily food logs query", () => {
    expect(
      foodLogsQuerySchema.parse({
        userId: "demo",
        date: "2026-06-11"
      })
    ).toEqual({
      userId: "demo",
      date: "2026-06-11"
    });
  });
});
