import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { buildCollectionRecord } from "./collectionRecord";
import { useCollections } from "./useCollections";
import { cloneLayoutState, EMPTY_LAYOUT_STATE } from "../visualization/layout-state";
import type {
  CollectionRecord,
  ExampleRecord,
  GlobalConfig,
  ManifestEntry,
  VariableConfig,
  VisualizationLayoutState,
} from "../../shared/types/visualization";

type ProjectSnapshot = {
  name: string;
  description: string;
  labels: string[];
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
  savedManifest: ManifestEntry[];
  layoutState: VisualizationLayoutState;
};

const normalizeProjectLabels = (labels: string[]) => labels
  .map((label) => label.trim())
  .filter(Boolean)
  .sort((left, right) => left.localeCompare(right));

const buildProjectSnapshot = ({
  name,
  description,
  labels,
  sourceCode,
  watchVariables,
  globalConfig,
  variableConfigs,
  savedManifest,
  layoutState,
}: ProjectSnapshot): ProjectSnapshot => ({
  name: name.trim() || "Untitled project",
  description: description.trim(),
  labels: normalizeProjectLabels(labels),
  sourceCode,
  watchVariables: [...watchVariables],
  globalConfig,
  variableConfigs,
  savedManifest,
  layoutState: cloneLayoutState(layoutState),
});

const snapshotsMatch = (left: ProjectSnapshot, right: ProjectSnapshot) =>
  JSON.stringify(left) === JSON.stringify(right);

const buildUniqueProjectName = (
  requestedName: string,
  collections: CollectionRecord[],
  excludeId?: string | null,
): string => {
  const trimmed = requestedName.trim() || "Untitled project";
  const existingNames = new Set(
    collections
      .filter((record) => record.id !== excludeId)
      .map((record) => record.name.trim().toLowerCase())
      .filter(Boolean),
  );
  if (!existingNames.has(trimmed.toLowerCase())) {
    return trimmed;
  }
  let suffix = 1;
  while (existingNames.has(`${trimmed} ${suffix}`.toLowerCase())) {
    suffix += 1;
  }
  return `${trimmed} ${suffix}`;
};

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

const EMPTY_PROJECT_SNIPPET = "";

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
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectName, setActiveProjectName] = useState("Untitled project");
  const [activeProjectDescription, setActiveProjectDescription] = useState("");
  const [activeProjectLabels, setActiveProjectLabels] = useState<string[]>([]);
  const currentSnapshot = buildProjectSnapshot({
    name: activeProjectName,
    description: activeProjectDescription,
    labels: activeProjectLabels,
    sourceCode,
    watchVariables,
    globalConfig,
    variableConfigs,
    savedManifest: manifest,
    layoutState,
  });
  const blankSnapshot = buildProjectSnapshot({
    name: "Untitled project",
    description: "",
    labels: [],
    sourceCode: EMPTY_PROJECT_SNIPPET,
    watchVariables: ["data"],
    globalConfig: defaultGlobalConfig,
    variableConfigs: {},
    savedManifest: [],
    layoutState: EMPTY_LAYOUT_STATE,
  });
  const savedSnapshot = activeProjectId
    ? collections.find((record) => record.id === activeProjectId)
    : collections.find(
      (record) => record.name.trim().toLowerCase() === currentSnapshot.name.toLowerCase(),
    );
  const hasUnsavedChanges = savedSnapshot
    ? !snapshotsMatch(
      currentSnapshot,
      buildProjectSnapshot({
        name: savedSnapshot.name,
        description: savedSnapshot.description ?? "",
        labels: savedSnapshot.labels ?? [],
        sourceCode: savedSnapshot.sourceCode,
        watchVariables: savedSnapshot.watchVariables ?? ["data"],
        globalConfig: savedSnapshot.globalConfig,
        variableConfigs: savedSnapshot.variableConfigs ?? {},
        savedManifest: savedSnapshot.savedManifest ?? [],
        layoutState: savedSnapshot.layoutState ?? EMPTY_LAYOUT_STATE,
      }),
    )
    : !snapshotsMatch(currentSnapshot, blankSnapshot);

  const handleSaveCollection = useCallback((nextName?: string, nextDescription?: string, nextLabels?: string[]) => {
    const existingRecord = activeProjectId
      ? collections.find((record) => record.id === activeProjectId) ?? null
      : null;
    const trimmed = buildUniqueProjectName(
      nextName ?? activeProjectName,
      collections,
      existingRecord?.id ?? null,
    );
    const description = (nextDescription ?? activeProjectDescription).trim();
    const labels = (nextLabels ?? activeProjectLabels)
      .map((label) => label.trim())
      .filter(Boolean);
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
    const nextRecord = existingRecord
      ? { ...payload, id: existingRecord.id }
      : payload;
    const nextCollections = existingRecord
      ? [nextRecord, ...collections.filter((record) => record.id !== existingRecord.id)]
      : [nextRecord, ...collections];

    persistCollections(nextCollections);
    setSaveModalOpen(false);
    setActiveProjectId(nextRecord.id);
    setActiveProjectName(trimmed);
    setActiveProjectDescription(description);
    setActiveProjectLabels(labels);
    messageApi.success(`${existingRecord ? "Updated" : "Saved"} collection ${trimmed}.`);
  }, [activeProjectDescription, activeProjectId, activeProjectLabels, activeProjectName, collections, globalConfig, layoutState, manifest, messageApi, persistCollections, sourceCode, variableConfigs, watchVariables]);

  const handleLoadCollection = useCallback((record: CollectionRecord) => {
    persistSourceCode(record.sourceCode ?? defaultSnippet);
    persistWatchVariables(record.watchVariables ?? ["data"]);
    persistGlobalConfig(record.globalConfig ?? defaultGlobalConfig);
    persistVariableConfigs(record.variableConfigs ?? {});
    persistManifest(record.savedManifest ?? []);
    persistLayoutState(cloneLayoutState(record.layoutState ?? EMPTY_LAYOUT_STATE));
    setActiveProjectId(record.id);
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
    persistLayoutState(cloneLayoutState(EMPTY_LAYOUT_STATE));
    setActiveProjectId(null);
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

  const handleCreateProject = useCallback(() => {
    persistSourceCode(EMPTY_PROJECT_SNIPPET);
    persistWatchVariables([]);
    persistGlobalConfig(defaultGlobalConfig);
    persistVariableConfigs({});
    persistManifest([]);
    persistLayoutState(cloneLayoutState(EMPTY_LAYOUT_STATE));
    setActiveProjectId(null);
    setActiveProjectName("Untitled project");
    setActiveProjectDescription("");
    setActiveProjectLabels([]);
    resetSelectionState();
    openVisualizationMain();
    messageApi.success("Started a new project.");
  }, [
    defaultGlobalConfig,
    messageApi,
    openVisualizationMain,
    persistGlobalConfig,
    persistLayoutState,
    persistManifest,
    persistSourceCode,
    persistVariableConfigs,
    persistWatchVariables,
    resetSelectionState,
  ]);

  return {
    activeProjectName,
    activeProjectDescription,
    activeProjectLabels,
    activeProjectId,
    hasSavedProject: activeProjectId !== null,
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
    handleCreateProject,
    hasUnsavedChanges,
  };
};
