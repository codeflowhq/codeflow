import type {
  CollectionRecord,
  GlobalConfig,
  ManifestEntry,
  VariableConfig,
  VisualizationLayoutState,
} from "../../shared/types/visualization";
import { cloneLayoutState } from "../visualization/layout-state";

type BuildCollectionRecordOptions = {
  name: string;
  description?: string;
  labels?: string[];
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
  savedManifest: ManifestEntry[];
  layoutState: VisualizationLayoutState;
};

export const buildCollectionRecord = ({
  name,
  description,
  labels,
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  savedManifest,
  layoutState,
}: BuildCollectionRecordOptions): CollectionRecord => ({
  id: crypto.randomUUID(),
  name,
  description,
  labels,
  savedAt: new Date().toISOString(),
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  savedManifest,
  layoutState: cloneLayoutState(layoutState),
});
