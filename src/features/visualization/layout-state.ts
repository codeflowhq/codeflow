import type {
  OverlayGroup,
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";

export const EMPTY_LAYOUT_STATE: VisualizationLayoutState = {
  mode: "masonry",
  masonryOrder: [],
  overlayGroups: [],
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

const sanitizeOverlayGroups = (value: unknown): OverlayGroup[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const claimedVariables = new Set<string>();
  const groups: OverlayGroup[] = [];
  value.forEach((group) => {
    if (!group || typeof group !== "object") {
      return;
    }
    const raw = group as { id?: unknown; variables?: unknown; layerOrder?: unknown };
    const variables = Array.isArray(raw.variables)
      ? [...new Set(raw.variables.filter((item): item is string => typeof item === "string"))]
      : [];
    const layerOrder = Array.isArray(raw.layerOrder)
      ? [...new Set(raw.layerOrder.filter((item): item is string => typeof item === "string"))]
      : [];
    const isValid = variables.length >= 2
      && layerOrder.length === variables.length
      && variables.every((item) => layerOrder.includes(item))
      && variables.every((item) => !claimedVariables.has(item));
    if (!isValid) {
      return;
    }
    variables.forEach((item) => claimedVariables.add(item));
    groups.push({
      id: typeof raw.id === "string" ? raw.id : `overlay-${variables.join("-")}`,
      variables,
      layerOrder,
    });
  });
  return groups;
};

export const mergeOverlayGroups = (
  groups: OverlayGroup[],
  selectedVariables: string[],
): OverlayGroup[] => {
  const expandedVariables = [...new Set(selectedVariables.flatMap((variable) => (
    groups.find((group) => group.variables.includes(variable))?.layerOrder ?? [variable]
  )))];
  if (expandedVariables.length < 2) {
    return groups;
  }
  return [
    ...groups.filter((group) => !group.variables.some((name) => expandedVariables.includes(name))),
    {
      id: `overlay-${expandedVariables.join("-")}`,
      variables: expandedVariables,
      layerOrder: expandedVariables,
    },
  ];
};

export const removeOverlayVariable = (
  groups: OverlayGroup[],
  variable: string,
): OverlayGroup[] => groups.flatMap((group) => {
  if (!group.variables.includes(variable)) {
    return [group];
  }
  const variables = group.variables.filter((name) => name !== variable);
  const layerOrder = group.layerOrder.filter((name) => name !== variable);
  return variables.length >= 2 ? [{ ...group, variables, layerOrder }] : [];
});

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
    overlayGroups: sanitizeOverlayGroups(candidate.overlayGroups),
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
  overlayGroups: (state.overlayGroups ?? []).map((group) => ({
    ...group,
    variables: [...group.variables],
    layerOrder: [...group.layerOrder],
  })),
  windows: {
    layouts: Object.fromEntries(
      Object.entries(state.windows.layouts).map(([key, layout]) => [key, { ...layout }]),
    ),
    zIndices: { ...state.windows.zIndices },
  },
});
