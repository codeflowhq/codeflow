// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExportState } from "./useExportState";

const { fileMock, generateAsyncMock } = vi.hoisted(() => ({
  fileMock: vi.fn(),
  generateAsyncMock: vi.fn(async () => new Blob(["zip"])),
}));

vi.mock("jszip", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      file: fileMock,
      generateAsync: generateAsyncMock,
    };
  }),
}));

describe("useExportState", () => {
  const messageApi = { success: vi.fn() };
  const createObjectURL = vi.fn(() => "blob:test");
  const revokeObjectURL = vi.fn();
  const anchorClick = vi.fn();

  beforeEach(() => {
    messageApi.success.mockReset();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    anchorClick.mockClear();
    fileMock.mockClear();
    generateAsyncMock.mockClear();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(anchorClick);

    vi.stubGlobal(
      "Image",
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        naturalWidth = 10;
        naturalHeight = 10;
        width = 10;
        height = 10;

        set src(_value: string) {
          queueMicrotask(() => {
            this.onload?.();
          });
        }
      },
    );

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback?.(new Blob(["png"]));
    }) as typeof HTMLCanvasElement.prototype.toBlob;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("exports the rendered current-step panels and reports success", async () => {
    const { result } = renderHook(() =>
      useExportState({
        exportSources: {
          data: "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>",
          graph: "<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'></svg>",
        },
        messageApi,
        projectName: "Demo Project",
      }),
    );

    await act(async () => {
      await result.current.handleExport("current");
    });

    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(fileMock).toHaveBeenCalledTimes(2);
    expect(fileMock).toHaveBeenCalledWith(
      "demo-project-data-current-step.png",
      expect.any(Blob),
    );
    expect(fileMock).toHaveBeenCalledWith(
      "demo-project-graph-current-step.png",
      expect.any(Blob),
    );
    expect(messageApi.success).toHaveBeenCalledWith(
      "Exported 2 visualizations for the current step.",
    );
  });

  it("ignores empty export source entries", async () => {
    const { result } = renderHook(() =>
      useExportState({
        exportSources: {
          data: "   ",
          graph: "<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'></svg>",
        },
        messageApi,
        projectName: "Demo Project",
      }),
    );

    await act(async () => {
      await result.current.handleExport("current");
    });

    expect(fileMock).toHaveBeenCalledTimes(1);
    expect(fileMock).toHaveBeenCalledWith(
      "demo-project-graph-current-step.png",
      expect.any(Blob),
    );
  });

  it("throws a clear error when no current-step panel has rendered export content", async () => {
    const { result } = renderHook(() =>
      useExportState({
        exportSources: {},
        messageApi,
        projectName: "Demo Project",
      }),
    );

    await expect(result.current.handleExport("current")).rejects.toThrow(
      "Run once and wait for the current step to finish rendering before exporting.",
    );
  });

  it("rejects export when the browser cannot create a canvas context", async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    const { result } = renderHook(() =>
      useExportState({
        exportSources: {
          data: "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>",
        },
        messageApi,
        projectName: "Demo Project",
      }),
    );

    await expect(result.current.handleExport("current")).rejects.toThrow(
      "Canvas export is unavailable in this browser.",
    );
  });

  it("rejects export when PNG blob generation fails", async () => {
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback?.(null);
    }) as typeof HTMLCanvasElement.prototype.toBlob;

    const { result } = renderHook(() =>
      useExportState({
        exportSources: {
          data: "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>",
        },
        messageApi,
        projectName: "Demo Project",
      }),
    );

    await expect(result.current.handleExport("current")).rejects.toThrow(
      "PNG export failed.",
    );
  });

  it("rejects export when the SVG image cannot be loaded", async () => {
    vi.stubGlobal(
      "Image",
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;

        set src(_value: string) {
          queueMicrotask(() => {
            this.onerror?.();
          });
        }
      },
    );

    const { result } = renderHook(() =>
      useExportState({
        exportSources: {
          data: "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>",
        },
        messageApi,
        projectName: "Demo Project",
      }),
    );

    await expect(result.current.handleExport("current")).rejects.toThrow(
      "Could not load SVG for PNG export.",
    );
  });
});
