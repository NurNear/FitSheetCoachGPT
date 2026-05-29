import { describe, expect, it } from "vitest";
import { coachAnalyzeSchema, coachConfirmSchema } from "../src/validators/coachValidators.js";

describe("coachValidators", () => {
  it("requires either message or image for analysis", () => {
    expect(() => coachAnalyzeSchema.parse({ userId: "demo" })).toThrow();
  });

  it("accepts text analysis input", () => {
    expect(
      coachAnalyzeSchema.parse({
        userId: "demo",
        message: "วันนี้กินข้าวมันไก่ 1 จาน",
        contextDate: "2026-05-25"
      })
    ).toEqual({
      userId: "demo",
      message: "วันนี้กินข้าวมันไก่ 1 จาน",
      contextDate: "2026-05-25"
    });
  });

  it("accepts image analysis input with metadata", () => {
    expect(
      coachAnalyzeSchema.parse({
        userId: "demo",
        image: {
          mimeType: "image/jpeg",
          url: "https://example.com/meal.jpg"
        }
      })
    ).toEqual({
      userId: "demo",
      image: {
        mimeType: "image/jpeg",
        url: "https://example.com/meal.jpg"
      }
    });
  });

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
});
