import { describe, expect, it } from "vitest";

import { shouldSuppressDuplicateError } from "./useGlobalErrorHandling";
import { normalizeUnexpectedAppError } from "../../runtime/runtime-errors";

describe("shouldSuppressDuplicateError", () => {
  it("suppresses repeated messages inside the duplicate window", () => {
    expect(shouldSuppressDuplicateError({ message: "x", timestamp: 1000 }, "x", 1500)).toBe(true);
  });

  it("does not suppress different or old messages", () => {
    expect(shouldSuppressDuplicateError({ message: "x", timestamp: 1000 }, "y", 1500)).toBe(false);
    expect(shouldSuppressDuplicateError({ message: "x", timestamp: 1000 }, "x", 2501)).toBe(false);
  });
});

describe("normalizeUnexpectedAppError", () => {
  it("reuses friendly runtime messages", () => {
    expect(normalizeUnexpectedAppError(new Error("TypeError: heap_dual_node view expects list input")))
      .toBe("Heap dual view only works with list data.");
  });

  it("falls back to a generic app error", () => {
    expect(normalizeUnexpectedAppError({ bad: true })).toBe("Something went wrong in the app. Reload the page and try again.");
  });
});
