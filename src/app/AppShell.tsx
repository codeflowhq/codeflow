import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { App as AntApp, Button, Layout, Modal, Typography } from "antd";

import { EXAMPLE_LIBRARY, defaultSnippet } from "../data/examples";
import {
  extractCandidateVariables,
  getWatchExpressionRoot,
  isPythonIdentifier,
  isWatchExpression,
} from "../shared/lib/watch-expressions";
import {
  COLLECTIONS_STORAGE_KEY,
  defaultGlobalConfig,
  defaultVariableConfig,
  SHARE_PARAM,
  VIEW_KIND_OPTIONS,
} from "../configDefaults";
import { useEditorDecorations } from "../features/editor/useEditorDecorations";
import { useSettingsStore } from "../features/settings/settings-store";
import { useRuntimeBootstrap } from "../features/workspace/useRuntimeBootstrap";
import { useShareState } from "../hooks/useShareState";
import { useExportState } from "../hooks/useExportState";
import { useTimelinePlayback } from "../features/visualization/useTimelinePlayback";
import { useVariableWatch } from "../features/watch/useVariableWatch";
import { useVisualizationRun } from "../features/visualization/useVisualizationRun";
import { useLayoutModeState } from "../features/visualization/layout-mode";
import { useLibraryStore } from "../features/library/library-store";
import { useNavigationState } from "../features/navigation/useNavigationState";
import { AppRoutes } from "./routes";
import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { useGlobalErrorHandling } from "../shared/hooks/useGlobalErrorHandling";
import { useActionBoundary } from "../shared/hooks/useActionBoundary";
import { TOP_MENU_LIBRARY } from "../features/navigation/navigationState";
import FeatureBoundary from "../shared/ui/FeatureBoundary";
import type { CollectionRecord, ExampleRecord, ViewKind } from "../shared/types/visualization";
import "antd/dist/reset.css";
import "../App.css";

const VariableConfigDrawer = lazy(() => import("../components/VariableConfigDrawer"));
const SaveCollectionModal = lazy(() => import("../components/SaveCollectionModal"));

const { Header, Content } = Layout;
const { Text } = Typography;

const normalizeActionError = (fallback: string) => (error: unknown) =>
  error instanceof Error && error.message ? error.message : fallback;

function App() {
  const { message: messageApi } = AntApp.useApp();
  const [modal, modalContextHolder] = Modal.useModal();
  const [exampleRunRequestId, setExampleRunRequestId] = useState(0);
  const handledExampleRunRequestId = useRef(0);
  const [sourceCode, setSourceCode] = useState(defaultSnippet);
  const [globalConfig, setGlobalConfig] = useState(defaultGlobalConfig);
  const [exportSources, setExportSources] = useState<Record<string, string>>({});
  const navigation = useNavigationState();

  const candidateVariables = useMemo(() => extractCandidateVariables(sourceCode), [sourceCode]);

  const showErrorModal = useCallback((title: string, content: string) => {
    modal.error({ title, content, centered: true });
  }, [modal]);

  useGlobalErrorHandling(showErrorModal);
  const { runAction, runRuntimeAction } = useActionBoundary({ onError: showErrorModal });

  const {
    watchList,
    configState,
    handleAddWatchVariable,
    handleOpenVariableConfig,
    handleSubmitWatchExpression,
  } = useVariableWatch({
    defaultVariableConfig,
    initialWatchVariables: ["data"],
    isWatchExpression,
    getWatchExpressionRoot,
    availableVariableRoots: candidateVariables,
    messageApi,
  });

  const draftHighlightIdentifier = useMemo(() => {
    if (!watchList.advancedSelectionOpen) {
      return null;
    }
    const root = getWatchExpressionRoot(watchList.watchDraft);
    return root && candidateVariables.includes(root) ? root : null;
  }, [candidateVariables, watchList.advancedSelectionOpen, watchList.watchDraft]);

  const advancedSelectionState = useMemo(() => {
    if (!watchList.advancedSelectionOpen) {
      return { status: "idle" as const, message: "" };
    }

    const draft = watchList.watchDraft.trim();
    if (!draft) {
      return {
        status: "idle" as const,
        message: "Type an expression to preview the matching variable.",
      };
    }

    if (!isWatchExpression(draft)) {
      return { status: "error" as const, message: "Invalid watch expression." };
    }

    const root = getWatchExpressionRoot(draft);
    if (!root) {
      return {
        status: "warning" as const,
        message: "Choose an expression rooted at a detected variable.",
      };
    }

    if (!candidateVariables.includes(root)) {
      return { status: "warning" as const, message: `Unknown variable: ${root}.` };
    }

    return { status: "match" as const, message: `Matched variable: ${root}` };
  }, [candidateVariables, watchList.advancedSelectionOpen, watchList.watchDraft]);

  const runtimeReady = useRuntimeBootstrap({ onError: showErrorModal });
  const layoutState = useLayoutModeState();

  const {
    manifest,
    runVisualization,
    setManifest,
    setStatusMessage,
    status,
    statusMessage,
  } = useVisualizationRun({
    globalConfig,
    sourceCode,
    variableConfigs: configState.variableConfigs,
    watchVariables: watchList.watchVariables,
  });

  const timelineState = useTimelinePlayback(manifest);

  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);
  const activeExecutionLine = useMemo(() => {
    for (const entry of manifest) {
      const step = entry.steps.find((candidate) => candidate.timelineKey === timelineState.activeTimelineKey);
      if (step?.meta?.line_number) {
        return Number(step.meta.line_number);
      }
    }
    return null;
  }, [manifest, timelineState.activeTimelineKey]);

  const { handleEditorMount } = useEditorDecorations({
    activeExecutionLine,
    isPythonIdentifier,
    selectableIdentifiers: candidateVariables,
    draftHighlightIdentifier,
    onIdentifierClick: (identifier) => {
      watchList.setSelectedVariable(identifier);
      if (watchList.selectionLocked) {
        handleAddWatchVariable(identifier);
      }
    },
    selectionEnabled: watchList.selectionLocked,
  });

  const { handleShare } = useShareState({
    defaultGlobalConfig,
    defaultSnippet,
    globalConfig,
    messageApi,
    setGlobalConfig,
    setSourceCode,
    setStatusMessage,
    setTopMenuKey: navigation.setTopMenuKey,
    setVariableConfigs: configState.setVariableConfigs,
    setVizMenuKey: navigation.setVizMenuKey,
    setWatchVariables: watchList.setWatchVariables,
    shareParam: SHARE_PARAM,
    sourceCode,
    variableConfigs: configState.variableConfigs,
    watchVariables: watchList.watchVariables,
  });



  const editorOptions = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      wordWrap: "on" as const,
      automaticLayout: true,
      glyphMargin: true,
      padding: { top: 12, bottom: 12 },
    }),
    [],
  );

  const resetSelectionState = useCallback(() => {
    watchList.setSelectedVariable(null);
    watchList.setSelectionLocked(false);
    watchList.setAdvancedSelectionOpen(false);
  }, [watchList]);

  const libraryState = useLibraryStore({
    storageKey: COLLECTIONS_STORAGE_KEY,
    defaultSnippet,
    defaultGlobalConfig,
    sourceCode,
    watchVariables: watchList.watchVariables,
    globalConfig,
    variableConfigs: configState.variableConfigs,
    manifest,
    messageApi,
    persistWatchVariables: watchList.setWatchVariables,
    persistVariableConfigs: configState.setVariableConfigs,
    persistSourceCode: setSourceCode,
    persistGlobalConfig: setGlobalConfig,
    persistManifest: setManifest,
    layoutState: layoutState.layoutState,
    persistLayoutState: layoutState.replaceLayoutState,
    resetSelectionState,
    openVisualizationMain: navigation.openVisualizationMain,
    requestExampleRun: () => setExampleRunRequestId((prev) => prev + 1),
  });

  const { handleExport } = useExportState({
    activeTimelineKey: timelineState.activeTimelineKey,
    exportSources,
    messageApi,
    projectName: libraryState.activeProjectName,
  });

  const { setSaveModalOpen } = libraryState;
  const openSaveModal = useCallback(() => {
    setSaveModalOpen(true);
  }, [setSaveModalOpen]);

  const handleRunVisualization = useCallback(async () => {
    configState.closeConfigDrawer();
    await runRuntimeAction(() => runVisualization(), "Visualization failed");
  }, [configState, runRuntimeAction, runVisualization]);

  useEffect(() => {
    if (!runtimeReady || exampleRunRequestId === 0 || handledExampleRunRequestId.current === exampleRunRequestId) {
      return;
    }
    handledExampleRunRequestId.current = exampleRunRequestId;
    void handleRunVisualization();
  }, [exampleRunRequestId, handleRunVisualization, runtimeReady]);

  const variablePanelConfigs = useMemo(
    () => Object.fromEntries(manifestVariables.map((name) => [name, configState.variableConfigs[name] ?? defaultVariableConfig])),
    [configState.variableConfigs, manifestVariables],
  );
  const manifestViewKindsByVariable = useMemo(
    () => Object.fromEntries(manifest.map((entry) => [entry.variable, entry.compatibleViewKinds ?? VIEW_KIND_OPTIONS])) as Record<string, ViewKind[]>,
    [manifest],
  );
  const configurableVariables = useMemo(
    () => Array.from(new Set([
      ...watchList.watchVariables,
      ...configState.pendingWatchVariables,
      ...(configState.configDrawerVariable ? [configState.configDrawerVariable] : []),
    ])),
    [configState.configDrawerVariable, configState.pendingWatchVariables, watchList.watchVariables],
  );
  const viewKindOptionsByVariable = useMemo<Record<string, ViewKind[]>>(() => Object.fromEntries(
    configurableVariables.map((variableName) => {
      const compatible = manifestViewKindsByVariable[variableName];
      const currentView = configState.variableConfigs[variableName]?.viewKind;
      if (!compatible?.length) {
        return [variableName, currentView && currentView !== "auto" ? ["auto", currentView] : ["auto"]];
      }
      if (currentView && !compatible.includes(currentView)) {
        return [variableName, [currentView, ...compatible]];
      }
      return [variableName, compatible];
    }),
  ) as Record<string, ViewKind[]>, [configState.variableConfigs, configurableVariables, manifestViewKindsByVariable]);

  const handleOpenVariableConfigWithResolvedViews = useCallback(async (variableName: string) => {
    const alreadyResolved = (manifestViewKindsByVariable[variableName] ?? []).length > 0;
    if (!alreadyResolved && watchList.watchVariables.includes(variableName) && runtimeReady && sourceCode.trim().length > 0) {
      await handleRunVisualization();
    }
    handleOpenVariableConfig(variableName);
  }, [handleOpenVariableConfig, handleRunVisualization, manifestViewKindsByVariable, runtimeReady, sourceCode, watchList.watchVariables]);

  const handleRemoveWatchVariable = useCallback((variableName: string) => {
    watchList.removeWatchVariable(variableName);
    configState.clearPendingWatchConfig(variableName);
    setExportSources((prev) => {
      if (!(variableName in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[variableName];
      return next;
    });
  }, [configState, watchList]);

  const watchUiState = useMemo(() => ({
    advancedSelectionState,
    candidateVariables,
    selectedVariable: watchList.selectedVariable,
    selectionLocked: watchList.selectionLocked,
    setSelectedVariable: watchList.setSelectedVariable,
    setSelectionLocked: watchList.setSelectionLocked,
    advancedSelectionOpen: watchList.advancedSelectionOpen,
    setAdvancedSelectionOpen: watchList.setAdvancedSelectionOpen,
    watchDraft: watchList.watchDraft,
    setWatchDraft: watchList.setWatchDraft,
    watchVariables: watchList.watchVariables,
    pendingWatchVariables: configState.pendingWatchVariables,
    removeWatchVariable: handleRemoveWatchVariable,
    handleAddWatchVariable,
    handleOpenVariableConfig: handleOpenVariableConfigWithResolvedViews,
    handleSubmitWatchExpression,
  }), [
    advancedSelectionState,
    candidateVariables,
    configState.pendingWatchVariables,
    handleAddWatchVariable,
    handleRemoveWatchVariable,
    handleOpenVariableConfigWithResolvedViews,
    handleSubmitWatchExpression,
    watchList.advancedSelectionOpen,
    watchList.selectedVariable,
    watchList.selectionLocked,
    watchList.setAdvancedSelectionOpen,
    watchList.setSelectedVariable,
    watchList.setSelectionLocked,
    watchList.setWatchDraft,
    watchList.watchDraft,
    watchList.watchVariables,
  ]);

  const editorState = useMemo(() => ({
    editorOptions,
    handleEditorMount,
    runtimeReady,
    setSourceCode,
    sourceCode,
    status,
    statusMessage,
  }), [editorOptions, handleEditorMount, runtimeReady, sourceCode, status, statusMessage]);

  const handleExportProject = useCallback(async () => {
    await runAction(() => handleExport(), {
      title: "Export failed",
      normalize: normalizeActionError("Could not export the current visualization."),
    });
  }, [handleExport, runAction]);

  const handleShareProject = useCallback(async () => {
    await runAction(() => handleShare(), {
      title: "Share failed",
      normalize: normalizeActionError("Could not create a share link."),
    });
  }, [handleShare, runAction]);

  const handleLoadCollection = useCallback(async (record: CollectionRecord) => {
    await runAction(() => Promise.resolve(libraryState.handleLoadCollection(record)), {
      title: "Load project failed",
      normalize: normalizeActionError(`Could not load ${record.name}.`),
    });
  }, [libraryState, runAction]);

  const handleDeleteCollection = useCallback(async (record: CollectionRecord) => {
    await runAction(() => Promise.resolve(libraryState.handleDeleteCollection(record)), {
      title: "Delete project failed",
      normalize: normalizeActionError(`Could not delete ${record.name}.`),
    });
  }, [libraryState, runAction]);

  const handleLoadExample = useCallback(async (example: ExampleRecord) => {
    await runAction(() => Promise.resolve(libraryState.handleLoadExample(example)), {
      title: "Load example failed",
      normalize: normalizeActionError(`Could not load ${example.title}.`),
    });
  }, [libraryState, runAction]);

  const pageActions = useMemo(() => ({
    runVisualization: handleRunVisualization,
    openSettings: navigation.openVisualizationConfig,
    openCollections: navigation.openLibrary,
    openSaveModal,
    exportProject: handleExportProject,
    shareProject: handleShareProject,
  }), [handleExportProject, handleRunVisualization, handleShareProject, navigation.openLibrary, navigation.openVisualizationConfig, openSaveModal]);

  const wrappedLibraryState = useMemo(() => ({
    ...libraryState,
    handleDeleteCollection,
    handleLoadCollection,
    handleLoadExample,
  }), [handleDeleteCollection, handleLoadCollection, handleLoadExample, libraryState]);

  const { configPageProps, libraryPageProps } = useSettingsStore({
    manifestVariables,
    variableConfigs: configState.variableConfigs,
    globalConfig,
    setGlobalConfig,
    handleOpenVariableConfig: handleOpenVariableConfigWithResolvedViews,
    libraryState: wrappedLibraryState,
    examples: EXAMPLE_LIBRARY,
  });

  const workspaceValue = useMemo(() => ({
    editorState,
    pageActions,
    timelineState,
    variableConfigs: variablePanelConfigs,
    visualState: {
      manifest,
      exportSources,
      layoutState: layoutState.layoutState,
      setLayoutMode: layoutState.setLayoutMode,
      setExportSource: (variable: string, svg: string | null) => setExportSources((prev) => {
        if (!svg) {
          if (!(variable in prev)) {
            return prev;
          }
          const next = { ...prev };
          delete next[variable];
          return next;
        }
        if (prev[variable] === svg) {
          return prev;
        }
        return { ...prev, [variable]: svg };
      }),
      setMasonryOrder: layoutState.setMasonryOrder,
      setWindowLayout: layoutState.setWindowLayout,
      setWindowZIndex: layoutState.setWindowZIndex,
    },
    watchState: watchUiState,
  }), [editorState, exportSources, layoutState, manifest, pageActions, timelineState, variablePanelConfigs, watchUiState]);

  return (
    <>
      <Layout className="app-layout">
        <Header className="app-header compact-app-header">
          <Button type="text" className="app-brand-button" onClick={navigation.openVisualizationMain}>
            <span className="app-brand-mark">CF</span>
            <span className="app-brand-name">CodeFlow</span>
          </Button>
          <Button type={navigation.topMenuKey === TOP_MENU_LIBRARY ? "primary" : "default"} onClick={navigation.openLibrary}>
            Collections
          </Button>
        </Header>

        <Content className="app-content compact-app-content">
          <AppErrorBoundary onError={showErrorModal}>
            <AppRoutes
              navigation={navigation}
              projectName={libraryState.activeProjectName}
              projectDescription={libraryState.activeProjectDescription}
              projectLabels={libraryState.activeProjectLabels}
              availableLabels={Array.from(new Set(libraryState.collections.flatMap((record) => record.labels ?? []))).sort()}
              onUpdateProjectDetails={(name, description, labels) => {
                libraryState.setActiveProjectName(name);
                libraryState.setActiveProjectDescription(description);
                libraryState.setActiveProjectLabels(labels);
              }}
              workspaceValue={workspaceValue}
              configPageProps={configPageProps}
              libraryPageProps={libraryPageProps}
            />
          </AppErrorBoundary>
        </Content>
      </Layout>

      {modalContextHolder}
      <Suspense fallback={null}>
        <FeatureBoundary title="The variable settings dialog failed to open.">
          <VariableConfigDrawer
            open={configState.configDrawerOpen}
            variableName={configState.configDrawerVariable}
            availableVariables={configurableVariables}
            variableConfig={configState.configDrawerVariable ? (configState.variableConfigs[configState.configDrawerVariable] ?? defaultVariableConfig) : defaultVariableConfig}
            defaultVariableConfig={defaultVariableConfig}
            defaultDepthValue={globalConfig.recursionDepthDefault}
            viewKindOptionsByVariable={viewKindOptionsByVariable}
            pendingWatchVariables={configState.pendingWatchVariables}
            onClose={configState.closeConfigDrawer}
            onApply={configState.applyVariableConfigs}
            onSelectVariable={configState.openVariableConfig}
          />
        </FeatureBoundary>
        <FeatureBoundary title="The save dialog failed to open.">
          <SaveCollectionModal
            open={libraryState.saveModalOpen}
            projectName={libraryState.activeProjectName}
            projectDescription={libraryState.activeProjectDescription}
            projectLabels={libraryState.activeProjectLabels}
            availableLabels={Array.from(new Set(libraryState.collections.flatMap((record) => record.labels ?? []))).sort()}
            onProjectNameChange={libraryState.setActiveProjectName}
            onProjectDescriptionChange={libraryState.setActiveProjectDescription}
            onProjectLabelsChange={libraryState.setActiveProjectLabels}
            onCancel={() => setSaveModalOpen(false)}
            onOk={(name, description, labels) => void runAction(() => Promise.resolve(libraryState.handleSaveCollection(name, description, labels)), {
              title: "Save project failed",
              normalize: normalizeActionError("Could not save this project."),
            })}
          />
        </FeatureBoundary>
      </Suspense>
    </>
  );
}

const AppShell = () => (
  <AntApp>
    <App />
  </AntApp>
);

export default AppShell;
