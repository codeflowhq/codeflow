// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ManifestEntry } from "../../../shared/types/visualization";

const { graphvizPanelMock, svgPanelMock } = vi.hoisted(() => ({
  graphvizPanelMock: vi.fn((PROPS: unknown) => {
    void PROPS;
    return <div>graphviz-renderer</div>;
  }),
  svgPanelMock: vi.fn((PROPS: unknown) => {
    void PROPS;
    return <div>svg-renderer</div>;
  }),
}));

vi.mock("../renderers/GraphvizPanel", () => ({
  default: (props: unknown) => graphvizPanelMock(props),
}));

vi.mock("../renderers/SvgPanel", () => ({
  default: (props: unknown) => svgPanelMock(props),
}));

import VariablePanel from "./VariablePanel";

const baseEntry: ManifestEntry = {
  variable: "data",
  kind: "svg",
  steps: [
    {
      stepId: "step 1",
      timelineKey: "1:1",
      executionId: 1,
      order: 1,
      index: 1,
      svg: "<svg id='first' />",
    },
    {
      stepId: "step 2",
      timelineKey: "1:2",
      executionId: 1,
      order: 2,
      index: 2,
      svg: "<svg id='second' />",
    },
  ],
};

describe("VariablePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "MutationObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  it("shows an empty state and clears export source when no frames exist", async () => {
    const onExportSourceChange = vi.fn();

    render(
      <VariablePanel
        entry={{ ...baseEntry, steps: [] }}
        activeTimelineKey="1:1"
        onOpenConfig={vi.fn()}
        onExportSourceChange={onExportSourceChange}
      />,
    );

    expect(screen.getAllByText("This step has no value.").length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(onExportSourceChange).toHaveBeenCalledWith(null);
    });
  });

  it("shows no frame when the active key is before the first frame", async () => {
    const onExportSourceChange = vi.fn();

    render(
      <VariablePanel
        entry={baseEntry}
        activeTimelineKey="0:0"
        onOpenConfig={vi.fn()}
        onExportSourceChange={onExportSourceChange}
      />,
    );

    expect(screen.getAllByText("This step has no value.").length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(onExportSourceChange).toHaveBeenCalledWith(null);
    });
  });

  it("falls back to the last reachable step when the active key is after the final frame", async () => {
    render(
      <VariablePanel
        entry={baseEntry}
        activeTimelineKey="9:9"
        onOpenConfig={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(svgPanelMock).toHaveBeenCalledWith(
        expect.objectContaining({ svg: "<svg id='second' />" }),
      );
    });
  });

  it("reports body size even when no svg element is rendered", async () => {
    const onContentSizeChange = vi.fn();

    render(
      <VariablePanel
        entry={{ ...baseEntry, kind: "dot", steps: [{ ...baseEntry.steps[0], dot: "digraph G {}", svg: undefined }] }}
        activeTimelineKey="1:1"
        onOpenConfig={vi.fn()}
        onContentSizeChange={onContentSizeChange}
      />,
    );

    await waitFor(() => {
      expect(onContentSizeChange).toHaveBeenCalled();
    });
    const size = onContentSizeChange.mock.calls[0]?.[0] as { width: number; height: number };
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});
