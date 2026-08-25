// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useNavigationState } from "./useNavigationState";

describe("useNavigationState", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("canonicalizes the root path to /workspace", () => {
    const { result } = renderHook(() => useNavigationState());

    expect(result.current.topMenuKey).toBe("visualization");
    expect(result.current.vizMenuKey).toBe("main");
    expect(window.location.pathname).toBe("/workspace");
  });

  it("initializes from the current pathname", () => {
    window.history.replaceState({}, "", "/collections");

    const { result } = renderHook(() => useNavigationState());

    expect(result.current.topMenuKey).toBe("library");
    expect(result.current.vizMenuKey).toBe("main");
  });

  it("pushes URL updates for navigation actions", () => {
    const { result } = renderHook(() => useNavigationState());

    act(() => {
      result.current.openVisualizationConfig();
    });
    expect(window.location.pathname).toBe("/settings");
    expect(result.current.vizMenuKey).toBe("config");

    act(() => {
      result.current.openLibrary();
    });
    expect(window.location.pathname).toBe("/collections");
    expect(result.current.topMenuKey).toBe("library");
  });

  it("responds to browser back/forward style popstate updates", () => {
    const { result } = renderHook(() => useNavigationState());

    act(() => {
      window.history.pushState({}, "", "/settings");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.topMenuKey).toBe("visualization");
    expect(result.current.vizMenuKey).toBe("config");

    act(() => {
      window.history.pushState({}, "", "/collections");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.topMenuKey).toBe("library");
    expect(result.current.vizMenuKey).toBe("main");
  });
});
