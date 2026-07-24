// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import VisualCanvas from "./VisualCanvas";
import type { VisualizationLayoutState } from "../../shared/types/visualization";

const layoutState: VisualizationLayoutState = {
  mode: "masonry",
  masonryOrder: [],
  windows: { layouts: {}, zIndices: {} },
};

describe("VisualCanvas", () => {
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
