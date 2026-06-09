import { describe, expect, it } from "vitest";

import {
  viewKindSupportsColor,
  viewKindSupportsDepth,
  viewSelectionSupportsColor,
  viewSelectionSupportsDepth,
} from "./view-capabilities";

describe("view capabilities", () => {
  it("marks only supported view kinds as color-capable", () => {
    expect(viewKindSupportsColor("bar")).toBe(true);
    expect(viewKindSupportsColor("matrix")).toBe(true);
    expect(viewKindSupportsColor("graph")).toBe(false);
    expect(viewKindSupportsColor("tree")).toBe(false);
  });

  it("treats auto as color-capable only when compatible options support color", () => {
    expect(viewSelectionSupportsColor("auto", ["auto", "bar"])).toBe(true);
    expect(viewSelectionSupportsColor("auto", ["auto", "graph"])).toBe(false);
  });

  it("marks only supported view kinds as depth-capable", () => {
    expect(viewKindSupportsDepth("tree")).toBe(true);
    expect(viewKindSupportsDepth("table")).toBe(true);
    expect(viewKindSupportsDepth("bar")).toBe(false);
  });

  it("treats auto as depth-capable only when compatible options support depth", () => {
    expect(viewSelectionSupportsDepth("auto", ["auto", "table"])).toBe(true);
    expect(viewSelectionSupportsDepth("auto", ["auto", "bar"])).toBe(false);
  });
});
