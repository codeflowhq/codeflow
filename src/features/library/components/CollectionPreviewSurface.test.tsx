// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FeatureBoundary from "../../../shared/ui/FeatureBoundary";
import type { ManifestEntry } from "../../../shared/types/visualization";
import CollectionPreviewSurface from "./CollectionPreviewSurface";

vi.mock("../../visualization/renderers/SvgPanel", () => ({
  default: ({ svg }: { svg: string }) => <div data-testid="svg-preview">{svg}</div>,
}));

vi.mock("../../visualization/renderers/GraphvizPanel", () => ({
  default: ({ dot }: { dot: string }) => {
    if (dot === "__boom__") {
      throw new Error("graph preview failed");
    }
    return <div data-testid="dot-preview">{dot}</div>;
  },
}));

const buildManifest = (): ManifestEntry[] => [
  {
    variable: "data",
    kind: "svg",
    steps: [{ stepId: "step-1", timelineKey: "1:1", executionId: 1, order: 1, index: 0, svg: "<svg>one</svg>" }],
  },
  {
    variable: "queue",
    kind: "svg",
    steps: [{ stepId: "step-2", timelineKey: "1:2", executionId: 1, order: 2, index: 0, svg: "<svg>two</svg>" }],
  },
];

describe("CollectionPreviewSurface", () => {
  it("shows an empty preview state when no manifest was saved", () => {
    render(<CollectionPreviewSurface savedManifest={[]} />);

    expect(
      screen.getByText("No visualization was saved with this project yet."),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Previous preview" }),
    ).toBeNull();
  });

  it("does not render navigation arrows for a single preview item", () => {
    render(<CollectionPreviewSurface savedManifest={[buildManifest()[0]]} />);

    return waitFor(() => {
      expect(
        within(screen.getByLabelText("data preview")).getByTestId("svg-preview").textContent,
      ).toContain("one");
      expect(
        screen.queryByRole("button", { name: "Previous preview" }),
      ).toBeNull();
      expect(screen.queryByRole("button", { name: "Next preview" })).toBeNull();
    });
  });

  it("disables preview arrows at the ends instead of looping", async () => {
    render(<CollectionPreviewSurface savedManifest={buildManifest()} />);

    const previousButton = screen.getByRole("button", { name: "Previous preview" }) as HTMLButtonElement;
    const nextButton = screen.getByRole("button", { name: "Next preview" }) as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(previousButton.disabled).toBe(false);
      expect(nextButton.disabled).toBe(true);
    });

    expect(
      within(screen.getByLabelText("queue preview")).getByTestId("svg-preview").textContent,
    ).toContain("two");
  });

  it("can be isolated by a local feature boundary when a preview renderer crashes", async () => {
    const crashingManifest: ManifestEntry[] = [{
      variable: "graph",
      kind: "dot",
      steps: [{ stepId: "step-1", timelineKey: "1:1", executionId: 1, order: 1, index: 0, dot: "__boom__" }],
    }];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <FeatureBoundary title="The saved preview failed to render.">
        <CollectionPreviewSurface savedManifest={crashingManifest} />
      </FeatureBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByText("The saved preview failed to render.")).toBeTruthy();
    });

    consoleError.mockRestore();
  });
});
