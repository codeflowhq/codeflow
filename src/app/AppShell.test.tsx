// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const modalConfirmMock = vi.fn();
const handleCreateProjectMock = vi.fn();

const libraryStateFactory = (hasUnsavedChanges: boolean) => ({
  activeProjectName: "Demo",
  activeProjectDescription: "",
  activeProjectLabels: [],
  collections: [],
  saveModalOpen: false,
  setActiveProjectName: vi.fn(),
  setActiveProjectDescription: vi.fn(),
  setActiveProjectLabels: vi.fn(),
  setSaveModalOpen: vi.fn(),
  handleSaveCollection: vi.fn(),
  handleLoadCollection: vi.fn(),
  handleDeleteCollection: vi.fn(),
  handleLoadExample: vi.fn(),
  handleCreateProject: handleCreateProjectMock,
  hasUnsavedChanges,
});

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      useModal: () => [
        {
          confirm: modalConfirmMock,
          error: vi.fn(),
        },
        <div key="modal-context" data-testid="modal-context" />,
      ],
    },
  };
});

vi.mock("../features/editor/useEditorDecorations", () => ({
  useEditorDecorations: () => ({ handleEditorMount: vi.fn() }),
}));

vi.mock("../features/settings/settings-store", () => ({
  useSettingsStore: () => ({ configPageProps: {}, libraryPageProps: {} }),
}));

vi.mock("../features/workspace/useRuntimeBootstrap", () => ({
  useRuntimeBootstrap: () => true,
}));

vi.mock("../features/workspace/useShareState", () => ({
  useShareState: () => ({ handleShare: vi.fn(async () => undefined) }),
}));

vi.mock("../features/visualization/useTimelinePlayback", () => ({
  useTimelinePlayback: () => ({
    activeTimelineFrame: undefined,
    activeTimelineIndex: 0,
    activeTimelineKey: "",
    isPlaying: false,
    setActiveTimelineKey: vi.fn(),
    setIsPlaying: vi.fn(),
    stepTo: vi.fn(),
    timelineFrames: [],
  }),
}));

vi.mock("../features/watch/useVariableWatch", () => ({
  useVariableWatch: () => ({
    watchList: {
      advancedSelectionOpen: false,
      watchDraft: "",
      watchVariables: ["data"],
      selectedVariable: null,
      selectionLocked: false,
      setSelectedVariable: vi.fn(),
      setSelectionLocked: vi.fn(),
      setAdvancedSelectionOpen: vi.fn(),
      setWatchDraft: vi.fn(),
      setWatchVariables: vi.fn(),
      removeWatchVariable: vi.fn(),
    },
    configState: {
      variableConfigs: {},
      pendingWatchVariables: [],
      configDrawerVariable: null,
      configDrawerOpen: false,
      setVariableConfigs: vi.fn(),
      closeConfigDrawer: vi.fn(),
      clearPendingWatchConfig: vi.fn(),
      openVariableConfig: vi.fn(),
      applyVariableConfigs: vi.fn(),
    },
    handleAddWatchVariable: vi.fn(),
    handleOpenVariableConfig: vi.fn(),
    handleSubmitWatchExpression: vi.fn(),
  }),
}));

vi.mock("../features/visualization/useExportState", () => ({
  useExportState: () => ({ handleExport: vi.fn(async () => undefined) }),
}));

vi.mock("../features/visualization/useVisualizationRun", () => ({
  useVisualizationRun: () => ({
    manifest: [],
    runVisualization: vi.fn(async () => undefined),
    setManifest: vi.fn(),
    setStatusMessage: vi.fn(),
    status: "ready",
    statusMessage: "ready",
  }),
}));

vi.mock("../features/visualization/layout-mode", () => ({
  useLayoutModeState: () => ({
    layoutState: { mode: "masonry", masonryOrder: [], windows: { layouts: {}, zIndices: {} } },
    setLayoutMode: vi.fn(),
    setMasonryOrder: vi.fn(),
    setWindowLayout: vi.fn(),
    setWindowZIndex: vi.fn(),
    replaceLayoutState: vi.fn(),
  }),
}));

const useLibraryStoreMock = vi.fn();
vi.mock("../features/library/library-store", () => ({
  useLibraryStore: (...args: unknown[]) => useLibraryStoreMock(...args),
}));

vi.mock("../features/navigation/useNavigationState", () => ({
  useNavigationState: () => ({
    topMenuKey: "visualization",
    vizMenuKey: "main",
    setTopMenuKey: vi.fn(),
    setVizMenuKey: vi.fn(),
    openVisualizationMain: vi.fn(),
    openVisualizationConfig: vi.fn(),
    openLibrary: vi.fn(),
  }),
}));

vi.mock("../shared/hooks/useGlobalErrorHandling", () => ({
  useGlobalErrorHandling: vi.fn(),
}));

vi.mock("../shared/hooks/useActionBoundary", () => ({
  useActionBoundary: () => ({
    runAction: async (fn: () => Promise<unknown> | unknown) => await fn(),
    runRuntimeAction: async (fn: () => Promise<unknown> | unknown) => await fn(),
  }),
}));

vi.mock("./routes", () => ({
  AppRoutes: () => <div>Routes</div>,
}));

vi.mock("../components/AppErrorBoundary", () => ({
  AppErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../shared/ui/FeatureBoundary", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../features/watch/components/VariableConfigDrawer", () => ({
  default: () => null,
}));

vi.mock("../features/library/components/SaveCollectionModal", () => ({
  default: () => null,
}));

import AppShell from "./AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    modalConfirmMock.mockReset();
    handleCreateProjectMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("starts a new project immediately when there are no unsaved changes", () => {
    useLibraryStoreMock.mockReturnValue(libraryStateFactory(false));

    render(<AppShell />);

    fireEvent.click(screen.getAllByRole("button", { name: "New project" })[0]!);

    expect(handleCreateProjectMock).toHaveBeenCalledTimes(1);
    expect(modalConfirmMock).not.toHaveBeenCalled();
  });

  it("asks for confirmation before discarding unsaved changes", () => {
    useLibraryStoreMock.mockReturnValue(libraryStateFactory(true));

    render(<AppShell />);

    fireEvent.click(screen.getAllByRole("button", { name: "New project" })[0]!);

    expect(handleCreateProjectMock).not.toHaveBeenCalled();
    expect(modalConfirmMock).toHaveBeenCalledTimes(1);

    const config = modalConfirmMock.mock.calls[0]?.[0] as { onOk?: () => void };
    config.onOk?.();

    expect(handleCreateProjectMock).toHaveBeenCalledTimes(1);
  });
});
