// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./components/CollectionPreviewSurface", () => ({
  default: () => {
    throw new Error("preview failed");
  },
}));

vi.mock("../../runtime/python-bridge", () => ({
  runVisualizationInBrowser: vi.fn(async () => ({ manifest: [] })),
}));

import CollectionsPage from "./CollectionsPage";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CollectionsPage", () => {
  it("keeps saved project actions visible when a preview crashes", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <CollectionsPage
        collections={[{
          id: "one",
          name: "Demo",
          savedAt: "2026-06-07T00:00:00.000Z",
          sourceCode: "data = [1]",
          watchVariables: ["data"],
          globalConfig: {
            stepLimit: 12,
            maxDepth: 3,
            maxItemsPerView: 50,
            recursionDepthDefault: -1,
            showTitles: false,
            customConverters: "",
            runtimePackages: "",
            runtimeWheels: "",
            typeViewDefaults: {},
          },
          variableConfigs: {},
          savedManifest: [],
        }]}
        examples={[]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("The saved preview failed to render.")).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "Open project" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    consoleError.mockRestore();
  });

  it("shows Visualgo-style example topic groupings separately from saved project labels", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <CollectionsPage
        collections={[]}
        examples={[
          {
            key: "bfs-queue",
            title: "BFS Queue",
            description: "Queue evolution for breadth-first search.",
            snippet: "queue = []",
            watchVariables: ["queue"],
            tags: ["graph", "queue", "curriculum"],
          },
          {
            key: "array-cells",
            title: "Array Cells",
            description: "Array view with simple indexed updates.",
            snippet: "data = [1, 2]",
            watchVariables: ["data"],
            tags: ["array", "intro"],
          },
        ]}
        onDeleteCollection={vi.fn(async () => undefined)}
        onLoadCollection={vi.fn(async () => undefined)}
        onLoadExample={vi.fn(async () => undefined)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("BFS Queue")).toBeTruthy();
    });

    expect(screen.getByText("Graphs & Graph Algorithms")).toBeTruthy();
    expect(screen.getAllByText("Arrays & Sorting").length).toBeGreaterThan(0);
    expect(screen.getByText("graph")).toBeTruthy();
    expect(screen.getByText("queue")).toBeTruthy();
    expect(screen.getByText("curriculum")).toBeTruthy();
    expect(screen.queryByText("Recursion & Strings")).toBeNull();
    consoleError.mockRestore();
  });
});
