// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../editor/EditorPanel", () => ({
  default: () => <div>Editor panel</div>,
}));

vi.mock("../watch/WatchPanel", () => ({
  default: () => <div>Watch panel</div>,
}));

vi.mock("../visualization/TimelineControls", () => ({
  default: () => <div>Timeline controls</div>,
}));

vi.mock("../visualization/VisualCanvas", () => ({
  default: () => {
    throw new Error("canvas failed");
  },
}));

import WorkspacePage from "./WorkspacePage";
import { WorkspaceProvider } from "./workspace-store";
import type { WorkspaceValue } from "./workspace-types";

const workspaceValue: WorkspaceValue = {
  editorState: {
    editorOptions: {},
    handleEditorMount: vi.fn(),
    runtimeReady: true,
    setSourceCode: vi.fn(),
    sourceCode: "data = [1]",
    status: "ready",
    statusMessage: "Runtime ready",
  },
  pageActions: {
    runVisualization: vi.fn(async () => undefined),
    openSettings: vi.fn(),
    openCollections: vi.fn(),
    openSaveModal: vi.fn(),
    exportProject: vi.fn(async () => undefined),
    shareProject: vi.fn(async () => undefined),
  },
  timelineState: {
    activeTimelineFrame: undefined,
    activeTimelineIndex: 0,
    activeTimelineKey: "",
    isPlaying: false,
    setActiveTimelineKey: vi.fn(),
    setIsPlaying: vi.fn(),
    stepTo: vi.fn(),
    timelineFrames: [],
  },
  variableConfigs: {},
  visualState: {
    manifest: [],
    exportSources: {},
    layoutState: { mode: "masonry", masonryOrder: [], windows: { layouts: {}, zIndices: {} } },
    setLayoutMode: vi.fn(),
    setExportSource: vi.fn(),
    setMasonryOrder: vi.fn(),
    setWindowLayout: vi.fn(),
    setWindowZIndex: vi.fn(),
  },
  watchState: {
    advancedSelectionState: { status: "idle", message: "" },
    candidateVariables: ["data"],
    selectedVariable: null,
    selectionLocked: false,
    setSelectedVariable: vi.fn(),
    setSelectionLocked: vi.fn(),
    advancedSelectionOpen: false,
    setAdvancedSelectionOpen: vi.fn(),
    watchDraft: "",
    setWatchDraft: vi.fn(),
    watchVariables: ["data"],
    pendingWatchVariables: [],
    removeWatchVariable: vi.fn(),
    handleAddWatchVariable: vi.fn(),
    handleOpenVariableConfig: vi.fn(),
    handleSubmitWatchExpression: vi.fn(),
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WorkspacePage", () => {
  it("keeps editor and watch panels visible when visualization crashes", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <WorkspaceProvider value={workspaceValue}>
        <WorkspacePage
          projectName="Demo"
          projectDescription=""
          projectLabels={[]}
          availableLabels={[]}
          onOpenSettings={vi.fn()}
          onUpdateProjectDetails={vi.fn()}
        />
      </WorkspaceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("The visualization panel failed to render.")).toBeTruthy();
    });

    expect(screen.getByText("Editor panel")).toBeTruthy();
    expect(screen.getByText("Watch panel")).toBeTruthy();
    consoleError.mockRestore();
  });

  it("disables export until the current step has rendered exportable content", () => {
    render(
      <WorkspaceProvider value={workspaceValue}>
        <WorkspacePage
          projectName="Demo"
          projectDescription=""
          projectLabels={[]}
          availableLabels={[]}
          onOpenSettings={vi.fn()}
          onUpdateProjectDetails={vi.fn()}
        />
      </WorkspaceProvider>,
    );

    const [exportButton] = screen.getAllByRole("button", { name: /export/i });
    expect(exportButton.hasAttribute("disabled")).toBe(true);
  });

  it("enables export once the current step has rendered exportable content", () => {
    render(
      <WorkspaceProvider
        value={{
          ...workspaceValue,
          timelineState: {
            ...workspaceValue.timelineState,
            activeTimelineKey: "1:1",
          },
          visualState: {
            ...workspaceValue.visualState,
            exportSources: {
              "1:1": {
                data: "<svg />",
              },
            },
          },
        }}
      >
        <WorkspacePage
          projectName="Demo"
          projectDescription=""
          projectLabels={[]}
          availableLabels={[]}
          onOpenSettings={vi.fn()}
          onUpdateProjectDetails={vi.fn()}
        />
      </WorkspaceProvider>,
    );

    const exportButtons = screen.getAllByRole("button", { name: /export/i });
    expect(exportButtons.some((button) => !button.hasAttribute("disabled"))).toBe(true);
  });
});
