import type { GlobalConfig, RuntimeVisualizationConfig, VariableConfig } from "../shared/types/visualization";

const splitCsv = (value: string): string[] => String(value ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export const buildVisualizationRuntimeConfig = ({
  globalConfig,
  variableConfigs,
}: {
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
}): RuntimeVisualizationConfig => ({
  step_limit: globalConfig.stepLimit,
  output_format: globalConfig.outputFormat,
  max_depth: globalConfig.maxDepth,
  max_items_per_view: globalConfig.maxItemsPerView,
  recursion_depth_default: globalConfig.recursionDepthDefault,
  auto_recursion_depth_cap: globalConfig.autoRecursionDepthCap,
  show_titles: globalConfig.showTitles,
  custom_converters: splitCsv(globalConfig.customConverters),
  type_view_defaults: globalConfig.typeViewDefaults ?? {},
  runtime_packages: splitCsv(globalConfig.runtimePackages),
  runtime_wheels: splitCsv(globalConfig.runtimeWheels),
  variable_configs: Object.fromEntries(
    Object.entries(variableConfigs).map(([variableName, config]) => [
      variableName,
      {
        view_kind: config.viewKind,
        ...(config.depth != null ? { depth: config.depth } : {}),
        view_options: config.viewOptions,
      },
    ]),
  ),
});
