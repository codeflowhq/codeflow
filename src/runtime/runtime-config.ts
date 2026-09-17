import type { GlobalConfig, OverlayGroup, RuntimeVisualizationConfig, VariableConfig } from "../shared/types/visualization";

import {
  DEFAULT_AUTO_RECURSION_DEPTH_CAP,
  DEFAULT_RUNTIME_OUTPUT_FORMAT,
  normalizeGlobalConfig,
  normalizeVariableConfigs,
} from "./config-normalizer";

const splitCsv = (value: string): string[] => String(value ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export const buildVisualizationRuntimeConfig = ({
  globalConfig,
  sessionRuntimeWheels = [],
  variableConfigs,
  overlayGroups = [],
}: {
  globalConfig: GlobalConfig;
  sessionRuntimeWheels?: string[];
  variableConfigs: Record<string, VariableConfig>;
  overlayGroups?: OverlayGroup[];
}): RuntimeVisualizationConfig => {
  const normalizedGlobalConfig = normalizeGlobalConfig(globalConfig);
  const normalizedVariableConfigs = normalizeVariableConfigs(variableConfigs);
  const validOverlayGroups = overlayGroups.filter((group) => (
    group.variables.length >= 2
    && group.layerOrder.length === group.variables.length
    && group.variables.every((variable) => {
      const viewKind = normalizedVariableConfigs[variable]?.viewKind;
      return viewKind === "line" || viewKind === "scatter";
    })
  ));

  return {
    step_limit: normalizedGlobalConfig.stepLimit,
    output_format: DEFAULT_RUNTIME_OUTPUT_FORMAT,
    max_depth: normalizedGlobalConfig.maxDepth,
    max_items_per_view: normalizedGlobalConfig.maxItemsPerView,
    recursion_depth_default: normalizedGlobalConfig.recursionDepthDefault,
    auto_recursion_depth_cap: DEFAULT_AUTO_RECURSION_DEPTH_CAP,
    show_titles: normalizedGlobalConfig.showTitles,
    custom_converters: splitCsv(normalizedGlobalConfig.customConverters),
    type_view_defaults: normalizedGlobalConfig.typeViewDefaults,
    runtime_packages: splitCsv(normalizedGlobalConfig.runtimePackages),
    runtime_wheels: [...splitCsv(normalizedGlobalConfig.runtimeWheels), ...sessionRuntimeWheels],
    overlay_groups: validOverlayGroups.map((group) => ({
      id: group.id,
      variables: [...group.variables],
      layer_order: [...group.layerOrder],
    })),
    variable_configs: Object.fromEntries(
      Object.entries(normalizedVariableConfigs).map(([variableName, config]) => [
        variableName,
        {
          view_kind: config.viewKind,
          ...(config.depth != null ? { depth: config.depth } : {}),
          view_options: { ...config.viewOptions, barColor: config.viewOptions.color },
        },
      ]),
    ),
  };
};
