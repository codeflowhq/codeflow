// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PageBoundary from "./PageBoundary";

const BrokenPage = () => {
  throw new Error("ModuleNotFoundError: No module named 'numpy'");
};

describe("PageBoundary", () => {
  it("renders a page-level fallback with a reload action", async () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload },
    });

    render(
      <PageBoundary title="The collections page failed to load.">
        <BrokenPage />
      </PageBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByText("The collections page failed to load.")).toBeTruthy();
      expect(screen.getByText("Missing Python package: numpy. Add it in Settings > Runtime packages, then run again.")).toBeTruthy();
      expect(screen.getByText("Reload page")).toBeTruthy();
    });
  });
});
