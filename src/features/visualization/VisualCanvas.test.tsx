// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import VisualCanvas from "./VisualCanvas";
import type { VisualizationLayoutState } from "../../shared/types/visualization";

const variablePanelMock = vi.fn((props: Record<string, unknown>) => {
  const { selectionControl, ...serializableProps } = props;
  return (
    <div data-has-selection={Boolean(selectionControl)} data-testid="variable-panel-probe">
      {selectionControl as ReactNode}
      {JSON.stringify(serializableProps)}
    </div>
  );
});

vi.mock("./components/VariablePanel", () => ({
  default: (props: unknown) => variablePanelMock(props as Record<string, unknown>),
}));

const layoutState: VisualizationLayoutState = {
  mode: "masonry",
  masonryOrder: [],
  overlayGroups: [],
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

  it("hides overlay controls when the canvas has no line or scatter layer", () => {
    const { container } = render(
      <VisualCanvas
        manifest={[{ variable: "tree", kind: "dot", steps: [], compatibleViewKinds: ["tree"] }]}
        activeTimelineKey=""
        variableConfigs={{ tree: { viewKind: "tree", depth: 2, viewOptions: { color: "#64748b" } } }}
        exportSources={{}}
        onOpenConfig={vi.fn()}
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

    expect(container.querySelector(".visual-overlay-controls")).toBeNull();
  });

  it("groups selected line and scatter cards from the canvas", () => {
    const createOverlayGroup = vi.fn();
    const onRunVisualization = vi.fn(async () => true);
    render(
      <VisualCanvas
        manifest={[
          { variable: "fit", kind: "svg", steps: [], compatibleViewKinds: ["line"] },
          { variable: "points", kind: "svg", steps: [], compatibleViewKinds: ["scatter"] },
        ]}
        activeTimelineKey=""
        variableConfigs={{
          fit: { viewKind: "line", depth: 1, viewOptions: { color: "#111827" } },
          points: { viewKind: "scatter", depth: 1, viewOptions: { color: "#2563eb" } },
        }}
        exportSources={{}}
        onOpenConfig={vi.fn()}
        onRunVisualization={onRunVisualization}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={layoutState}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
        createOverlayGroup={createOverlayGroup}
      />,
    );

    screen.getAllByRole("checkbox").forEach((checkbox) => fireEvent.click(checkbox));
    const overlayButton = screen.getAllByRole("button", { name: "Overlay" })
      .find((button) => !button.hasAttribute("disabled"));
    expect(overlayButton).toBeTruthy();
    fireEvent.click(overlayButton!);

    expect(createOverlayGroup).toHaveBeenCalledWith(["fit", "points"]);
    expect(onRunVisualization).toHaveBeenCalledWith([{
      id: "overlay-fit-points",
      variables: ["fit", "points"],
      layerOrder: ["fit", "points"],
    }]);
  });

  it("uses all ordered layer names for a grouped panel title", () => {
    render(
      <VisualCanvas
        manifest={[{ variable: "fit", kind: "svg", steps: [], compatibleViewKinds: ["line"] }]}
        activeTimelineKey=""
        variableConfigs={{
          fit: { viewKind: "line", depth: 1, viewOptions: { color: "#dc2626" } },
          points: { viewKind: "scatter", depth: 1, viewOptions: { color: "#2563eb" } },
        }}
        exportSources={{}}
        onOpenConfig={vi.fn()}
        onRunVisualization={vi.fn(async () => true)}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={{
          ...layoutState,
          overlayGroups: [{ id: "fit-group", variables: ["fit", "points"], layerOrder: ["fit", "points"] }],
        }}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
      />,
    );

    expect(variablePanelMock).toHaveBeenCalledWith(expect.objectContaining({ panelTitle: "fit + points" }));
  });

  it("keeps existing members when another layer is added to a group", () => {
    const onRunVisualization = vi.fn(async () => true);
    const { container } = render(
      <VisualCanvas
        manifest={[
          { variable: "fit", kind: "svg", steps: [], compatibleViewKinds: ["line"] },
          { variable: "candidate", kind: "svg", steps: [], compatibleViewKinds: ["scatter"] },
        ]}
        activeTimelineKey=""
        variableConfigs={{
          fit: { viewKind: "line", depth: 1, viewOptions: { color: "#dc2626" } },
          points: { viewKind: "scatter", depth: 1, viewOptions: { color: "#2563eb" } },
          candidate: { viewKind: "scatter", depth: 1, viewOptions: { color: "#f59e0b" } },
        }}
        exportSources={{}}
        onOpenConfig={vi.fn()}
        onRunVisualization={onRunVisualization}
        onOpenGuide={vi.fn()}
        canRun
        layoutMode="masonry"
        layoutState={{
          ...layoutState,
          overlayGroups: [{ id: "existing", variables: ["fit", "points"], layerOrder: ["fit", "points"] }],
        }}
        setExportSource={vi.fn()}
        setMasonryOrder={vi.fn()}
        setWindowLayout={vi.fn()}
        setWindowZIndex={vi.fn()}
        createOverlayGroup={vi.fn()}
      />,
    );

    container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((checkbox) => fireEvent.click(checkbox));
    const overlayButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-label="Overlay"]'))
      .find((button) => !button.disabled);
    expect(overlayButton).toBeTruthy();
    fireEvent.click(overlayButton!);

    expect(onRunVisualization).toHaveBeenCalledWith([{
      id: "overlay-fit-points-candidate",
      variables: ["fit", "points", "candidate"],
      layerOrder: ["fit", "points", "candidate"],
    }]);
  });
});
