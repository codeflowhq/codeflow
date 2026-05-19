import { TYPE_VIEW_DEFAULT_ROWS } from "../../configDefaults";
import type { GlobalConfig, VariableConfig, ViewKind } from "../../shared/types/visualization";

type VariableConfigRow = VariableConfig & { variable: string };
type TypeDefaultRow = {
  key: string;
  label: string;
  viewKind: ViewKind | "auto";
};

export const buildVariableConfigRows = (
  manifestVariables: string[],
  variableConfigs: Record<string, VariableConfig>,
  defaultVariableConfig: VariableConfig,
): VariableConfigRow[] => (
  manifestVariables.map((variable) => ({
    variable,
    ...(variableConfigs[variable] ?? defaultVariableConfig),
  }))
);

export const buildTypeDefaultRows = (
  typeViewDefaults: GlobalConfig["typeViewDefaults"] | undefined,
): TypeDefaultRow[] => (
  TYPE_VIEW_DEFAULT_ROWS.map((row) => ({
    ...row,
    viewKind: typeViewDefaults?.[row.key] ?? "auto",
  }))
);

export const updateTypeViewDefault = (
  previousConfig: GlobalConfig,
  typeKey: string,
  nextValue: ViewKind | "auto",
): GlobalConfig => ({
  ...previousConfig,
  typeViewDefaults: {
    ...(previousConfig.typeViewDefaults ?? {}),
    [typeKey]: nextValue,
  },
});
