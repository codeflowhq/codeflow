import { useCallback, useState } from "react";

import { runVisualizationInBrowser } from "../../runtime/python-bridge";
import { buildVisualizationRuntimeConfig } from "../../runtime/runtime-config";
import { normalizeRuntimeError } from "../../runtime/runtime-errors";

import type { GlobalConfig, ManifestEntry, VariableConfig } from "../../shared/types/visualization";

const DEFINITION_ONLY_HINT = "You defined a function or class, but nothing called it. Call the function and assign the result to a watched variable, for example: data = bubble_sort([5, 1, 4, 2, 8])";
const MISSING_WATCH_HINT = "Choose variables to observe with + Add or Select variables, then run again.";
const EMPTY_RESULT_HINT = "Code ran, but the current watched variables did not produce a renderable result.";

const getTopLevelSourceLines = (sourceCode: string) =>
  sourceCode
    .split("\n")
    .map((line) => ({
      raw: line,
      trimmed: line.trim(),
      isTopLevel: line.trim().length > 0 && !/^\s/.test(line),
    }))
    .filter((line) => line.trimmed && !line.trimmed.startsWith("#"));

const looksLikeDefinitionOnlySource = (sourceCode: string) => {
  const lines = getTopLevelSourceLines(sourceCode);
  if (lines.length === 0) {
    return false;
  }
  const topLevelLines = lines.filter((line) => line.isTopLevel).map((line) => line.trimmed);
  if (topLevelLines.length === 0) {
    return false;
  }
  const hasDefinition = topLevelLines.some((line) => line.startsWith("def ") || line.startsWith("class "));
  if (!hasDefinition) {
    return false;
  }
  const hasTopLevelAssignment = topLevelLines.some((line) => /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line));
  const hasLikelyInvocation = topLevelLines.some((line) =>
    /\w+\s*\(/.test(line)
    && !line.startsWith("def ")
    && !line.startsWith("class ")
    && !line.startsWith("for ")
    && !line.startsWith("if ")
    && !line.startsWith("while ")
    && !line.startsWith("return ")
    && !line.startsWith("print("),
  );
  return !hasTopLevelAssignment && !hasLikelyInvocation;
};

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
  const [statusMessage, setStatusMessage] = useState("");

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
      if ((data.manifest ?? []).length === 0) {
        if (watchVariables.length === 0) {
          setStatusMessage(MISSING_WATCH_HINT);
        } else if (looksLikeDefinitionOnlySource(sourceCode)) {
          setStatusMessage(DEFINITION_ONLY_HINT);
        } else {
          setStatusMessage(EMPTY_RESULT_HINT);
        }
      } else {
        setStatusMessage("");
      }
      return true;
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
