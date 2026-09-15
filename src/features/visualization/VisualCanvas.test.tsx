// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import VisualCanvas from "./VisualCanvas";
import type { VisualizationLayoutState } from "../../shared/types/visualization";

const variablePanelMock = vi.fn((props: unknown) => <div data-testid="variable-panel-probe">{JSON.stringify(props)}</div>);

vi.mock("./components/VariablePanel", () => ({
  default: (props: unknown) => variablePanelMock(props),
}));

const layoutState: VisualizationLayoutState = {
  mode: "masonry",
  masonryOrder: [],
  windows: { layouts: {}, zIndices: {} },
};

describe("VisualCanvas", () => {
  beforeEach(() => {
    variablePanelMock.mockClear();
    Object.defineProperty(HTMLDivElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return this.classList.contains("visual-canvas-masonry") ? 800 : 0;
      },
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it("spans two columns when a trace contains a wide SVG step", async () => {
    const { getByTestId } = render(
      <VisualCanvas
        manifest={[{
          variable: "frontier",
          kind: "svg",
          steps: [{ stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 1, svg: "<svg viewBox='0 0 400 120' />" }],
          compatibleViewKinds: [],
        }]}
        activeTimelineKey="1:1"
        variableConfigs={{}}
        exportSources={{}}
        onOpenConfig={vi.fn()}
        onRemoveVariable={vi.fn()}
        onRunVisualization={vi.fn(async () => true)}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={layoutState}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
      />,
    );

    await waitFor(() => {
      const probe = getByTestId("variable-panel-probe");
      expect(probe.parentElement?.dataset.span).toBe("2");
    });
  });

  it("keeps DOT panels in one column before Graphviz renders", async () => {
    const { container } = render(
      <VisualCanvas
        manifest={[{
          variable: "frontier",
          kind: "dot",
          steps: [{ stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 1, dot: "digraph G {}" }],
          compatibleViewKinds: [],
        }]}
        activeTimelineKey="1:1"
        variableConfigs={{}}
        exportSources={{}}
        onOpenConfig={vi.fn()}
        onRemoveVariable={vi.fn()}
        onRunVisualization={vi.fn(async () => true)}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={layoutState}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
      />,
    );

    await waitFor(() => {
      const probe = container.querySelector("[data-testid='variable-panel-probe']");
      expect(probe?.parentElement?.dataset.span).toBe("1");
    });
  });

  it("spans two columns for a dense DOT trace", async () => {
    const { container } = render(
      <VisualCanvas
        manifest={[{
          variable: "search_tree",
          kind: "dot",
          steps: [{
            stepId: "step 1",
            timelineKey: "1:1",
            executionId: 1,
            order: 1,
            index: 1,
            dot: `digraph G {
              n0 [label="0"]
              n1 [label="1"]
              n2 [label="2"]
              n3 [label="3"]
              n4 [label="4"]
              n5 [label="5"]
              n6 [label="6"]
              n7 [label="7"]
              n8 [label="8"]
              n9 [label="9"]
            }`,
          }],
          compatibleViewKinds: [],
        }]}
        activeTimelineKey="1:1"
        variableConfigs={{}}
        exportSources={{}}
        onOpenConfig={vi.fn()}
        onRemoveVariable={vi.fn()}
        onRunVisualization={vi.fn(async () => true)}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={layoutState}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
      />,
    );

    await waitFor(() => {
      const probe = container.querySelector("[data-testid='variable-panel-probe']");
      expect(probe?.parentElement?.dataset.span).toBe("2");
    });
  });

  it("shows an empty-state message from the current run status", () => {
    render(
      <VisualCanvas
        manifest={[]}
        activeTimelineKey=""
        variableConfigs={{}}
        exportSources={{}}
        emptyStateMessage="You defined a function or class, but nothing called it."
        onOpenConfig={vi.fn()}
        onRemoveVariable={vi.fn()}
        onRunVisualization={vi.fn(async () => true)}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={layoutState}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
      />,
    );

    expect(screen.getByText("No visualization yet")).toBeTruthy();
    expect(screen.getByText("You defined a function or class, but nothing called it.")).toBeTruthy();
  });
});
