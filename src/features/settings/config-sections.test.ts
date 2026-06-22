import { describe, expect, it } from "vitest";

import { buildTypeDefaultRows, buildVariableConfigRows, updateTypeViewDefault } from "./config-sections";

describe("buildVariableConfigRows", () => {
  it("fills missing variables with the default config", () => {
    const rows = buildVariableConfigRows(
      ["data", "queue"],
      { data: { viewKind: "bar", depth: 2, viewOptions: { color: "#64748b" } } },
      { viewKind: "auto", depth: null, viewOptions: { color: "#64748b" } },
    );

    expect(rows).toEqual([
      { variable: "data", viewKind: "bar", depth: 2, viewOptions: { color: "#64748b" } },
      { variable: "queue", viewKind: "auto", depth: null, viewOptions: { color: "#64748b" } },
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
    expect(rows.find((row) => row.key === "graph")?.viewKind).toBe("graph");
  });
});

describe("updateTypeViewDefault", () => {
  it("updates one type default without dropping existing config", () => {
    const next = updateTypeViewDefault(
      { ...({ stepLimit: 12, maxDepth: 3, maxItemsPerView: 50, recursionDepthDefault: -1, showTitles: false, customConverters: "", runtimePackages: "", runtimeWheels: "", typeViewDefaults: { tree: "tree" } }) },
      "graph",
      "graph",
    );

    expect(next).toEqual({
      stepLimit: 12,
      maxDepth: 3,
      maxItemsPerView: 50,
      recursionDepthDefault: -1,
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
