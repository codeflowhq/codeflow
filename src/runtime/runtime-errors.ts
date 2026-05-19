type FriendlyPattern = {
  pattern: RegExp;
  message: string;
};

const FRIENDLY_PATTERNS: FriendlyPattern[] = [
  { pattern: /SyntaxError:/i, message: "Python syntax error. Check the code and try again." },
  { pattern: /Browser dependency import failed/i, message: "Browser runtime is not ready. Reload the page and try again." },
  { pattern: /Invalid converter spec/i, message: "Custom converter format is invalid. Use package.module:function_name." },
  { pattern: /ModuleNotFoundError:/i, message: "A required Python module is missing in the browser runtime." },
  { pattern: /No module named/i, message: "A required runtime package is missing." },
  { pattern: /MissingDependencyError/i, message: "A required tracing dependency is missing from the browser runtime." },
  { pattern: /step-tracer or query-engine is missing/i, message: "Tracing dependencies are missing from the browser runtime." },
  { pattern: /heap_dual_node view expects list input/i, message: "Heap dual view only works with list data." },
  { pattern: /array_cells_node view expects a list-like input/i, message: "The selected array view only works with list-like data." },
  { pattern: /TypeError:/i, message: "The selected view does not match the current variable value." },
  { pattern: /ValueError:/i, message: "The current config is not valid for this visualization." },
  { pattern: /Failed to download remote image/i, message: "The image URL could not be loaded in the browser runtime." },
  { pattern: /Cannot download from a non-remote location/i, message: "A runtime wheel path is invalid for the browser environment." },
  { pattern: /Requested 'numpy/i, message: "A runtime package version conflicts with the browser environment." },
  { pattern: /Requested 'matplotlib/i, message: "A runtime package version conflicts with the browser environment." },
];

const GRAPH_RENDER_PATTERNS: FriendlyPattern[] = [
  { pattern: /syntax error in line/i, message: "This graph output is not valid for rendering." },
  { pattern: /transition .* not found/i, message: "The graph animation state was reset. Run again." },
  { pattern: /DOMParser/i, message: "This SVG output could not be displayed." },
];

const COMPACT_ERROR_PREFIX = /^Status:\s*/i;

const getRawMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error ?? fallback);
};

const extractUsefulLine = (compact: string): string | undefined => {
  const lines = compact.split("\n").map((line) => line.trim()).filter(Boolean);
  return [...lines]
    .reverse()
    .find((line) => /Error:|Exception:|SyntaxError:|TypeError:|ValueError:/.test(line));
};

export const normalizeRuntimeError = (error: unknown): string => {
  const compact = getRawMessage(error, "Unexpected error.").replace(COMPACT_ERROR_PREFIX, "").trim();
  const matched = FRIENDLY_PATTERNS.find(({ pattern }) => pattern.test(compact));
  if (matched) {
    return matched.message;
  }

  const usefulLine = extractUsefulLine(compact);
  return usefulLine?.replace(/^[A-Za-z_.]*Error:\s*/i, "") || "Visualization failed. Please adjust the code or config and try again.";
};

export const normalizeGraphRenderError = (error: unknown): string => {
  const compact = getRawMessage(error, "Graph render failed.").replace(COMPACT_ERROR_PREFIX, "").trim();
  const matched = GRAPH_RENDER_PATTERNS.find(({ pattern }) => pattern.test(compact));
  if (matched) {
    return matched.message;
  }
  return "This graph could not be rendered.";
};

export const normalizeUnexpectedAppError = (error: unknown): string => {
  const compact = getRawMessage(error, "Unexpected application error.").replace(COMPACT_ERROR_PREFIX, "").trim();
  const runtimeMatch = FRIENDLY_PATTERNS.find(({ pattern }) => pattern.test(compact));
  if (runtimeMatch) {
    return runtimeMatch.message;
  }
  const graphMatch = GRAPH_RENDER_PATTERNS.find(({ pattern }) => pattern.test(compact));
  if (graphMatch) {
    return graphMatch.message;
  }
  const usefulLine = extractUsefulLine(compact);
  return usefulLine?.replace(/^[A-Za-z_.]*Error:\s*/i, "") || "Something went wrong in the app. Reload the page and try again.";
};
