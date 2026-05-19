export type ViewKind =
  | "auto"
  | "array_cells"
  | "matrix"
  | "table"
  | "hash_table"
  | "linked_list"
  | "heap_dual"
  | "bar"
  | "tree"
  | "graph"
  | "image";

export type VariableViewOptions = {
  barColor: string;
};

export type VariableConfig = {
  viewKind: ViewKind;
  depth: number | null;
  viewOptions: VariableViewOptions;
};

export type GlobalConfig = {
  stepLimit: number;
  outputFormat: "dot" | "svg" | "png" | "jpg";
  maxDepth: number;
  maxItemsPerView: number;
  recursionDepthDefault: number;
  autoRecursionDepthCap: number;
  showTitles: boolean;
  customConverters: string;
  runtimePackages: string;
  runtimeWheels: string;
  typeViewDefaults: Record<string, ViewKind | "auto">;
};

export type RawStepMeta = {
  line_number?: number;
  execution_id?: number;
  order?: number;
};

export type RawManifestStep = {
  step_id?: string;
  stepId?: string;
  timeline_key?: string;
  timelineKey?: string;
  execution_id?: number;
  executionId?: number;
  order?: number;
  index?: number;
  dot?: string;
  svg?: string;
  meta?: RawStepMeta;
};

export type RawManifestEntry = {
  variable: string;
  kind: "dot" | "svg";
  compatible_view_kinds?: ViewKind[];
  compatibleViewKinds?: ViewKind[];
  steps?: RawManifestStep[];
};

export type ManifestStep = {
  stepId: string;
  timelineKey: string;
  executionId: number | null;
  order: number | null;
  index: number;
  dot?: string;
  svg?: string;
  meta?: RawStepMeta;
};

export type ManifestEntry = {
  variable: string;
  kind: "dot" | "svg";
  compatibleViewKinds?: ViewKind[];
  steps: ManifestStep[];
};

export type NormalizedManifest = {
  manifest: ManifestEntry[];
};

export type RawManifestPayload = {
  manifest?: RawManifestEntry[];
};

export type RuntimeVisualizationConfig = {
  step_limit: number;
  output_format: "dot" | "svg" | "png" | "jpg";
  max_depth: number;
  max_items_per_view: number;
  recursion_depth_default: number;
  auto_recursion_depth_cap: number;
  show_titles: boolean;
  custom_converters: string[];
  type_view_defaults: Record<string, ViewKind | "auto">;
  runtime_packages: string[];
  runtime_wheels: string[];
  variable_configs: Record<string, {
    view_kind: ViewKind | "auto";
    depth?: number;
    view_options: VariableViewOptions;
  }>;
};

export type TopMenuKey = "visualization" | "library";
export type VizMenuKey = "main" | "config";

export type CollectionRecord = {
  id: string;
  name: string;
  savedAt: string;
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
  savedManifest?: ManifestEntry[];
};

export type ExampleRecord = {
  key: string;
  title: string;
  description: string;
  snippet: string;
  watchVariables?: string[];
  globalConfig?: Partial<GlobalConfig>;
  variableConfigs?: Record<string, VariableConfig>;
  savedManifest?: ManifestEntry[];
  tags?: string[];
};
