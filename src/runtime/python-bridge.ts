import type { NormalizedManifest, RawManifestPayload, RuntimeVisualizationConfig } from "../shared/types/visualization";

export { bootstrapRuntime as initializeBrowserRuntime } from "./pyodide-runtime";

import { DEFAULT_RUNTIME_OUTPUT_FORMAT } from "./config-normalizer";
import { normalizeManifest } from "./manifest-normalizer";
import { bootstrapRuntime, installMicropipPackages } from "./pyodide-runtime";

export const runVisualizationInBrowser = async ({
  snippet,
  watch,
  config,
}: {
  snippet: string;
  watch?: string[];
  config: RuntimeVisualizationConfig;
}): Promise<NormalizedManifest> => {
  const pyodide = await bootstrapRuntime();
  await installMicropipPackages(pyodide, config.runtime_packages);
  await installMicropipPackages(pyodide, config.runtime_wheels);
  const runner = pyodide.globals.get("run_visualization") as (payload: string) => string;
  try {
    const result = runner(
      JSON.stringify({
        snippet,
        watch,
        config: {
          ...config,
          output_format: config.output_format || DEFAULT_RUNTIME_OUTPUT_FORMAT,
        },
      }),
    );
    const parsed = JSON.parse(result) as RawManifestPayload;
    return normalizeManifest(parsed);
  } finally {
    (runner as unknown as { destroy?: () => void }).destroy?.();
  }
};
