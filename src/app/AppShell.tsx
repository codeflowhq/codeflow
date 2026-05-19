import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { App as AntApp, Button, Layout, Modal, Typography } from "antd";
import { ShareAltOutlined } from "@ant-design/icons";

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
import { useTimelinePlayback } from "../features/visualization/useTimelinePlayback";
import { useVariableWatch } from "../features/watch/useVariableWatch";
import { useVisualizationRun } from "../features/visualization/useVisualizationRun";
import { useLibraryStore } from "../features/library/library-store";
import { useNavigationState } from "../features/navigation/useNavigationState";
import { AppRoutes } from "./routes";
import type { ViewKind } from "../shared/types/visualization";
import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { useGlobalErrorHandling } from "../shared/hooks/useGlobalErrorHandling";
import { TOP_MENU_LIBRARY } from "../features/navigation/navigationState";
import "antd/dist/reset.css";
import "../App.css";

const VariableConfigDrawer = lazy(() => import("../components/VariableConfigDrawer"));
const SaveCollectionModal = lazy(() => import("../components/SaveCollectionModal"));

const { Header, Content } = Layout;
const { Text } = Typography;

function App() {
  const { message: messageApi } = AntApp.useApp();
  const [modal, modalContextHolder] = Modal.useModal();
  const [exampleRunRequestId, setExampleRunRequestId] = useState(0);
  const handledExampleRunRequestId = useRef(0);
  const [sourceCode, setSourceCode] = useState(defaultSnippet);
  const [globalConfig, setGlobalConfig] = useState(defaultGlobalConfig);
  const navigation = useNavigationState();

  const candidateVariables = useMemo(() => extractCandidateVariables(sourceCode), [sourceCode]);

  const showErrorModal = useCallback((title: string, content: string) => {
    modal.error({ title, content, centered: true });
  }, [modal]);

  useGlobalErrorHandling(showErrorModal);

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

  const runtimeReady = useRuntimeBootstrap({ onError: showErrorModal });

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
    onError: showErrorModal,
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
    resetSelectionState,
    openVisualizationMain: navigation.openVisualizationMain,
    requestExampleRun: () => setExampleRunRequestId((prev) => prev + 1),
  });

  const { setSaveModalOpen } = libraryState;
  const openSaveModal = useCallback(() => {
    setSaveModalOpen(true);
  }, [setSaveModalOpen]);

  const handleRunVisualization = useCallback(async () => {
    configState.closeConfigDrawer();
    await runVisualization();
  }, [configState, runVisualization]);

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
  const activeViewKindOptions = useMemo<ViewKind[]>(() => {
    if (!configState.configDrawerVariable) {
      return ["auto"];
    }
    const compatible = manifestViewKindsByVariable[configState.configDrawerVariable];
    const currentView = configState.variableConfigs[configState.configDrawerVariable]?.viewKind;
    if (!compatible?.length) {
      return currentView && currentView !== "auto" ? ["auto", currentView] : ["auto"];
    }
    if (currentView && !compatible.includes(currentView)) {
      return [currentView, ...compatible];
    }
    return compatible;
  }, [configState.configDrawerVariable, configState.variableConfigs, manifestViewKindsByVariable]);

  const handleOpenVariableConfigWithResolvedViews = useCallback(async (variableName: string) => {
    const alreadyResolved = (manifestViewKindsByVariable[variableName] ?? []).length > 0;
    if (!alreadyResolved && watchList.watchVariables.includes(variableName) && runtimeReady && sourceCode.trim().length > 0) {
      await handleRunVisualization();
    }
    handleOpenVariableConfig(variableName);
  }, [handleOpenVariableConfig, handleRunVisualization, manifestViewKindsByVariable, runtimeReady, sourceCode, watchList.watchVariables]);

  const { configPageProps, libraryPageProps } = useSettingsStore({
    manifestVariables,
    variableConfigs: configState.variableConfigs,
    globalConfig,
    setGlobalConfig,
    handleOpenVariableConfig: handleOpenVariableConfigWithResolvedViews,
    libraryState,
    examples: EXAMPLE_LIBRARY,
  });

  const handleRemoveWatchVariable = useCallback((variableName: string) => {
    watchList.removeWatchVariable(variableName);
    configState.clearPendingWatchConfig(variableName);
  }, [configState, watchList]);

  const watchUiState = useMemo(() => ({
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

  const pageActions = useMemo(() => ({
    runVisualization: handleRunVisualization,
    openSettings: navigation.openVisualizationConfig,
    openCollections: navigation.openLibrary,
    openSaveModal,
    shareProject: handleShare,
  }), [handleRunVisualization, handleShare, navigation.openLibrary, navigation.openVisualizationConfig, openSaveModal]);

  const workspaceValue = useMemo(() => ({
    editorState,
    pageActions,
    timelineState,
    variableConfigs: variablePanelConfigs,
    visualState: { manifest },
    watchState: watchUiState,
  }), [editorState, manifest, pageActions, timelineState, variablePanelConfigs, watchUiState]);

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
              onRenameProject={libraryState.setActiveProjectName}
              workspaceValue={workspaceValue}
              configPageProps={configPageProps}
              libraryPageProps={libraryPageProps}
            />
          </AppErrorBoundary>
        </Content>
      </Layout>

      {modalContextHolder}
      <Suspense fallback={null}>
        <VariableConfigDrawer
          open={configState.configDrawerOpen}
          variableName={configState.configDrawerVariable}
          availableVariables={configurableVariables}
          variableConfig={configState.configDrawerVariable ? (configState.variableConfigs[configState.configDrawerVariable] ?? defaultVariableConfig) : defaultVariableConfig}
          defaultVariableConfig={defaultVariableConfig}
          viewKindOptions={activeViewKindOptions}
          pendingWatchVariables={configState.pendingWatchVariables}
          onClose={configState.closeConfigDrawer}
          onApply={configState.applyVariableConfig}
          onSelectVariable={configState.openVariableConfig}
        />
        <SaveCollectionModal
          open={libraryState.saveModalOpen}
          projectName={libraryState.activeProjectName}
          onCancel={() => setSaveModalOpen(false)}
          onOk={libraryState.handleSaveCollection}
        />
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
