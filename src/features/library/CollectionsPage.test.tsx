// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./components/CollectionPreviewSurface", () => ({
  default: () => {
    throw new Error("preview failed");
  },
}));

vi.mock("../../runtime/python-bridge", () => ({
  runVisualizationInBrowser: vi.fn(),
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
            outputFormat: "svg",
            maxDepth: 3,
            maxItemsPerView: 50,
            recursionDepthDefault: -1,
            autoRecursionDepthCap: 6,
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
});
