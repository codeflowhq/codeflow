import type {
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";

export const EMPTY_LAYOUT_STATE: VisualizationLayoutState = {
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

export const sanitizeLayoutState = (value: unknown): VisualizationLayoutState => {
  if (!value || typeof value !== "object") {
    return cloneLayoutState(EMPTY_LAYOUT_STATE);
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
            .filter(([, layout]) => isWindowLayout(layout))
            .map(([key, layout]) => [key, { ...layout }]),
        )
        : {},
      zIndices: candidate.windows?.zIndices && typeof candidate.windows.zIndices === "object"
        ? Object.fromEntries(
          Object.entries(candidate.windows.zIndices)
            .filter(([, zIndex]) => typeof zIndex === "number"),
        )
        : {},
    },
  };
};

export const cloneLayoutState = (state: VisualizationLayoutState): VisualizationLayoutState => ({
  mode: state.mode,
  masonryOrder: [...state.masonryOrder],
  windows: {
    layouts: Object.fromEntries(
      Object.entries(state.windows.layouts).map(([key, layout]) => [key, { ...layout }]),
    ),
    zIndices: { ...state.windows.zIndices },
  },
});
