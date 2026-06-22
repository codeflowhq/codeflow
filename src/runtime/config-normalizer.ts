import { defaultGlobalConfig, defaultVariableConfig, VIEW_KIND_OPTIONS } from "../configDefaults";

import type { GlobalConfig, VariableConfig, ViewKind } from "../shared/types/visualization";

export const DEFAULT_RUNTIME_OUTPUT_FORMAT = "svg";
export const DEFAULT_AUTO_RECURSION_DEPTH_CAP = 6;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clampInteger = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number => {
  const resolved = isFiniteNumber(value) ? Math.trunc(value) : fallback;
  return Math.min(Math.max(resolved, minimum), maximum);
};

const normalizeViewKind = (value: unknown): ViewKind =>
  typeof value === "string" && VIEW_KIND_OPTIONS.includes(value as ViewKind)
    ? value as ViewKind
    : defaultVariableConfig.viewKind;

const normalizeTypeViewDefaults = (
  typeViewDefaults: GlobalConfig["typeViewDefaults"] | undefined,
): GlobalConfig["typeViewDefaults"] => Object.fromEntries(
  Object.entries(typeViewDefaults ?? {}).map(([typePattern, viewKind]) => [
    typePattern,
    viewKind === "auto" ? "auto" : normalizeViewKind(viewKind),
  ]),
);

const normalizeColor = (value: unknown): string => {
  if (typeof value !== "string") {
    return defaultVariableConfig.viewOptions.color;
  }
  const trimmed = value.trim();
  return trimmed || defaultVariableConfig.viewOptions.color;
};

export const normalizeGlobalConfig = (config: GlobalConfig): GlobalConfig => ({
  stepLimit: clampInteger(config.stepLimit, defaultGlobalConfig.stepLimit, 1, 500),
  maxDepth: clampInteger(config.maxDepth, defaultGlobalConfig.maxDepth, 1, 20),
  maxItemsPerView: clampInteger(config.maxItemsPerView, defaultGlobalConfig.maxItemsPerView, 1, 200),
  recursionDepthDefault: clampInteger(
    config.recursionDepthDefault,
    defaultGlobalConfig.recursionDepthDefault,
    -1,
    20,
  ),
  showTitles: Boolean(config.showTitles),
  customConverters: String(config.customConverters ?? ""),
  runtimePackages: String(config.runtimePackages ?? ""),
  runtimeWheels: String(config.runtimeWheels ?? ""),
  typeViewDefaults: normalizeTypeViewDefaults(config.typeViewDefaults),
});

export const normalizeVariableConfigs = (
  variableConfigs: Record<string, VariableConfig>,
): Record<string, VariableConfig> => Object.fromEntries(
  Object.entries(variableConfigs).map(([variableName, config]) => [
    variableName,
    {
      viewKind: normalizeViewKind(config?.viewKind),
      depth: config?.depth == null
        ? null
        : clampInteger(config.depth, defaultGlobalConfig.maxDepth, 0, 20),
      viewOptions: {
        color: normalizeColor(config?.viewOptions?.color),
      },
    },
  ]),
);
