// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExportState } from "./useExportState";

const fileMock = vi.fn();
const generateAsyncMock = vi.fn(async () => new Blob(["zip"]));

vi.mock("jszip", () => ({
  default: vi.fn().mockImplementation(() => ({
    file: fileMock,
    generateAsync: generateAsyncMock,
  })),
}));

const exportSources = {
  data: "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'></svg>",
};

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
    vi.stubGlobal("Image", class {
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
    });
    HTMLCanvasElement.prototype.getContext = (
      vi.fn(() => ({
        drawImage: vi.fn(),
      })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    );
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback?.(new Blob(["png"]));
    }) as typeof HTMLCanvasElement.prototype.toBlob;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("exports current svg panels and reports success", async () => {
    const { result } = renderHook(() => useExportState({
      activeTimelineKey: "frame-1",
      exportSources,
      messageApi,
      projectName: "Demo Project",
    }));

    await act(async () => {
      await result.current.handleExport();
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(fileMock).toHaveBeenCalledTimes(1);
    expect(generateAsyncMock).toHaveBeenCalledTimes(1);
    expect(messageApi.success).toHaveBeenCalledWith("Exported 1 visualization.");
  });

  it("throws a clear error when no panels are available", async () => {
    const { result } = renderHook(() => useExportState({
      activeTimelineKey: "frame-1",
      exportSources: {},
      messageApi,
      projectName: "Demo Project",
    }));

    await expect(result.current.handleExport()).rejects.toThrow("Nothing exportable is visible right now.");
    expect(messageApi.success).not.toHaveBeenCalled();
  });
});
