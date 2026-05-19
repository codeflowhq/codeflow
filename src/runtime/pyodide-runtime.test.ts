import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPyodideRuntime } from "./pyodide-runtime";
import type { FetchLike, FetchLikeResponse, MicropipModule, PyodideDocumentLike, PyodideRuntime, PyodideWindowLike, ScriptNodeLike } from "./pyodide-runtime";

type ScriptStub = ScriptNodeLike & {
  dataset: { pyodideSrc?: string };
};

const createDocumentStub = (): PyodideDocumentLike => {
  const scripts: ScriptStub[] = [];

  return {
    head: {
      appendChild(node) {
        scripts.push(node as ScriptStub);
        queueMicrotask(() => node.onload?.());
      },
    },
    querySelector(selector: string) {
      return scripts.find((script) => `script[data-pyodide-src="${script.dataset.pyodideSrc}"]` === selector) ?? null;
    },
    createElement() {
      return {
        dataset: {},
        addEventListener() {},
      };
    },
  };
};

type PyodideStub = PyodideRuntime & {
  __install: ReturnType<typeof vi.fn>;
  __destroy: ReturnType<typeof vi.fn>;
};

const createPyodideStub = (): PyodideStub => {
  const directories = new Set(["/"]);
  const install = vi.fn(async () => {});
  const destroy = vi.fn();
  const micropipModule: MicropipModule = { install, destroy };

  return {
    globals: { get: vi.fn() },
    loadPackage: vi.fn(async () => {}),
    pyimport: vi.fn(() => micropipModule),
    runPython: vi.fn(),
    FS: {
      stat: vi.fn((path: string) => {
        if (directories.has(path)) {
          return { mode: 1 };
        }
        const error = new Error("No such file or directory") as Error & { code?: string };
        error.code = "ENOENT";
        throw error;
      }),
      isDir: vi.fn(() => true),
      mkdir: vi.fn((path: string) => {
        directories.add(path);
      }),
      writeFile: vi.fn(),
    },
    __install: install,
    __destroy: destroy,
  };
};

const createResponse = (response: Partial<FetchLikeResponse>): FetchLikeResponse => ({
  ok: response.ok ?? true,
  json: response.json ?? (async () => ({})),
  text: response.text ?? (async () => ""),
});

describe("createPyodideRuntime", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { origin: "http://localhost" } },
    });
  });

  it("bootstraps once and caches the runtime instance", async () => {
    const pyodide = createPyodideStub();
    const loadPyodide = vi.fn(async () => pyodide);
    const windowRef: PyodideWindowLike = { loadPyodide, location: { origin: "http://localhost" } };
    const documentRef = createDocumentStub();
    const fetchImpl: FetchLike = vi.fn(async (url: string) => {
      if (String(url).includes("runtime-config.json")) {
        return createResponse({
          json: async () => ({
            pyodidePackages: ["micropip"],
            pythonSources: [{ url: "/runtime/code.py", path: "pkg/code.py" }],
          }),
        });
      }
      return createResponse({ text: async () => "print('ok')" });
    });

    const runtime = createPyodideRuntime({
      fetchImpl,
      documentRef,
      windowRef,
      pythonBootstrap: "print('bootstrap')",
    });

    const first = await runtime.bootstrapRuntime();
    const second = await runtime.bootstrapRuntime();

    expect(first).toBe(pyodide);
    expect(second).toBe(pyodide);
    expect(loadPyodide).toHaveBeenCalledTimes(1);
    expect(pyodide.runPython).toHaveBeenCalledWith("print('bootstrap')");
    expect(pyodide.FS.writeFile).toHaveBeenCalledWith(
      "/code_visualizer_runtime/pkg/code.py",
      "print('ok')",
      { encoding: "utf8" },
    );
  });

  it("skips blocked packages and deduplicates installs", async () => {
    const pyodide = createPyodideStub();
    const runtime = createPyodideRuntime({
      fetchImpl: vi.fn(async () => createResponse({})) as FetchLike,
      documentRef: createDocumentStub(),
      windowRef: { location: { origin: "http://localhost" } },
    });

    await runtime.installMicropipPackages(pyodide, [
      "code_visualizer",
      "numpy",
      "numpy",
      "/pyodide/wheels/custom.whl",
    ]);

    expect(pyodide.loadPackage).toHaveBeenCalledWith("micropip");
    expect(pyodide.__install).toHaveBeenCalledTimes(2);
    expect(pyodide.__install).toHaveBeenNthCalledWith(1, "numpy", undefined);
    const secondCall = pyodide.__install.mock.calls[1];
    expect(secondCall?.[0]).toContain("/pyodide/wheels/custom.whl");
    expect(secondCall?.[1]).toEqual({ deps: false });
    expect(pyodide.__destroy).toHaveBeenCalledTimes(1);
  });
});
