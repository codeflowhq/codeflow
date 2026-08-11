import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RawManifestPayload, RuntimeVisualizationConfig } from "../shared/types/visualization";
import type { PyodideRuntime } from "./pyodide-runtime";

const { bootstrapRuntime, installMicropipPackages } = vi.hoisted(() => ({
  bootstrapRuntime: vi.fn(),
  installMicropipPackages: vi.fn(),
}));

vi.mock("./pyodide-runtime", () => ({
  bootstrapRuntime,
  installMicropipPackages,
}));

import { runVisualizationInBrowser } from "./python-bridge";

const buildConfig = (overrides: Partial<RuntimeVisualizationConfig> = {}): RuntimeVisualizationConfig => ({
  step_limit: 12,
  output_format: "svg",
  max_depth: 3,
  max_items_per_view: 50,
  recursion_depth_default: -1,
  auto_recursion_depth_cap: 6,
  show_titles: false,
  custom_converters: [],
  type_view_defaults: {},
  runtime_packages: [],
  runtime_wheels: [],
  variable_configs: {},
  ...overrides,
});

const buildPyodide = (payload: RawManifestPayload, destroy = vi.fn()): PyodideRuntime => ({
  globals: {
    get: vi.fn(() => Object.assign(
      vi.fn(() => JSON.stringify(payload)),
      { destroy },
    )),
  },
  FS: {
    stat: vi.fn(),
    isDir: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
  loadPackage: vi.fn(),
  pyimport: vi.fn(),
  runPython: vi.fn(),
});

describe("runVisualizationInBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("installs runtime packages and wheels before invoking the Python runner", async () => {
    const payload: RawManifestPayload = {
      manifest: [{
        variable: "data",
        kind: "svg",
        steps: [{ execution_id: 1, order: 2 }],
      }],
    };
    const destroy = vi.fn();
    const pyodide = buildPyodide(payload, destroy);
    bootstrapRuntime.mockResolvedValue(pyodide);

    const config = buildConfig({
      runtime_packages: ["numpy"],
      runtime_wheels: ["/pyodide/custom.whl"],
    });

    const result = await runVisualizationInBrowser({
      snippet: "data = [1]",
      watch: ["data"],
      config,
    });

    expect(installMicropipPackages).toHaveBeenNthCalledWith(1, pyodide, ["numpy"]);
    expect(installMicropipPackages).toHaveBeenNthCalledWith(
      2,
      pyodide,
      ["/pyodide/custom.whl"],
      { treatAsWheels: true },
    );
    expect(result.manifest[0].steps[0]).toMatchObject({
      executionId: 1,
      order: 2,
      timelineKey: "1:2",
      stepId: "2",
    });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("defaults the runtime output format to svg when the config is missing it", async () => {
    const runner = vi.fn(() => JSON.stringify({ manifest: [] }));
    const destroy = vi.fn();
    const pyodide: PyodideRuntime = {
      globals: {
        get: vi.fn(() => Object.assign(runner, { destroy })),
      },
      FS: {
        stat: vi.fn(),
        isDir: vi.fn(),
        mkdir: vi.fn(),
        writeFile: vi.fn(),
      },
      loadPackage: vi.fn(),
      pyimport: vi.fn(),
      runPython: vi.fn(),
    };
    bootstrapRuntime.mockResolvedValue(pyodide);

    await runVisualizationInBrowser({
      snippet: "data = [1]",
      config: buildConfig({ output_format: undefined as unknown as "svg" }),
    });

    const calls = runner.mock.calls as unknown as Array<[string]>;
    const [call] = calls[0] ?? [];
    expect(JSON.parse(String(call))).toMatchObject({
      snippet: "data = [1]",
      config: { output_format: "svg" },
    });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("passes through undefined watch lists and normalizes camelCase manifest responses", async () => {
    const runner = vi.fn(() => JSON.stringify({
      manifest: [{
        variable: "queue",
        kind: "svg",
        compatibleViewKinds: ["table"],
        steps: [{
          stepId: "frame-1",
          executionId: 3,
          order: 5,
          svg: "<svg />",
        }],
      }],
    }));
    const pyodide: PyodideRuntime = {
      globals: {
        get: vi.fn(() => Object.assign(runner, { destroy: vi.fn() })),
      },
      FS: {
        stat: vi.fn(),
        isDir: vi.fn(),
        mkdir: vi.fn(),
        writeFile: vi.fn(),
      },
      loadPackage: vi.fn(),
      pyimport: vi.fn(),
      runPython: vi.fn(),
    };
    bootstrapRuntime.mockResolvedValue(pyodide);

    const result = await runVisualizationInBrowser({
      snippet: "queue = []",
      config: buildConfig(),
    });

    const calls = runner.mock.calls as unknown as Array<[string]>;
    const [call] = calls[0] ?? [];
    expect(JSON.parse(String(call))).toMatchObject({
      snippet: "queue = []",
    });
    expect(JSON.parse(String(call))).not.toHaveProperty("watch");
    expect(result).toEqual({
      manifest: [{
        variable: "queue",
        kind: "svg",
        compatibleViewKinds: ["table"],
        steps: [{
          stepId: "frame-1",
          timelineKey: "3:5",
          eventOrder: null,
          executionId: 3,
          order: 5,
          index: 1,
          svg: "<svg />",
        }],
      }],
    });
  });
});
