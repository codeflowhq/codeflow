import { describe, expect, it, vi } from "vitest";

import { buildCollectionRecord } from "./collectionRecord";

describe("buildCollectionRecord", () => {
  it("builds a saved collection payload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T03:00:00.000Z"));
    const randomUuid = vi.spyOn(crypto, "randomUUID").mockReturnValue("test-id" as ReturnType<typeof crypto.randomUUID>);

    const record = buildCollectionRecord({
      name: "Example",
      labels: ["demo", "array"],
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: { stepLimit: 12, maxDepth: 3, maxItemsPerView: 50, recursionDepthDefault: -1, showTitles: false, customConverters: "", runtimePackages: "", runtimeWheels: "", typeViewDefaults: {} },
      variableConfigs: { data: { viewKind: "auto", depth: 2, viewOptions: { color: "#64748b" } } },
      savedManifest: [{ variable: "data", kind: "svg", steps: [{ stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 0, svg: "<svg />" }] }],
      layoutState: { mode: "masonry", masonryOrder: ["data"], windows: { layouts: {}, zIndices: {} } },
    });

    expect(record).toEqual({
      id: "test-id",
      name: "Example",
      labels: ["demo", "array"],
      savedAt: "2026-05-10T03:00:00.000Z",
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: { stepLimit: 12, maxDepth: 3, maxItemsPerView: 50, recursionDepthDefault: -1, showTitles: false, customConverters: "", runtimePackages: "", runtimeWheels: "", typeViewDefaults: {} },
      variableConfigs: { data: { viewKind: "auto", depth: 2, viewOptions: { color: "#64748b" } } },
      savedManifest: [{ variable: "data", kind: "svg", steps: [{ stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 0, svg: "<svg />" }] }],
      layoutState: { mode: "masonry", masonryOrder: ["data"], windows: { layouts: {}, zIndices: {} } },
    });

    randomUuid.mockRestore();
    vi.useRealTimers();
  });
});


it("clones layout state in saved collection records", () => {
  const layoutState = { mode: "windows" as const, masonryOrder: ["data"], windows: { layouts: { data: { x: 1, y: 2, width: 3, height: 4 } }, zIndices: { data: 5 } } };
  const record = buildCollectionRecord({
    name: "Layout Clone",
    sourceCode: "data = [1]",
    watchVariables: ["data"],
    globalConfig: { stepLimit: 12, maxDepth: 3, maxItemsPerView: 50, recursionDepthDefault: -1, showTitles: false, customConverters: "", runtimePackages: "", runtimeWheels: "", typeViewDefaults: {} },
    variableConfigs: { data: { viewKind: "auto", depth: 2, viewOptions: { color: "#64748b" } } },
    savedManifest: [],
    layoutState,
  });

  layoutState.masonryOrder.push("other");
  layoutState.windows.layouts.data.x = 99;
  layoutState.windows.zIndices.data = 12;

  expect(record.layoutState).toEqual({
    mode: "windows",
    masonryOrder: ["data"],
    windows: { layouts: { data: { x: 1, y: 2, width: 3, height: 4 } }, zIndices: { data: 5 } },
  });
});
