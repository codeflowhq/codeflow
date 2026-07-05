import { useCallback, useState } from "react";

import { runVisualizationInBrowser } from "../../runtime/python-bridge";
import { buildVisualizationRuntimeConfig } from "../../runtime/runtime-config";
import { normalizeRuntimeError } from "../../runtime/runtime-errors";

import type { GlobalConfig, ManifestEntry, VariableConfig } from "../../shared/types/visualization";

export const useVisualizationRun = ({
  globalConfig,
  sessionRuntimeWheels = [],
  sourceCode,
  variableConfigs,
  watchVariables,
}: {
  globalConfig: GlobalConfig;
  sessionRuntimeWheels?: string[];
  sourceCode: string;
  variableConfigs: Record<string, VariableConfig>;
  watchVariables: string[];
}) => {
  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Provide code and run the visualizer.");

  const runVisualization = useCallback(async () => {
    setStatus("loading");
    setStatusMessage("Loading browser runtime…");
    try {
      const data = await runVisualizationInBrowser({
        snippet: sourceCode,
        watch: watchVariables.length ? watchVariables : undefined,
        config: buildVisualizationRuntimeConfig({ globalConfig, sessionRuntimeWheels, variableConfigs }),
      });
      setManifest(data.manifest ?? []);
      setStatus("ready");
      setStatusMessage("Visualization completed.");
    } catch (error) {
      const message = normalizeRuntimeError(error);
      setManifest([]);
      setStatus("error");
      setStatusMessage(message);
      throw error;
    }
  }, [globalConfig, sessionRuntimeWheels, sourceCode, variableConfigs, watchVariables]);

  return { manifest, runVisualization, setManifest, setStatusMessage, status, statusMessage };
};
