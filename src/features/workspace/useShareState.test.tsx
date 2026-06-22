// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultGlobalConfig, defaultVariableConfig, SHARE_PARAM } from "../../configDefaults";
import type { GlobalConfig, TopMenuKey, VariableConfig, VizMenuKey } from "../../shared/types/visualization";
import { useShareState } from "./useShareState";

const setGlobalConfig = vi.fn();
const setSourceCode = vi.fn();
const setStatusMessage = vi.fn();
const setTopMenuKey = vi.fn();
const setVariableConfigs = vi.fn();
const setVizMenuKey = vi.fn();
const setWatchVariables = vi.fn();
const messageApi = { success: vi.fn() };

const makeOptions = (overrides: Partial<{
  globalConfig: GlobalConfig;
  sourceCode: string;
  variableConfigs: Record<string, VariableConfig>;
  watchVariables: string[];
}> = {}) => ({
  defaultGlobalConfig,
  defaultSnippet: "data = [1]",
  globalConfig: overrides.globalConfig ?? defaultGlobalConfig,
  messageApi,
  setGlobalConfig,
  setSourceCode,
  setStatusMessage,
  setTopMenuKey: setTopMenuKey as unknown as Dispatch<SetStateAction<TopMenuKey>>,
  setVariableConfigs,
  setVizMenuKey: setVizMenuKey as unknown as Dispatch<SetStateAction<VizMenuKey>>,
  setWatchVariables,
  shareParam: SHARE_PARAM,
  sourceCode: overrides.sourceCode ?? "data = [1]",
  variableConfigs: overrides.variableConfigs ?? { data: defaultVariableConfig },
  watchVariables: overrides.watchVariables ?? ["data"],
});

const buildShareParam = (payload: unknown): string =>
  btoa(encodeURIComponent(JSON.stringify(payload)));

describe("useShareState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("https://example.com/app"),
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("does nothing when no share parameter is present", () => {
    renderHook(() => useShareState(makeOptions()));

    expect(setSourceCode).not.toHaveBeenCalled();
    expect(setStatusMessage).not.toHaveBeenCalled();
  });

  it("restores shared state and switches the app into visualization mode", () => {
    const sharedUrl = new URL("https://example.com/app");
    sharedUrl.searchParams.set(SHARE_PARAM, buildShareParam({
      sourceCode: "queue = []",
      watchVariables: ["queue"],
      globalConfig: { ...defaultGlobalConfig, maxDepth: 4 },
      variableConfigs: { queue: { ...defaultVariableConfig, depth: 2 } },
    }));
    Object.defineProperty(window, "location", { configurable: true, value: sharedUrl });

    renderHook(() => useShareState(makeOptions()));

    expect(setSourceCode).toHaveBeenCalledWith("queue = []");
    expect(setWatchVariables).toHaveBeenCalledWith(["queue"]);
    expect(setGlobalConfig).toHaveBeenCalledWith(expect.objectContaining({ maxDepth: 4 }));
    expect(setVariableConfigs).toHaveBeenCalledWith({
      queue: expect.objectContaining({ depth: 2 }),
    });
    expect(setTopMenuKey).toHaveBeenCalledWith("visualization");
    expect(setVizMenuKey).toHaveBeenCalledWith("main");
    expect(setStatusMessage).toHaveBeenCalledWith("Loaded shared state from URL.");
  });

  it("reports unreadable share links without mutating editor state", () => {
    const sharedUrl = new URL("https://example.com/app");
    sharedUrl.searchParams.set(SHARE_PARAM, "%%%invalid%%%");
    Object.defineProperty(window, "location", { configurable: true, value: sharedUrl });

    renderHook(() => useShareState(makeOptions()));

    expect(setStatusMessage).toHaveBeenCalledWith("Share link is invalid or unreadable.");
    expect(setSourceCode).not.toHaveBeenCalled();
    expect(setWatchVariables).not.toHaveBeenCalled();
  });

  it("fills missing share payload fields with defaults", () => {
    const sharedUrl = new URL("https://example.com/app");
    sharedUrl.searchParams.set(SHARE_PARAM, buildShareParam({
      watchVariables: undefined,
      globalConfig: undefined,
      variableConfigs: undefined,
    }));
    Object.defineProperty(window, "location", { configurable: true, value: sharedUrl });

    renderHook(() => useShareState(makeOptions()));

    expect(setSourceCode).toHaveBeenCalledWith("data = [1]");
    expect(setWatchVariables).toHaveBeenCalledWith(["data"]);
    expect(setGlobalConfig).toHaveBeenCalledWith(defaultGlobalConfig);
    expect(setVariableConfigs).toHaveBeenCalledWith({});
    expect(setStatusMessage).toHaveBeenCalledWith("Loaded shared state from URL.");
  });

  it("accepts partial share payloads without treating them as unreadable", () => {
    const sharedUrl = new URL("https://example.com/app");
    sharedUrl.searchParams.set(SHARE_PARAM, buildShareParam({
      sourceCode: "queue = []",
    }));
    Object.defineProperty(window, "location", { configurable: true, value: sharedUrl });

    renderHook(() => useShareState(makeOptions()));

    expect(setSourceCode).toHaveBeenCalledWith("queue = []");
    expect(setWatchVariables).toHaveBeenCalledWith(["data"]);
    expect(setGlobalConfig).toHaveBeenCalledWith(defaultGlobalConfig);
    expect(setVariableConfigs).toHaveBeenCalledWith({});
    expect(setStatusMessage).toHaveBeenCalledWith("Loaded shared state from URL.");
  });

  it("copies a share URL for the current state and reports success", async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { result } = renderHook(() =>
      useShareState(
        makeOptions({
          sourceCode: "data = [1]",
          watchVariables: ["data"],
        }),
      ),
    );

    await act(async () => {
      await result.current.handleShare();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const shareCalls = writeText.mock.calls as unknown as Array<[string]>;
    expect(String(shareCalls[0]?.[0])).toContain(`${SHARE_PARAM}=`);
    expect(messageApi.success).toHaveBeenCalledWith("Share link copied.");
  });

  it("surfaces clipboard failures through the returned promise", async () => {
    const writeText = vi.fn(async () => {
      throw new Error("clipboard blocked");
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { result } = renderHook(() => useShareState(makeOptions()));

    await expect(result.current.handleShare()).rejects.toThrow("clipboard blocked");
    expect(messageApi.success).not.toHaveBeenCalled();
  });
});
