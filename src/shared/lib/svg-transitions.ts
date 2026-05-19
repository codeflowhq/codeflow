const SVG_TRANSITION_MS = 400;
const SVG_TRANSITION_EASING = "ease";
const SVG_TRANSITION_CLEANUP_BUFFER_MS = 100;

export type SvgTransitionStyles = Record<string, string>;

export const SVG_TRANSITION_TIMEOUT_MS = SVG_TRANSITION_MS + SVG_TRANSITION_CLEANUP_BUFFER_MS;

export const buildSvgTransitionDeclaration = (properties: string[]): string => (
  properties
    .map((property) => `${property} ${SVG_TRANSITION_MS}ms ${SVG_TRANSITION_EASING}`)
    .join(", ")
);
