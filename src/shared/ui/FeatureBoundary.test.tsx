// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FeatureBoundary from "./FeatureBoundary";

const BrokenComponent = () => {
  throw new Error("SyntaxError: invalid syntax");
};

describe("FeatureBoundary", () => {
  it("renders a friendly fallback for render errors", async () => {
    render(
      <FeatureBoundary title="The watch panel failed to render.">
        <BrokenComponent />
      </FeatureBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByText("The watch panel failed to render.")).toBeTruthy();
      expect(screen.getByText("Python syntax error. Check the code and try again.")).toBeTruthy();
    });
  });

  it("notifies the shared error owner and exposes a retry action when configured", async () => {
    const onError = vi.fn();
    const onAction = vi.fn();

    render(
      <FeatureBoundary
        title="The visualization panel failed to render."
        actionLabel="Run again"
        onAction={onAction}
        onError={onError}
      >
        <BrokenComponent />
      </FeatureBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByText("Run again")).toBeTruthy();
    });

    expect(onError).toHaveBeenCalledWith(
      "The visualization panel failed to render.",
      "Python syntax error. Check the code and try again.",
    );
  });
});
