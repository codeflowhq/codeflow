// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCollections } from "./useCollections";

const baseGlobalConfig = {
  stepLimit: 128,
  maxDepth: 3,
  maxItemsPerView: 50,
  recursionDepthDefault: -1,
  showTitles: false,
  customConverters: "",
  runtimePackages: "",
  runtimeWheels: "",
  typeViewDefaults: {},
};

describe("useCollections", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
      },
    });
  });

  it("returns an empty collection list for invalid JSON", () => {
    storage.set("collections.invalid-json", "{invalid");

    const { result } = renderHook(() => useCollections("collections.invalid-json"));

    expect(result.current.collections).toEqual([]);
  });

  it("returns an empty collection list when storage does not contain an array", () => {
    storage.set("collections.not-array", JSON.stringify({ id: "one" }));

    const { result } = renderHook(() => useCollections("collections.not-array"));

    expect(result.current.collections).toEqual([]);
  });

  it("filters malformed records and normalizes optional fields", () => {
    storage.set("collections.mixed", JSON.stringify([
      {
        id: "valid",
        name: "Demo",
        savedAt: "2026-07-05T00:00:00.000Z",
        sourceCode: "",
        globalConfig: baseGlobalConfig,
        watchVariables: null,
        variableConfigs: null,
        labels: ["alpha", 1],
      },
      {
        id: "invalid",
        name: "Broken",
        savedAt: "2026-07-05T00:00:00.000Z",
        sourceCode: "",
      },
    ]));

    const { result } = renderHook(() => useCollections("collections.mixed"));

    expect(result.current.collections).toEqual([
      {
        id: "valid",
        name: "Demo",
        savedAt: "2026-07-05T00:00:00.000Z",
        sourceCode: "",
        description: undefined,
        labels: undefined,
        watchVariables: ["data"],
        globalConfig: baseGlobalConfig,
        variableConfigs: {},
        savedManifest: undefined,
        layoutState: undefined,
      },
    ]);
  });
});
