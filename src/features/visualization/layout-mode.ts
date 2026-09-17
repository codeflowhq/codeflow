import { useEffect, useState } from "react";

import type {
  VisualizationLayoutMode,
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";
import { cloneLayoutState, EMPTY_LAYOUT_STATE, mergeOverlayGroups, removeOverlayVariable, sanitizeLayoutState } from "./layout-state";

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

  const createOverlayGroup = (variables: string[]) => {
    const uniqueVariables = [...new Set(variables)];
    if (uniqueVariables.length < 2) {
      return;
    }
    setLayoutState((prev) => ({
      ...prev,
      overlayGroups: mergeOverlayGroups(prev.overlayGroups, uniqueVariables),
    }));
  };

  const removeOverlayGroup = (groupId: string) => {
    setLayoutState((prev) => ({
      ...prev,
      overlayGroups: prev.overlayGroups.filter((group) => group.id !== groupId),
    }));
  };

  const removeVariableFromOverlayGroups = (variable: string) => {
    setLayoutState((prev) => ({
      ...prev,
      overlayGroups: removeOverlayVariable(prev.overlayGroups, variable),
    }));
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
    createOverlayGroup,
    removeOverlayGroup,
    removeVariableFromOverlayGroups,
    setWindowLayout,
    setWindowZIndex,
    replaceLayoutState,
  };
};
