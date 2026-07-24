// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultGlobalConfig, defaultVariableConfig } from "../../configDefaults";
import type { ManifestEntry, VariableConfig } from "../../shared/types/visualization";

const { runVisualizationInBrowserMock } = vi.hoisted(() => ({
  runVisualizationInBrowserMock: vi.fn(),
}));

vi.mock("../../runtime/python-bridge", () => ({
  runVisualizationInBrowser: runVisualizationInBrowserMock,
}));

import { useVisualizationRun } from "./useVisualizationRun";

const variableConfigs: Record<string, VariableConfig> = {
  data: defaultVariableConfig,
};

const manifest: ManifestEntry[] = [
  {
    variable: "data",
    kind: "svg",
    steps: [{ stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 1, svg: "<svg />" }],
  },
];

describe("useVisualizationRun", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in the idle state with an empty manifest", () => {
    const { result } = renderHook(() =>
      useVisualizationRun({
        globalConfig: defaultGlobalConfig,
        sourceCode: "data = [1]",
        variableConfigs,
        watchVariables: ["data"],
      }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.statusMessage).toBe("");
    expect(result.current.manifest).toEqual([]);
  });

  it("moves through loading to ready and keeps returned manifest data", async () => {
    let resolveRun: ((value: { manifest: ManifestEntry[] }) => void) | undefined;
    runVisualizationInBrowserMock.mockImplementation(
      () =>
        new Promise<{ manifest: ManifestEntry[] }>((resolve) => {
          resolveRun = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useVisualizationRun({
        globalConfig: defaultGlobalConfig,
        sourceCode: "data = [1]",
        variableConfigs,
        watchVariables: ["data"],
      }),
    );

    let pending: Promise<unknown> | undefined;
    await act(async () => {
      pending = result.current.runVisualization();
    });

    expect(result.current.status).toBe("loading");
    expect(result.current.statusMessage).toBe("Loading browser runtime…");

    await act(async () => {
      resolveRun?.({ manifest });
      await pending;
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.statusMessage).toBe("");
    expect(result.current.manifest).toEqual(manifest);
    expect(runVisualizationInBrowserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        snippet: "data = [1]",
        watch: ["data"],
      }),
    );
  });

  it("omits empty watch lists at the request boundary", async () => {
    runVisualizationInBrowserMock.mockResolvedValue({ manifest: [] });

    const { result } = renderHook(() =>
      useVisualizationRun({
        globalConfig: defaultGlobalConfig,
        sourceCode: "data = [1]",
        variableConfigs,
        watchVariables: [],
      }),
    );

    await act(async () => {
      await result.current.runVisualization();
    });

    expect(runVisualizationInBrowserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        watch: undefined,
      }),
    );
  });

  it("shows a definition-only hint when code defines a callable but never invokes it", async () => {
    runVisualizationInBrowserMock.mockResolvedValue({ manifest: [] });

    const { result } = renderHook(() =>
      useVisualizationRun({
        globalConfig: defaultGlobalConfig,
        sourceCode: "def bubble_sort(arr):\n    return sorted(arr)\n",
        variableConfigs,
        watchVariables: ["data"],
      }),
    );

    await act(async () => {
      await result.current.runVisualization();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.statusMessage).toBe(
      "You defined a function or class, but nothing called it. Call the function and assign the result to a watched variable, for example: data = bubble_sort([5, 1, 4, 2, 8])",
    );
  });

  it("clears stale manifest state and exposes an error state when the runtime fails", async () => {
    let rejectRun: ((reason?: unknown) => void) | undefined;
    runVisualizationInBrowserMock
      .mockResolvedValueOnce({ manifest })
      .mockImplementationOnce(
        () =>
          new Promise<never>((_resolve, reject) => {
            rejectRun = reject;
          }),
      );

    const { result } = renderHook(() =>
      useVisualizationRun({
        globalConfig: defaultGlobalConfig,
        sourceCode: "data = [1]",
        variableConfigs,
        watchVariables: ["data"],
      }),
    );

    await act(async () => {
      await result.current.runVisualization();
    });
    expect(result.current.manifest).toEqual(manifest);

    let pending: Promise<unknown> | undefined;
    await act(async () => {
      pending = result.current.runVisualization();
    });

    await expect(
      act(async () => {
        rejectRun?.(new Error("RuntimeError: Browser dependency import failed. Please reload the page."));
        await pending;
      }),
    ).rejects.toThrow("RuntimeError: Browser dependency import failed. Please reload the page.");

    await act(async () => {});

    expect(result.current.status).toBe("error");
    expect(result.current.statusMessage).toBe("Browser runtime is not ready. Reload the page and try again.");
    expect(result.current.manifest).toEqual([]);
  });
});
