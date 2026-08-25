// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { ExampleRecord, CollectionRecord } from "../shared/types/visualization";

const modalConfirmMock = vi.fn();
const handleCreateProjectMock = vi.fn();
const setVariableConfigsMock = vi.fn();
const closeConfigDrawerMock = vi.fn();
const runVisualizationMock = vi.fn(async () => true);
let mockVariableConfigs: Record<string, { viewKind: "auto" | "array_cells"; depth: number | null; viewOptions: { color: string } }> = {};

const libraryStateFactory = ({
  hasUnsavedChanges,
  hasSavedProject = false,
}: {
  hasUnsavedChanges: boolean;
  hasSavedProject?: boolean;
}) => ({
  activeProjectName: "Demo",
  activeProjectDescription: "",
  activeProjectLabels: [],
  activeProjectId: hasSavedProject ? "saved-project" : null,
  hasSavedProject,
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
  useSettingsStore: ({ libraryState }: {
    libraryState: {
      collections: unknown[];
      handleDeleteCollection: (record: CollectionRecord) => Promise<void>;
      handleLoadCollection: (record: CollectionRecord) => Promise<void>;
      handleLoadExample: (example: ExampleRecord) => Promise<void>;
    };
  }) => ({
    configPageProps: {},
    libraryPageProps: {
      collections: libraryState.collections,
      examples: [],
      onDeleteCollection: libraryState.handleDeleteCollection,
      onLoadCollection: libraryState.handleLoadCollection,
      onLoadExample: libraryState.handleLoadExample,
    },
  }),
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
      variableConfigs: mockVariableConfigs,
      pendingWatchVariables: [],
      configDrawerVariable: null,
      configDrawerOpen: false,
      setVariableConfigs: setVariableConfigsMock,
      closeConfigDrawer: closeConfigDrawerMock,
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
    runVisualization: runVisualizationMock,
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
  AppRoutes: ({
    workspaceValue,
    libraryPageProps,
  }: {
    workspaceValue: { pageActions: { openSaveModal: () => void; runVisualization: () => Promise<boolean> } };
    libraryPageProps: {
      onLoadExample: (example: ExampleRecord) => Promise<void>;
      onLoadCollection: (record: CollectionRecord) => Promise<void>;
    };
  }) => (
    <>
      <button type="button" onClick={workspaceValue.pageActions.openSaveModal}>
        Save project
      </button>
      <button type="button" onClick={() => void workspaceValue.pageActions.runVisualization()}>
        Run visualization
      </button>
      <button
        type="button"
        onClick={() => void libraryPageProps.onLoadExample({
          key: "example",
          title: "Example A",
          description: "",
          snippet: "data = [1]",
        })}
      >
        Load example
      </button>
      <button
        type="button"
        onClick={() => void libraryPageProps.onLoadCollection({
          id: "collection-1",
          name: "Project A",
          sourceCode: "data = [1]",
          watchVariables: ["data"],
          variableConfigs: {},
          globalConfig: {
            stepLimit: 128,
            maxDepth: 3,
            maxItemsPerView: 10,
            recursionDepthDefault: 2,
            showTitles: true,
            customConverters: "",
            runtimePackages: "",
            runtimeWheels: "",
            typeViewDefaults: {},
          },
          savedAt: new Date("2026-07-23T00:00:00Z").toISOString(),
        })}
      >
        Load collection
      </button>
    </>
  ),
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
    setVariableConfigsMock.mockReset();
    closeConfigDrawerMock.mockReset();
    runVisualizationMock.mockReset();
    runVisualizationMock.mockResolvedValue(true);
    mockVariableConfigs = {};
  });

  afterEach(() => {
    cleanup();
  });

  it("starts a new project immediately when there are no unsaved changes", () => {
    useLibraryStoreMock.mockReturnValue(libraryStateFactory({ hasUnsavedChanges: false }));

    render(<AppShell />);

    fireEvent.click(screen.getAllByRole("button", { name: "New project" })[0]!);

    expect(handleCreateProjectMock).toHaveBeenCalledTimes(1);
    expect(modalConfirmMock).not.toHaveBeenCalled();
  });

  it("asks for confirmation before discarding unsaved changes", () => {
    useLibraryStoreMock.mockReturnValue(libraryStateFactory({ hasUnsavedChanges: true }));

    render(<AppShell />);

    fireEvent.click(screen.getAllByRole("button", { name: "New project" })[0]!);

    expect(handleCreateProjectMock).not.toHaveBeenCalled();
    expect(modalConfirmMock).toHaveBeenCalledTimes(1);
    expect((modalConfirmMock.mock.calls[0]?.[0] as { footer?: unknown }).footer).toBeTruthy();

    const config = modalConfirmMock.mock.calls[0]?.[0] as { onOk?: () => void };
    config.onOk?.();

    expect(handleCreateProjectMock).toHaveBeenCalledTimes(1);
  });

  it("saves directly when the current project already exists", () => {
    const libraryState = libraryStateFactory({ hasUnsavedChanges: false, hasSavedProject: true });
    useLibraryStoreMock.mockReturnValue(libraryState);

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Save project" }));

    expect(libraryState.handleSaveCollection).toHaveBeenCalledTimes(1);
    expect(libraryState.setSaveModalOpen).not.toHaveBeenCalled();
  });

  it("opens the save modal when the project has not been saved yet", () => {
    const libraryState = libraryStateFactory({ hasUnsavedChanges: false, hasSavedProject: false });
    useLibraryStoreMock.mockReturnValue(libraryState);

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Save project" }));

    expect(libraryState.handleSaveCollection).not.toHaveBeenCalled();
    expect(libraryState.setSaveModalOpen).toHaveBeenCalledWith(true);
  });

  it("asks before loading an example when there are unsaved changes", () => {
    const libraryState = libraryStateFactory({ hasUnsavedChanges: true });
    useLibraryStoreMock.mockReturnValue(libraryState);

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    expect(libraryState.handleLoadExample).not.toHaveBeenCalled();
    expect(modalConfirmMock).toHaveBeenCalledTimes(1);

    const config = modalConfirmMock.mock.calls[0]?.[0] as { onOk?: () => void };
    config.onOk?.();

    expect(libraryState.handleLoadExample).toHaveBeenCalledTimes(1);
  });

  it("asks before loading a collection when there are unsaved changes", () => {
    const libraryState = libraryStateFactory({ hasUnsavedChanges: true });
    useLibraryStoreMock.mockReturnValue(libraryState);

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Load collection" }));

    expect(libraryState.handleLoadCollection).not.toHaveBeenCalled();
    expect(modalConfirmMock).toHaveBeenCalledTimes(1);

    const config = modalConfirmMock.mock.calls[0]?.[0] as { onOk?: () => void };
    config.onOk?.();

    expect(libraryState.handleLoadCollection).toHaveBeenCalledTimes(1);
  });

  it("lets the user save from the unsaved-changes prompt", () => {
    const libraryState = libraryStateFactory({ hasUnsavedChanges: true, hasSavedProject: false });
    useLibraryStoreMock.mockReturnValue(libraryState);

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Load example" }));

    const config = modalConfirmMock.mock.calls[0]?.[0] as {
      footer?: (origin: unknown, components: { OkBtn: () => ReactNode; CancelBtn: () => ReactNode }) => ReactNode;
    };
    const footer = config.footer?.(null, {
      OkBtn: () => <button type="button">Discard and continue</button>,
      CancelBtn: () => <button type="button">Cancel</button>,
    });

    render(<>{footer}</>);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(libraryState.setSaveModalOpen).toHaveBeenCalledWith(true);
    expect(libraryState.handleLoadExample).not.toHaveBeenCalled();
  });

  it("resets stale explicit view configs to auto and retries when the variable type changes", async () => {
    const libraryState = libraryStateFactory({ hasUnsavedChanges: false });
    useLibraryStoreMock.mockReturnValue(libraryState);
    mockVariableConfigs = {
      data: { viewKind: "array_cells", depth: 2, viewOptions: { color: "#64748b" } },
    };

    const mismatch = new Error("TypeError: array_cells_node view expects a list-like input");
    runVisualizationMock
      .mockRejectedValueOnce(mismatch)
      .mockResolvedValueOnce(true);

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: "Run visualization" }));

    await waitFor(() => {
      expect(setVariableConfigsMock).toHaveBeenCalledWith({
        data: { viewKind: "auto", depth: 2, viewOptions: { color: "#64748b" } },
      });
    });

    expect(closeConfigDrawerMock).toHaveBeenCalled();
    expect(runVisualizationMock).toHaveBeenNthCalledWith(1);
    expect(runVisualizationMock).toHaveBeenNthCalledWith(2, {
      data: { viewKind: "auto", depth: 2, viewOptions: { color: "#64748b" } },
    });
  });
});
