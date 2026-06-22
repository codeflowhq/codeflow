import { describe, expect, it } from "vitest";

import { normalizeGlobalConfig, normalizeVariableConfigs } from "./config-normalizer";

describe("normalizeGlobalConfig", () => {
  it("clamps numeric fields and falls back invalid enum values", () => {
    const config = normalizeGlobalConfig({
      stepLimit: 0,
      maxDepth: 50,
      maxItemsPerView: -3,
      recursionDepthDefault: -9,
      showTitles: 1 as unknown as boolean,
      customConverters: null as unknown as string,
      runtimePackages: undefined as unknown as string,
      runtimeWheels: 42 as unknown as string,
      typeViewDefaults: {
        tree: "gif" as "graph",
        graph: "graph",
        custom: "auto",
      },
    });

    expect(config).toEqual({
      stepLimit: 1,
      maxDepth: 20,
      maxItemsPerView: 1,
      recursionDepthDefault: -1,
      showTitles: true,
      customConverters: "",
      runtimePackages: "",
      runtimeWheels: "42",
      typeViewDefaults: {
        tree: "auto",
        graph: "graph",
        custom: "auto",
      },
    });
  });

  it("truncates decimals and preserves valid values", () => {
    const config = normalizeGlobalConfig({
      stepLimit: 12.8,
      maxDepth: 3.9,
      maxItemsPerView: 99.4,
      recursionDepthDefault: 2.7,
      showTitles: false,
      customConverters: "one",
      runtimePackages: "numpy",
      runtimeWheels: "/wheel.whl",
      typeViewDefaults: {
        tree: "tree",
      },
    });

    expect(config).toMatchObject({
      stepLimit: 12,
      maxDepth: 3,
      maxItemsPerView: 99,
      recursionDepthDefault: 2,
      showTitles: false,
      customConverters: "one",
      runtimePackages: "numpy",
      runtimeWheels: "/wheel.whl",
      typeViewDefaults: {
        tree: "tree",
      },
    });
  });
});

describe("normalizeVariableConfigs", () => {
  it("normalizes each variable config independently", () => {
    const config = normalizeVariableConfigs({
      data: {
        viewKind: "unknown" as "graph",
        depth: -4,
        viewOptions: { color: "  " },
      },
      queue: {
        viewKind: "image",
        depth: 30,
        viewOptions: { color: " #123456 " },
      },
      item: {
        viewKind: "bar",
        depth: null,
        viewOptions: { color: "#abcdef" },
      },
    });

    expect(config).toEqual({
      data: {
        viewKind: "auto",
        depth: 0,
        viewOptions: { color: "#64748b" },
      },
      queue: {
        viewKind: "image",
        depth: 20,
        viewOptions: { color: "#123456" },
      },
      item: {
        viewKind: "bar",
        depth: null,
        viewOptions: { color: "#abcdef" },
      },
    });
  });
});
