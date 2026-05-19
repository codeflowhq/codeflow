// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GraphvizPanel from "../features/visualization/renderers/GraphvizPanel";

const loadGraphvizRuntime = vi.fn();

vi.mock("../shared/lib/graphviz-runtime", () => ({
  loadGraphvizRuntime: () => loadGraphvizRuntime(),
}));

describe("GraphvizPanel", () => {
  beforeEach(() => {
    loadGraphvizRuntime.mockReset();
  });

  it("shows a friendly fallback when graph runtime loading fails", async () => {
    loadGraphvizRuntime.mockRejectedValue(new Error('syntax error in line 3 near ">"'));

    render(<GraphvizPanel dot="digraph { a -> b }" />);

    await waitFor(() => {
      expect(screen.getByText("This graph output is not valid for rendering.")).toBeTruthy();
    });
  });
});
