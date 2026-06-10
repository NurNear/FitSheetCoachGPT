import { describe, expect, it } from "vitest";
import { assertOwnerUserId } from "../src/middleware/ownerUser.js";

describe("ownerUser", () => {
  it("allows the configured owner", () => {
    expect(() => assertOwnerUserId("demo", "demo")).not.toThrow();
  });

  it("rejects a different userId with 403", () => {
    expect(() => assertOwnerUserId("someone-else", "demo")).toThrow(
      expect.objectContaining({
        status: 403,
        code: "Forbidden"
      })
    );
  });

  it("does not bind users when OWNER_USER_ID is omitted locally", () => {
    expect(() => assertOwnerUserId("any-user")).not.toThrow();
  });
});
