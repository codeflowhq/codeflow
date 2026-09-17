import { describe, expect, it } from "vitest";

import {
  cloneLayoutState,
  EMPTY_LAYOUT_STATE,
  mergeOverlayGroups,
  removeOverlayVariable,
  sanitizeLayoutState,
} from "./layout-state";

describe("layout-state", () => {
  it("clones layout state without sharing nested references", () => {
    const state = {
      mode: "windows" as const,
      masonryOrder: ["data"],
      overlayGroups: [],
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
      overlayGroups: [],
      windows: {
        layouts: { data: { x: 1, y: 2, width: 3, height: 4 } },
        zIndices: { data: 2 },
      },
    });
  });

  it("expands an existing group before adding another selected layer", () => {
    const groups = [{
      id: "existing",
      variables: ["fit", "points"],
      layerOrder: ["fit", "points"],
    }];

    expect(mergeOverlayGroups(groups, ["fit", "candidate"])).toEqual([{
      id: "overlay-fit-points-candidate",
      variables: ["fit", "points", "candidate"],
      layerOrder: ["fit", "points", "candidate"],
    }]);
  });

  it("merges complete groups when selected layers belong to different groups", () => {
    const groups = [
      { id: "first", variables: ["a", "b"], layerOrder: ["a", "b"] },
      { id: "second", variables: ["c", "d"], layerOrder: ["c", "d"] },
    ];

    expect(mergeOverlayGroups(groups, ["b", "d"])).toEqual([{
      id: "overlay-a-b-c-d",
      variables: ["a", "b", "c", "d"],
      layerOrder: ["a", "b", "c", "d"],
    }]);
  });

  it("removes a deleted layer and dissolves groups smaller than two layers", () => {
    const groups = [{
      id: "existing",
      variables: ["fit", "points", "candidate"],
      layerOrder: ["fit", "points", "candidate"],
    }];

    expect(removeOverlayVariable(groups, "fit")).toEqual([{
      id: "existing",
      variables: ["points", "candidate"],
      layerOrder: ["points", "candidate"],
    }]);
    expect(removeOverlayVariable(groups, "points")[0]?.layerOrder).toEqual(["fit", "candidate"]);
    expect(removeOverlayVariable(groups.slice(0, 1).map((group) => ({
      ...group,
      variables: group.variables.slice(0, 2),
      layerOrder: group.layerOrder.slice(0, 2),
    })), "fit")).toEqual([]);
  });

  it("drops persisted overlay groups that overlap an earlier group", () => {
    const sanitized = sanitizeLayoutState({
      mode: "masonry",
      overlayGroups: [
        { id: "first", variables: ["a", "b"], layerOrder: ["a", "b"] },
        { id: "overlap", variables: ["b", "c"], layerOrder: ["b", "c"] },
      ],
    });

    expect(sanitized.overlayGroups).toEqual([
      { id: "first", variables: ["a", "b"], layerOrder: ["a", "b"] },
    ]);
  });
});
