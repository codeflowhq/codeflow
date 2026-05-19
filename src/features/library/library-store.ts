import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { buildCollectionRecord } from "./collectionRecord";
import { useCollections } from "./useCollections";
import type { CollectionRecord, ExampleRecord, GlobalConfig, ManifestEntry, VariableConfig } from "../../shared/types/visualization";

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
  messageApi: MessageApi;
  persistWatchVariables: Dispatch<SetStateAction<string[]>>;
  persistVariableConfigs: Dispatch<SetStateAction<Record<string, VariableConfig>>>;
  persistSourceCode: Dispatch<SetStateAction<string>>;
  persistGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  persistManifest: Dispatch<SetStateAction<ManifestEntry[]>>;
  resetSelectionState: () => void;
  openVisualizationMain: () => void;
  requestExampleRun: () => void;
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
  messageApi,
  persistWatchVariables,
  persistVariableConfigs,
  persistSourceCode,
  persistGlobalConfig,
  persistManifest,
  resetSelectionState,
  openVisualizationMain,
  requestExampleRun,
}: UseLibraryStoreOptions) => {
  const { collections, persistCollections } = useCollections(storageKey);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [activeProjectName, setActiveProjectName] = useState("Untitled project");

  const handleSaveCollection = useCallback(() => {
    const trimmed = activeProjectName.trim() || "Untitled project";
    const payload = buildCollectionRecord({
      name: trimmed,
      sourceCode,
      watchVariables,
      globalConfig,
      variableConfigs,
      savedManifest: manifest,
    });

    persistCollections([payload, ...collections]);
    setSaveModalOpen(false);
    setActiveProjectName(trimmed);
    messageApi.success(`Saved collection ${trimmed}.`);
  }, [activeProjectName, collections, globalConfig, manifest, messageApi, persistCollections, sourceCode, variableConfigs, watchVariables]);

  const handleLoadCollection = useCallback((record: CollectionRecord) => {
    persistSourceCode(record.sourceCode ?? defaultSnippet);
    persistWatchVariables(record.watchVariables ?? ["data"]);
    persistGlobalConfig(record.globalConfig ?? defaultGlobalConfig);
    persistVariableConfigs(record.variableConfigs ?? {});
    persistManifest(record.savedManifest ?? []);
    setActiveProjectName(record.name);
    resetSelectionState();
    openVisualizationMain();
    messageApi.success(`Loaded ${record.name}.`);
  }, [
    defaultGlobalConfig,
    defaultSnippet,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
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
    setActiveProjectName(example.title);
    resetSelectionState();
    openVisualizationMain();
    requestExampleRun();
    messageApi.success(`Loaded example ${example.title}.`);
  }, [
    defaultGlobalConfig,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
    persistSourceCode,
    persistVariableConfigs,
    persistWatchVariables,
    persistManifest,
    requestExampleRun,
    resetSelectionState,
  ]);

  return {
    activeProjectName,
    collections,
    saveModalOpen,
    setActiveProjectName,
    setSaveModalOpen,
    handleSaveCollection,
    handleLoadCollection,
    handleDeleteCollection,
    handleLoadExample,
  };
};
