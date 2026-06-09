import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { buildCollectionRecord } from "./collectionRecord";
import { useCollections } from "./useCollections";
import type {
  CollectionRecord,
  ExampleRecord,
  GlobalConfig,
  ManifestEntry,
  VariableConfig,
  VisualizationLayoutState,
} from "../../shared/types/visualization";

type MessageApi = {
  success: (message: string) => void;
};

type UseLibraryStoreOptions = {
  storageKey: string;
  defaultSnippet: string;
  defaultGlobalConfig: GlobalConfig;
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
  manifest: ManifestEntry[];
  layoutState: VisualizationLayoutState;
  messageApi: MessageApi;
  persistWatchVariables: Dispatch<SetStateAction<string[]>>;
  persistVariableConfigs: Dispatch<SetStateAction<Record<string, VariableConfig>>>;
  persistSourceCode: Dispatch<SetStateAction<string>>;
  persistGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  persistManifest: Dispatch<SetStateAction<ManifestEntry[]>>;
  persistLayoutState: (state: VisualizationLayoutState) => void;
  resetSelectionState: () => void;
  openVisualizationMain: () => void;
  requestExampleRun: () => void;
};

const EMPTY_LAYOUT_STATE: VisualizationLayoutState = {
  mode: "masonry",
  masonryOrder: [],
  windows: { layouts: {}, zIndices: {} },
};

export const useLibraryStore = ({
  storageKey,
  defaultSnippet,
  defaultGlobalConfig,
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  manifest,
  layoutState,
  messageApi,
  persistWatchVariables,
  persistVariableConfigs,
  persistSourceCode,
  persistGlobalConfig,
  persistManifest,
  persistLayoutState,
  resetSelectionState,
  openVisualizationMain,
  requestExampleRun,
}: UseLibraryStoreOptions) => {
  const { collections, persistCollections } = useCollections(storageKey);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [activeProjectName, setActiveProjectName] = useState("Untitled project");
  const [activeProjectDescription, setActiveProjectDescription] = useState("");
  const [activeProjectLabels, setActiveProjectLabels] = useState<string[]>([]);

  const handleSaveCollection = useCallback((nextName?: string, nextDescription?: string, nextLabels?: string[]) => {
    const trimmed = (nextName ?? activeProjectName).trim() || "Untitled project";
    const description = (nextDescription ?? activeProjectDescription).trim();
    const labels = (nextLabels ?? activeProjectLabels)
      .map((label) => label.trim())
      .filter(Boolean);
    const existingRecord = collections.find((record) => record.name.trim().toLowerCase() === trimmed.toLowerCase());
    const payload = buildCollectionRecord({
      name: trimmed,
      description,
      labels,
      sourceCode,
      watchVariables,
      globalConfig,
      variableConfigs,
      savedManifest: manifest,
      layoutState,
    });

    const nextRecord = existingRecord ? {
      ...existingRecord,
      ...payload,
      id: existingRecord.id,
    } : payload;
    const nextCollections = existingRecord
      ? [nextRecord, ...collections.filter((record) => record.id !== existingRecord.id)]
      : [nextRecord, ...collections];

    persistCollections(nextCollections);
    setSaveModalOpen(false);
    setActiveProjectName(trimmed);
    setActiveProjectDescription(description);
    setActiveProjectLabels(labels);
    messageApi.success(`${existingRecord ? "Updated" : "Saved"} collection ${trimmed}.`);
  }, [activeProjectDescription, activeProjectLabels, activeProjectName, collections, globalConfig, layoutState, manifest, messageApi, persistCollections, sourceCode, variableConfigs, watchVariables]);

  const handleLoadCollection = useCallback((record: CollectionRecord) => {
    persistSourceCode(record.sourceCode ?? defaultSnippet);
    persistWatchVariables(record.watchVariables ?? ["data"]);
    persistGlobalConfig(record.globalConfig ?? defaultGlobalConfig);
    persistVariableConfigs(record.variableConfigs ?? {});
    persistManifest(record.savedManifest ?? []);
    persistLayoutState(record.layoutState ?? EMPTY_LAYOUT_STATE);
    setActiveProjectName(record.name);
    setActiveProjectDescription(record.description ?? "");
    setActiveProjectLabels(record.labels ?? []);
    resetSelectionState();
    openVisualizationMain();
    messageApi.success(`Loaded ${record.name}.`);
  }, [
    defaultGlobalConfig,
    defaultSnippet,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
    persistLayoutState,
    persistSourceCode,
    persistVariableConfigs,
    persistWatchVariables,
    persistManifest,
    resetSelectionState,
  ]);

  const handleDeleteCollection = useCallback((record: CollectionRecord) => {
    persistCollections(collections.filter((item) => item.id !== record.id));
    messageApi.success(`Deleted ${record.name}.`);
  }, [collections, messageApi, persistCollections]);

  const handleLoadExample = useCallback((example: ExampleRecord) => {
    persistSourceCode(example.snippet);
    persistWatchVariables(example.watchVariables ?? ["data"]);
    persistGlobalConfig((prev) => ({ ...defaultGlobalConfig, ...prev, ...(example.globalConfig ?? {}) }));
    persistVariableConfigs(example.variableConfigs ?? {});
    persistManifest(example.savedManifest ?? []);
    persistLayoutState(EMPTY_LAYOUT_STATE);
    setActiveProjectName(example.title);
    setActiveProjectDescription(example.description ?? "");
    setActiveProjectLabels([]);
    resetSelectionState();
    openVisualizationMain();
    requestExampleRun();
    messageApi.success(`Loaded example ${example.title}.`);
  }, [
    defaultGlobalConfig,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
    persistLayoutState,
    persistSourceCode,
    persistVariableConfigs,
    persistWatchVariables,
    persistManifest,
    requestExampleRun,
    resetSelectionState,
  ]);

  return {
    activeProjectName,
    activeProjectDescription,
    activeProjectLabels,
    collections,
    saveModalOpen,
    setActiveProjectName,
    setActiveProjectDescription,
    setActiveProjectLabels,
    setSaveModalOpen,
    handleSaveCollection,
    handleLoadCollection,
    handleDeleteCollection,
    handleLoadExample,
  };
};
