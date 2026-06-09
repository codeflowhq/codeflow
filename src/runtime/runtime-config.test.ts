import { describe, expect, it } from "vitest";

import { defaultGlobalConfig, defaultVariableConfig } from "../configDefaults";
import { buildVisualizationRuntimeConfig } from "./runtime-config";

describe("buildVisualizationRuntimeConfig", () => {
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
});
