import { useEffect, useState } from "react";

import type {
  VisualizationLayoutMode,
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";

const LAYOUT_STATE_STORAGE_KEY = "codeflow.visualization.layout-state";

const EMPTY_LAYOUT_STATE: VisualizationLayoutState = {
  mode: "masonry",
  masonryOrder: [],
  windows: {
    layouts: {},
    zIndices: {},
  },
};

const isWindowLayout = (value: unknown): value is VisualizationWindowLayout => (
  Boolean(value)
  && typeof value === "object"
  && typeof (value as VisualizationWindowLayout).x === "number"
  && typeof (value as VisualizationWindowLayout).y === "number"
  && typeof (value as VisualizationWindowLayout).width === "number"
  && typeof (value as VisualizationWindowLayout).height === "number"
);

const sanitizeLayoutState = (value: unknown): VisualizationLayoutState => {
  if (!value || typeof value !== "object") {
    return EMPTY_LAYOUT_STATE;
  }
  const candidate = value as Partial<VisualizationLayoutState>;
  return {
    mode: candidate.mode === "windows" ? "windows" : "masonry",
    masonryOrder: Array.isArray(candidate.masonryOrder)
      ? candidate.masonryOrder.filter((item): item is string => typeof item === "string")
      : [],
    windows: {
      layouts: candidate.windows?.layouts && typeof candidate.windows.layouts === "object"
        ? Object.fromEntries(
          Object.entries(candidate.windows.layouts)
            .filter(([, layout]) => isWindowLayout(layout)),
        )
        : {},
      zIndices: candidate.windows?.zIndices && typeof candidate.windows.zIndices === "object"
        ? Object.fromEntries(
          Object.entries(candidate.windows.zIndices)
            .filter(([, value]) => typeof value === "number"),
        )
        : {},
    },
  };
};

const readStoredLayoutState = (): VisualizationLayoutState => {
  if (
    typeof window === "undefined"
    || typeof window.localStorage === "undefined"
    || typeof window.localStorage.getItem !== "function"
  ) {
    return EMPTY_LAYOUT_STATE;
  }
  try {
    const rawValue = window.localStorage.getItem(LAYOUT_STATE_STORAGE_KEY);
    return sanitizeLayoutState(rawValue ? JSON.parse(rawValue) : null);
  } catch {
    return EMPTY_LAYOUT_STATE;
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
    setLayoutState(sanitizeLayoutState(nextState));
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
