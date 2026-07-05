import { describe, expect, it } from "vitest";

import { defaultGlobalConfig, defaultVariableConfig } from "../configDefaults";
import { buildVisualizationRuntimeConfig } from "./runtime-config";

describe("buildVisualizationRuntimeConfig", () => {
  it("maps global config fields into the runtime payload", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: {
        ...defaultGlobalConfig,
        stepLimit: 40,
        maxDepth: 8,
        maxItemsPerView: 120,
        recursionDepthDefault: 0,
        showTitles: true,
        typeViewDefaults: {
          "list[any]": "bar",
          tree: "tree",
        },
      },
      variableConfigs: {},
    });

    expect(config).toMatchObject({
      step_limit: 40,
      output_format: "svg",
      max_depth: 8,
      max_items_per_view: 120,
      recursion_depth_default: 0,
      auto_recursion_depth_cap: 6,
      show_titles: true,
      type_view_defaults: {
        "list[any]": "bar",
        tree: "tree",
      },
      variable_configs: {},
    });
  });

  it("splits runtime packages, wheels and custom converters into clean lists", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: {
        ...defaultGlobalConfig,
        customConverters: "my_pkg.converters:normalize_value, another.mod:convert",
        runtimePackages: "humanize, more-itertools,  ",
        runtimeWheels: "pyodide/wheels/custom-0.1.0-py3-none-any.whl, https://example.com/extra.whl",
      },
      variableConfigs: {},
    });

    expect(config.custom_converters).toEqual([
      "my_pkg.converters:normalize_value",
      "another.mod:convert",
    ]);
    expect(config.runtime_packages).toEqual(["humanize", "more-itertools"]);
    expect(config.runtime_wheels).toEqual([
      "pyodide/wheels/custom-0.1.0-py3-none-any.whl",
      "https://example.com/extra.whl",
    ]);
  });

  it("appends session runtime wheel uploads after configured wheel URLs", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: {
        ...defaultGlobalConfig,
        runtimeWheels: "pyodide/wheels/custom-0.1.0-py3-none-any.whl",
      },
      sessionRuntimeWheels: ["blob:session-wheel-1", "blob:session-wheel-2"],
      variableConfigs: {},
    });

    expect(config.runtime_wheels).toEqual([
      "pyodide/wheels/custom-0.1.0-py3-none-any.whl",
      "blob:session-wheel-1",
      "blob:session-wheel-2",
    ]);
  });

  it("returns empty lists for blank comma-separated fields", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: {
        ...defaultGlobalConfig,
        customConverters: " , , ",
        runtimePackages: "",
        runtimeWheels: "  ",
      },
      variableConfigs: {},
    });

    expect(config.custom_converters).toEqual([]);
    expect(config.runtime_packages).toEqual([]);
    expect(config.runtime_wheels).toEqual([]);
  });

  it("preserves variable overrides without emitting inherited depth", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: defaultGlobalConfig,
      variableConfigs: {
        data: { ...defaultVariableConfig, viewKind: "table", depth: 3 },
        item: { ...defaultVariableConfig, viewKind: "auto", depth: null },
      },
    });

    expect(config.variable_configs.data).toMatchObject({
      view_kind: "table",
      depth: 3,
    });
    expect(config.variable_configs.item).toEqual({
      view_kind: "auto",
      view_options: {
        ...defaultVariableConfig.viewOptions,
        barColor: defaultVariableConfig.viewOptions.color,
      },
    });
  });

  it("maps every variable override field for multiple watched variables", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: defaultGlobalConfig,
      variableConfigs: {
        data: {
          viewKind: "graph",
          depth: 0,
          viewOptions: { color: "#123456" },
        },
        queue: {
          viewKind: "image",
          depth: 20,
          viewOptions: { color: "#abcdef" },
        },
      },
    });

    expect(config.variable_configs).toEqual({
      data: {
        view_kind: "graph",
        depth: 0,
        view_options: {
          color: "#123456",
          barColor: "#123456",
        },
      },
      queue: {
        view_kind: "image",
        depth: 20,
        view_options: {
          color: "#abcdef",
          barColor: "#abcdef",
        },
      },
    });
  });

  it("normalizes invalid global and variable boundary values before building the payload", () => {
    const config = buildVisualizationRuntimeConfig({
      globalConfig: {
        ...defaultGlobalConfig,
        stepLimit: 0,
        maxDepth: 100,
        maxItemsPerView: -5,
        recursionDepthDefault: -8,
        typeViewDefaults: {
          graph: "graph",
          tree: "unknown" as "tree",
        },
      },
      variableConfigs: {
        data: {
          viewKind: "unknown" as "graph",
          depth: 99,
          viewOptions: { color: " " },
        },
      },
    });

    expect(config).toMatchObject({
      step_limit: 1,
      output_format: "svg",
      max_depth: 20,
      max_items_per_view: 1,
      recursion_depth_default: -1,
      auto_recursion_depth_cap: 6,
      type_view_defaults: {
        graph: "graph",
        tree: "auto",
      },
      variable_configs: {
        data: {
          view_kind: "auto",
          depth: 20,
          view_options: {
            color: "#64748b",
            barColor: "#64748b",
          },
        },
      },
    });
  });
});
