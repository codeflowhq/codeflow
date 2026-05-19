import { describe, expect, it } from "vitest";

import { normalizeGraphRenderError, normalizeRuntimeError, normalizeUnexpectedAppError } from "./runtime-errors";

describe("normalizeRuntimeError", () => {
  it("maps known runtime dependency failures", () => {
    expect(normalizeRuntimeError(new Error("RuntimeError: Browser dependency import failed. Please reload the page.")))
      .toBe("Browser runtime is not ready. Reload the page and try again.");
  });

  it("maps heap dual type mismatches", () => {
    expect(normalizeRuntimeError(new Error("TypeError: heap_dual_node view expects list input")))
      .toBe("Heap dual view only works with list data.");
  });
});

describe("normalizeGraphRenderError", () => {
  it("maps invalid dot syntax errors", () => {
    expect(normalizeGraphRenderError(new Error('syntax error in line 12 near ">"')))
      .toBe("This graph output is not valid for rendering.");
  });

  it("maps svg parser failures to a friendly message", () => {
    expect(normalizeGraphRenderError(new Error("DOMParser failed")))
      .toBe("This SVG output could not be displayed.");
  });
});

describe("normalizeUnexpectedAppError", () => {
  it("reuses runtime friendly mappings", () => {
    expect(normalizeUnexpectedAppError(new Error("ModuleNotFoundError: No module named 'numpy'")))
      .toBe("A required Python module is missing in the browser runtime.");
  });

  it("falls back to a generic application message", () => {
    expect(normalizeUnexpectedAppError({ broken: true }))
      .toBe("Something went wrong in the app. Reload the page and try again.");
  });
});
