import { resolveAssetUrl } from "./assets";
import { PYTHON_BOOTSTRAP } from "./python-bootstrap";

const PYODIDE_VERSION = "0.27.5";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const RUNTIME_CONFIG_URL = resolveAssetUrl("pyodide/runtime-config.json") as string;
const BLOCKED_DYNAMIC_PACKAGES = new Set([
  "code_visualizer",
  "codeflow-py",
  "step_tracer",
  "step-tracer",
  "query_engine",
  "query-engine",
]);

type RuntimeConfig = {
  pyodidePackages?: string[];
  micropipPackages?: string[];
  wheelUrls?: string[];
};

export type FetchLikeResponse = {
  ok: boolean;
  json: () => Promise<RuntimeConfig>;
  text: () => Promise<string>;
};

export type FetchLike = (input: string) => Promise<FetchLikeResponse>;

export type FsStat = { mode: number };

export type MicropipModule = {
  install: (pkg: string, options?: { deps: false }) => Promise<void>;
  destroy: () => void;
};

export type PyodideRuntime = {
  globals: {
    get: (name: string) => unknown;
  };
  FS: {
    stat: (path: string) => FsStat;
    isDir: (mode: number) => boolean;
    mkdir: (path: string) => void;
    writeFile: (path: string, content: string, options: { encoding: "utf8" }) => void;
  };
  loadPackage: (packages: string | string[]) => Promise<void>;
  pyimport: (name: "micropip") => MicropipModule;
  runPython: (source: string) => void;
};

type LoadPyodide = (options: { indexURL: string }) => Promise<PyodideRuntime>;

export type ScriptNodeLike = {
  src?: string;
  async?: boolean;
  dataset: { pyodideSrc?: string };
  onload?: () => void;
  onerror?: () => void;
  addEventListener: (event: string, handler: () => void, options?: { once?: boolean }) => void;
};

export type PyodideDocumentLike = {
  querySelector: (selector: string) => ScriptNodeLike | null;
  createElement: (tagName: "script") => ScriptNodeLike;
  head: {
    appendChild: (node: ScriptNodeLike) => void;
  };
};

export type PyodideWindowLike = {
  loadPyodide?: LoadPyodide;
  location?: { origin?: string };
};

export type CreatePyodideRuntimeOptions = {
  fetchImpl?: FetchLike;
  documentRef?: PyodideDocumentLike;
  windowRef?: PyodideWindowLike;
  pythonBootstrap?: string;
};

const toInstallSpecifier = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }
  if (value.startsWith("/") || value.startsWith("./") || value.startsWith("pyodide/") || value.endsWith(".whl")) {
    return resolveAssetUrl(value);
  }
  return value;
};

const isWheelSpecifier = (value: unknown): value is string => typeof value === "string" && value.endsWith(".whl");

const shouldSkipDynamicPackage = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return BLOCKED_DYNAMIC_PACKAGES.has(normalized);
};

const defaultFetchImpl: FetchLike = async (input) => {
  const response = await fetch(input);
  return {
    ok: response.ok,
    json: async () => response.json() as Promise<RuntimeConfig>,
    text: async () => response.text(),
  };
};

const defaultDocumentRef = globalThis.document as unknown as PyodideDocumentLike;
const defaultWindowRef = globalThis.window as unknown as PyodideWindowLike;

export const createPyodideRuntime = ({
  fetchImpl = defaultFetchImpl,
  documentRef = defaultDocumentRef,
  windowRef = defaultWindowRef,
  pythonBootstrap = PYTHON_BOOTSTRAP,
}: CreatePyodideRuntimeOptions = {}) => {
  let pyodidePromise: Promise<PyodideRuntime> | undefined;
  let runtimePromise: Promise<PyodideRuntime> | undefined;
  let runtimeConfigPromise: Promise<RuntimeConfig> | undefined;
  const installedDynamicPackages = new Set<string>();

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const selector = `script[data-pyodide-src="${src}"]`;
      const existing = documentRef.querySelector(selector);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Pyodide script.")), { once: true });
        if (windowRef.loadPyodide !== undefined) {
          resolve();
        }
        return;
      }

      const script = documentRef.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.pyodideSrc = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Pyodide script."));
      documentRef.head.appendChild(script);
    });

  const getPyodide = async () => {
    if (pyodidePromise === undefined) {
      pyodidePromise = (async () => {
        await loadScript(PYODIDE_CDN);
        if (windowRef.loadPyodide === undefined) {
          throw new Error("Pyodide did not expose loadPyodide on window.");
        }
        return windowRef.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
      })();
    }
    return pyodidePromise;
  };

  const getRuntimeConfig = async () => {
    if (runtimeConfigPromise === undefined) {
      runtimeConfigPromise = fetchImpl(RUNTIME_CONFIG_URL).then(async (response) => {
        if (response.ok !== true) {
          throw new Error(`Missing browser runtime config at ${RUNTIME_CONFIG_URL}.`);
        }
        return response.json();
      });
    }
    return runtimeConfigPromise;
  };

  const installMicropipPackages = async (
    pyodide: PyodideRuntime,
    packages: string[] = [],
    options?: { treatAsWheels?: boolean },
  ) => {
    const normalized: string[] = [];
    const pendingPackages = new Set<string>();
    for (const pkg of packages ?? []) {
      if (!pkg || shouldSkipDynamicPackage(pkg) === true) {
        continue;
      }
      const specifier = toInstallSpecifier(pkg);
      if (typeof specifier !== "string") {
        continue;
      }
      if (installedDynamicPackages.has(specifier) || pendingPackages.has(specifier)) {
        continue;
      }
      pendingPackages.add(specifier);
      normalized.push(specifier);
    }
    if (normalized.length === 0) {
      return;
    }
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    try {
      for (const pkg of normalized) {
        const installOptions = options?.treatAsWheels || isWheelSpecifier(pkg) ? { deps: false as const } : undefined;
        await micropip.install(pkg, installOptions);
        installedDynamicPackages.add(pkg);
      }
    } finally {
      micropip.destroy();
    }
  };

  const bootstrapRuntime = async () => {
    if (runtimePromise === undefined) {
      runtimePromise = (async () => {
        const [pyodide, runtimeConfig] = await Promise.all([getPyodide(), getRuntimeConfig()]);
        const pyodidePackages = runtimeConfig.pyodidePackages ?? [];
        if (pyodidePackages.length > 0) {
          await pyodide.loadPackage(pyodidePackages);
        }
        await installMicropipPackages(pyodide, runtimeConfig.micropipPackages ?? []);
        await installMicropipPackages(pyodide, runtimeConfig.wheelUrls ?? [], { treatAsWheels: true });
        pyodide.runPython(pythonBootstrap);
        return pyodide;
      })();
    }
    return runtimePromise;
  };

  const resetForTests = () => {
    pyodidePromise = undefined;
    runtimePromise = undefined;
    runtimeConfigPromise = undefined;
    installedDynamicPackages.clear();
  };

  return {
    bootstrapRuntime,
    installMicropipPackages,
    resetForTests,
  };
};

const defaultRuntime = createPyodideRuntime();

export const bootstrapRuntime = (...args: Parameters<typeof defaultRuntime.bootstrapRuntime>) => defaultRuntime.bootstrapRuntime(...args);
export const installMicropipPackages = (...args: Parameters<typeof defaultRuntime.installMicropipPackages>) => defaultRuntime.installMicropipPackages(...args);
export const resetPyodideRuntimeForTests = () => defaultRuntime.resetForTests();
