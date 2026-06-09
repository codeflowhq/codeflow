import type { ViewKind } from "../types/visualization";

const DEPTH_CAPABLE_VIEW_KINDS: ReadonlySet<ViewKind> = new Set([
  "array_cells",
  "matrix",
  "table",
  "hash_table",
  "linked_list",
  "heap_dual",
  "tree",
  "graph",
  "image",
]);

const COLOR_CAPABLE_VIEW_KINDS: ReadonlySet<ViewKind> = new Set([
  "array_cells",
  "matrix",
  "table",
  "bar",
]);

export const viewKindSupportsColor = (viewKind: ViewKind) => COLOR_CAPABLE_VIEW_KINDS.has(viewKind);
export const viewKindSupportsDepth = (viewKind: ViewKind) => DEPTH_CAPABLE_VIEW_KINDS.has(viewKind);

export const viewSelectionSupportsColor = (viewKind: ViewKind, availableOptions: ViewKind[]) => {
  if (viewKind === "auto") {
    return availableOptions.some((option) => option !== "auto" && viewKindSupportsColor(option));
  }
  return viewKindSupportsColor(viewKind);
};

export const viewSelectionSupportsDepth = (viewKind: ViewKind, availableOptions: ViewKind[]) => {
  if (viewKind === "auto") {
    return availableOptions.some((option) => option !== "auto" && viewKindSupportsDepth(option));
  }
  return viewKindSupportsDepth(viewKind);
};
