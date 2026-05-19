import { describe, expect, it } from "vitest";

import { buildTypeDefaultRows, buildVariableConfigRows, updateTypeViewDefault } from "./config-sections";

describe("buildVariableConfigRows", () => {
  it("fills missing variables with the default config", () => {
    const rows = buildVariableConfigRows(
      ["data", "queue"],
      { data: { viewKind: "bar", depth: 2, viewOptions: { barColor: "#2563eb" } } },
      { viewKind: "auto", depth: null, viewOptions: { barColor: "#2563eb" } },
    );

    expect(rows).toEqual([
      { variable: "data", viewKind: "bar", depth: 2, viewOptions: { barColor: "#2563eb" } },
      { variable: "queue", viewKind: "auto", depth: null, viewOptions: { barColor: "#2563eb" } },
    ]);
  });
});

describe("buildTypeDefaultRows", () => {
  it("maps configured defaults onto known type rows", () => {
    const rows = buildTypeDefaultRows({
      "list[any]": "array_cells",
      tree: "tree",
    });

    expect(rows.find((row) => row.key === "list[any]")?.viewKind).toBe("array_cells");
    expect(rows.find((row) => row.key === "tree")?.viewKind).toBe("tree");
    expect(rows.find((row) => row.key === "graph")?.viewKind).toBe("auto");
  });
});

describe("updateTypeViewDefault", () => {
  it("updates one type default without dropping existing config", () => {
    const next = updateTypeViewDefault(
      { ...({ stepLimit: 12, outputFormat: "svg", maxDepth: 3, maxItemsPerView: 50, recursionDepthDefault: -1, autoRecursionDepthCap: 6, showTitles: false, customConverters: "", runtimePackages: "", runtimeWheels: "", typeViewDefaults: { tree: "tree" } }) },
      "graph",
      "graph",
    );

    expect(next).toEqual({
      stepLimit: 12,
      outputFormat: "svg",
      maxDepth: 3,
      maxItemsPerView: 50,
      recursionDepthDefault: -1,
      autoRecursionDepthCap: 6,
      showTitles: false,
      customConverters: "",
      runtimePackages: "",
      runtimeWheels: "",
      typeViewDefaults: {
        tree: "tree",
        graph: "graph",
      },
    });
  });
});
