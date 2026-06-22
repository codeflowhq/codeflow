// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLibraryStore } from "./library-store";
import { EMPTY_LAYOUT_STATE } from "../visualization/layout-state";
import type { GlobalConfig, ManifestEntry, VariableConfig, VisualizationLayoutState } from "../../shared/types/visualization";

const baseGlobalConfig: GlobalConfig = {
  stepLimit: 12,
  maxDepth: 3,
  maxItemsPerView: 50,
  recursionDepthDefault: -1,
  showTitles: false,
  customConverters: "",
  runtimePackages: "",
  runtimeWheels: "",
  typeViewDefaults: {},
};

const manifest: ManifestEntry[] = [
  {
    variable: "data",
    kind: "svg",
    steps: [
      { stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 0, svg: "<svg />" },
    ],
  },
];

const variableConfigs: Record<string, VariableConfig> = {
  data: { viewKind: "auto", depth: 2, viewOptions: { color: "#64748b" } },
};

const createLayoutState = (): VisualizationLayoutState => ({
  mode: "windows",
  masonryOrder: ["data", "i"],
  windows: {
    layouts: {
      data: { x: 10, y: 20, width: 300, height: 200 },
      i: { x: 40, y: 60, width: 180, height: 120 },
    },
    zIndices: {
      data: 5,
      i: 4,
    },
  },
});

describe("useLibraryStore", () => {
  const messageApi = { success: vi.fn() };
  const storage = new Map<string, string>();

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
        clear: vi.fn(() => {
          storage.clear();
        }),
      },
    });
    storage.clear();
    messageApi.success.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves layout state into collections without sharing references", () => {
    const layoutState = createLayoutState();
    const persistLayoutState = vi.fn();

    const { result } = renderHook(() => useLibraryStore({
      storageKey: "test.collections.save-layout",
      defaultSnippet: "data = [1]",
      defaultGlobalConfig: baseGlobalConfig,
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: baseGlobalConfig,
      variableConfigs,
      manifest,
      layoutState,
      messageApi,
      persistWatchVariables: vi.fn(),
      persistVariableConfigs: vi.fn(),
      persistSourceCode: vi.fn(),
      persistGlobalConfig: vi.fn(),
      persistManifest: vi.fn(),
      persistLayoutState,
      resetSelectionState: vi.fn(),
      openVisualizationMain: vi.fn(),
      requestExampleRun: vi.fn(),
    }));

    act(() => {
      result.current.handleSaveCollection("Layout Demo");
    });

    layoutState.masonryOrder.push("other");
    layoutState.windows.layouts.data.x = 999;
    layoutState.windows.zIndices.data = 99;

    const stored = JSON.parse(window.localStorage.getItem("test.collections.save-layout") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].layoutState).toEqual({
      mode: "windows",
      masonryOrder: ["data", "i"],
      windows: {
        layouts: {
          data: { x: 10, y: 20, width: 300, height: 200 },
          i: { x: 40, y: 60, width: 180, height: 120 },
        },
        zIndices: { data: 5, i: 4 },
      },
    });
  });

  it("appends a numeric suffix instead of overwriting an existing project name", () => {
    const storageKey = "test.collections.duplicate-name";
    storage.set(storageKey, JSON.stringify([
      {
        id: "one",
        name: "Demo",
        savedAt: "2026-06-22T00:00:00.000Z",
        sourceCode: "data = [0]",
        watchVariables: ["data"],
        globalConfig: baseGlobalConfig,
        variableConfigs: {},
        savedManifest: [],
        layoutState: EMPTY_LAYOUT_STATE,
      },
      {
        id: "two",
        name: "Demo 1",
        savedAt: "2026-06-22T00:00:00.000Z",
        sourceCode: "data = [9]",
        watchVariables: ["data"],
        globalConfig: baseGlobalConfig,
        variableConfigs: {},
        savedManifest: [],
        layoutState: EMPTY_LAYOUT_STATE,
      },
    ]));

    const { result } = renderHook(() => useLibraryStore({
      storageKey,
      defaultSnippet: "data = [1]",
      defaultGlobalConfig: baseGlobalConfig,
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: baseGlobalConfig,
      variableConfigs,
      manifest,
      layoutState: createLayoutState(),
      messageApi,
      persistWatchVariables: vi.fn(),
      persistVariableConfigs: vi.fn(),
      persistSourceCode: vi.fn(),
      persistGlobalConfig: vi.fn(),
      persistManifest: vi.fn(),
      persistLayoutState: vi.fn(),
      resetSelectionState: vi.fn(),
      openVisualizationMain: vi.fn(),
      requestExampleRun: vi.fn(),
    }));

    act(() => {
      result.current.handleSaveCollection("Demo");
    });

    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    expect(stored).toHaveLength(3);
    expect(stored[0].name).toBe("Demo 2");
    expect(stored[1].name).toBe("Demo");
    expect(stored[2].name).toBe("Demo 1");
    expect(result.current.activeProjectName).toBe("Demo 2");
  });

  it("updates the opened saved project instead of suffixing the same name", () => {
    const storageKey = "test.collections.update-opened-project";
    const existing = {
      id: "one",
      name: "Demo",
      description: "old",
      savedAt: "2026-06-22T00:00:00.000Z",
      sourceCode: "data = [0]",
      watchVariables: ["data"],
      globalConfig: baseGlobalConfig,
      variableConfigs: {},
      savedManifest: [],
      layoutState: EMPTY_LAYOUT_STATE,
    };
    storage.set(storageKey, JSON.stringify([existing]));

    const { result } = renderHook(() => useLibraryStore({
      storageKey,
      defaultSnippet: "data = [1]",
      defaultGlobalConfig: baseGlobalConfig,
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: baseGlobalConfig,
      variableConfigs,
      manifest,
      layoutState: createLayoutState(),
      messageApi,
      persistWatchVariables: vi.fn(),
      persistVariableConfigs: vi.fn(),
      persistSourceCode: vi.fn(),
      persistGlobalConfig: vi.fn(),
      persistManifest: vi.fn(),
      persistLayoutState: vi.fn(),
      resetSelectionState: vi.fn(),
      openVisualizationMain: vi.fn(),
      requestExampleRun: vi.fn(),
    }));

    act(() => {
      result.current.handleLoadCollection(existing);
    });

    act(() => {
      result.current.handleSaveCollection("Demo", "updated");
    });

    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("one");
    expect(stored[0].name).toBe("Demo");
    expect(stored[0].description).toBe("updated");
    expect(result.current.activeProjectName).toBe("Demo");
  });

  it("restores saved layout state through persistLayoutState on load", () => {
    const recordLayout = createLayoutState();
    const persistLayoutState = vi.fn();

    const { result } = renderHook(() => useLibraryStore({
      storageKey: "test.collections.load-layout",
      defaultSnippet: "data = [1]",
      defaultGlobalConfig: baseGlobalConfig,
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: baseGlobalConfig,
      variableConfigs,
      manifest,
      layoutState: createLayoutState(),
      messageApi,
      persistWatchVariables: vi.fn(),
      persistVariableConfigs: vi.fn(),
      persistSourceCode: vi.fn(),
      persistGlobalConfig: vi.fn(),
      persistManifest: vi.fn(),
      persistLayoutState,
      resetSelectionState: vi.fn(),
      openVisualizationMain: vi.fn(),
      requestExampleRun: vi.fn(),
    }));

    const record = {
      id: "one",
      name: "Saved Layout",
      savedAt: "2026-06-22T00:00:00.000Z",
      sourceCode: "data = [1]",
      watchVariables: ["data"],
      globalConfig: baseGlobalConfig,
      variableConfigs,
      savedManifest: manifest,
      layoutState: recordLayout,
    };

    act(() => {
      result.current.handleLoadCollection(record);
    });

    expect(persistLayoutState).toHaveBeenCalledTimes(1);
    const restored = persistLayoutState.mock.calls[0][0] as VisualizationLayoutState;
    expect(restored).toEqual(recordLayout);
    expect(restored).not.toBe(recordLayout);
    expect(restored.windows.layouts).not.toBe(recordLayout.windows.layouts);
    expect(restored.windows.zIndices).not.toBe(recordLayout.windows.zIndices);
  });

  it("resets workspace state when creating a new project", () => {
    const persistWatchVariables = vi.fn();
    const persistVariableConfigs = vi.fn();
    const persistSourceCode = vi.fn();
    const persistGlobalConfig = vi.fn();
    const persistManifest = vi.fn();
    const persistLayoutState = vi.fn();
    const resetSelectionState = vi.fn();
    const openVisualizationMain = vi.fn();

    const { result } = renderHook(() => useLibraryStore({
      storageKey: "test.collections.create-project",
      defaultSnippet: "data = [1]",
      defaultGlobalConfig: baseGlobalConfig,
      sourceCode: "data = [2]",
      watchVariables: ["queue"],
      globalConfig: { ...baseGlobalConfig, maxDepth: 6 },
      variableConfigs,
      manifest,
      layoutState: createLayoutState(),
      messageApi,
      persistWatchVariables,
      persistVariableConfigs,
      persistSourceCode,
      persistGlobalConfig,
      persistManifest,
      persistLayoutState,
      resetSelectionState,
      openVisualizationMain,
      requestExampleRun: vi.fn(),
    }));

    act(() => {
      result.current.handleCreateProject();
    });

    expect(persistSourceCode).toHaveBeenCalledWith("data = [1]");
    expect(persistWatchVariables).toHaveBeenCalledWith(["data"]);
    expect(persistGlobalConfig).toHaveBeenCalledWith(baseGlobalConfig);
    expect(persistVariableConfigs).toHaveBeenCalledWith({});
    expect(persistManifest).toHaveBeenCalledWith([]);
    expect(persistLayoutState).toHaveBeenCalledWith(EMPTY_LAYOUT_STATE);
    expect(resetSelectionState).toHaveBeenCalledTimes(1);
    expect(openVisualizationMain).toHaveBeenCalledTimes(1);
    expect(result.current.activeProjectName).toBe("Untitled project");
  });
});
