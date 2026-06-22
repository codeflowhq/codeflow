import { useEffect, useState } from "react";

import type {
  VisualizationLayoutMode,
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";
import { cloneLayoutState, EMPTY_LAYOUT_STATE, sanitizeLayoutState } from "./layout-state";

const LAYOUT_STATE_STORAGE_KEY = "codeflow.visualization.layout-state";

const readStoredLayoutState = (): VisualizationLayoutState => {
  if (
    typeof window === "undefined"
    || typeof window.localStorage === "undefined"
    || typeof window.localStorage.getItem !== "function"
  ) {
    return cloneLayoutState(EMPTY_LAYOUT_STATE);
  }
  try {
    const rawValue = window.localStorage.getItem(LAYOUT_STATE_STORAGE_KEY);
    return sanitizeLayoutState(rawValue ? JSON.parse(rawValue) : null);
  } catch {
    return cloneLayoutState(EMPTY_LAYOUT_STATE);
  }
};

export const useLayoutModeState = () => {
  const [layoutState, setLayoutState] = useState<VisualizationLayoutState>(() => readStoredLayoutState());

  useEffect(() => {
    if (
      typeof window === "undefined"
      || typeof window.localStorage === "undefined"
      || typeof window.localStorage.setItem !== "function"
    ) {
      return;
    }
    window.localStorage.setItem(LAYOUT_STATE_STORAGE_KEY, JSON.stringify(layoutState));
  }, [layoutState]);

  const setLayoutMode = (mode: VisualizationLayoutMode) => {
    setLayoutState((prev) => ({ ...prev, mode }));
  };

  const setMasonryOrder = (masonryOrder: string[]) => {
    setLayoutState((prev) => ({ ...prev, masonryOrder }));
  };

  const setWindowLayout = (variable: string, layout: VisualizationWindowLayout) => {
    setLayoutState((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        layouts: {
          ...prev.windows.layouts,
          [variable]: layout,
        },
      },
    }));
  };

  const setWindowZIndex = (variable: string, zIndex: number) => {
    setLayoutState((prev) => ({
      ...prev,
      windows: {
        ...prev.windows,
        zIndices: {
          ...prev.windows.zIndices,
          [variable]: zIndex,
        },
      },
    }));
  };

  const replaceLayoutState = (nextState: VisualizationLayoutState) => {
    setLayoutState(cloneLayoutState(sanitizeLayoutState(nextState)));
  };

  return {
    layoutMode: layoutState.mode,
    layoutState,
    masonryOrder: layoutState.masonryOrder,
    windowLayouts: layoutState.windows.layouts,
    windowZIndices: layoutState.windows.zIndices,
    setLayoutMode,
    setMasonryOrder,
    setWindowLayout,
    setWindowZIndex,
    replaceLayoutState,
  };
};
