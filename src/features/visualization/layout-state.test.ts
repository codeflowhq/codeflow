import { describe, expect, it } from "vitest";

import { cloneLayoutState, EMPTY_LAYOUT_STATE, sanitizeLayoutState } from "./layout-state";

describe("layout-state", () => {
  it("clones layout state without sharing nested references", () => {
    const state = {
      mode: "windows" as const,
      masonryOrder: ["data"],
      windows: {
        layouts: {
          data: { x: 10, y: 20, width: 300, height: 200 },
        },
        zIndices: { data: 4 },
      },
    };

    const cloned = cloneLayoutState(state);
    cloned.masonryOrder.push("other");
    cloned.windows.layouts.data.x = 99;
    cloned.windows.zIndices.data = 10;

    expect(state.masonryOrder).toEqual(["data"]);
    expect(state.windows.layouts.data.x).toBe(10);
    expect(state.windows.zIndices.data).toBe(4);
  });

  it("sanitizes invalid layout state payloads", () => {
    expect(sanitizeLayoutState(null)).toEqual(EMPTY_LAYOUT_STATE);
    expect(
      sanitizeLayoutState({
        mode: "windows",
        masonryOrder: ["data", 1, null],
        windows: {
          layouts: { data: { x: 1, y: 2, width: 3, height: 4 }, bad: { x: 1 } },
          zIndices: { data: 2, bad: "x" },
        },
      }),
    ).toEqual({
      mode: "windows",
      masonryOrder: ["data"],
      windows: {
        layouts: { data: { x: 1, y: 2, width: 3, height: 4 } },
        zIndices: { data: 2 },
      },
    });
  });
});
