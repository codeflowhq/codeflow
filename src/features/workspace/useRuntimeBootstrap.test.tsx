// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRuntimeBootstrap } from "./useRuntimeBootstrap";

const initializeBrowserRuntimeMock = vi.fn();

vi.mock("../../runtime/python-bridge", () => ({
  initializeBrowserRuntime: () => initializeBrowserRuntimeMock(),
}));

describe("useRuntimeBootstrap", () => {
  it("reports normalized bootstrap errors", async () => {
    const onError = vi.fn();
    initializeBrowserRuntimeMock.mockRejectedValueOnce(
      new Error(
        "HTTP 404 while downloading https://github.com/edcraft-org/step-tracer/releases/latest/download/step_tracer-browser.whl",
      ),
    );

    const { result } = renderHook(() => useRuntimeBootstrap({ onError }));

    await waitFor(() => {
      expect(result.current).toBe(false);
      expect(onError).toHaveBeenCalledWith(
        "Browser runtime failed",
        "A required browser runtime wheel could not be downloaded from GitHub Releases. Publish the wheel release asset or update the runtime wheel URL.",
      );
    });
  });
});
