import { useEffect, useRef, useState } from "react";

import { loadGraphvizRuntime } from "../../../shared/lib/graphviz-runtime";
import { normalizeGraphRenderError } from "../../../runtime/runtime-errors";
import ErrorState from "../../../shared/ui/ErrorState";

const BAR_TRANSITION_DURATION_MS = 700;
const GRAPHVIZ_TRANSITION_DURATION_MS = 300;
const AUTO_SCALE_CONTAINER_PADDING = 24;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

type GraphvizInstance = {
  zoom: (enabled: boolean) => GraphvizInstance;
  fade?: (enabled: boolean) => GraphvizInstance;
  tweenPaths?: (enabled: boolean) => GraphvizInstance;
  tweenShapes?: (enabled: boolean) => GraphvizInstance;
  growEnteringEdges?: (enabled: boolean) => GraphvizInstance;
  keyMode?: (mode: "title") => GraphvizInstance;
  on?: (event: string, listener: () => void) => GraphvizInstance;
  transition?: (factory: () => unknown) => GraphvizInstance;
  width?: (width: number) => GraphvizInstance;
  height?: (height: number) => GraphvizInstance;
  fit?: (enabled: boolean) => GraphvizInstance;
  destroy?: () => GraphvizInstance;
  renderDot: (dot: string, callback?: () => void) => Promise<unknown> | unknown;
};

type AnimationMode = "bar" | "graph" | "none";

type GraphvizPanelProps = {
  dot: string;
  debugName?: string;
  animate?: boolean;
  animationMode?: AnimationMode;
  onSvgChange?: (svg: string | null) => void;
  sizingMode?: "intrinsic" | "responsive";
  fixedViewport?: boolean;
};

const parseSvgDimension = (value: string | null): number | null => {
  if (!value) {
    return null;
  }
  const match = value.match(/^\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const getIntrinsicSvgWidth = (svg: SVGSVGElement): number | null => {
  const viewBox = svg.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0) {
    return viewBox.width;
  }
  const widthAttr = parseSvgDimension(svg.getAttribute("width"));
  if (widthAttr && widthAttr > 0) {
    return widthAttr;
  }
  try {
    const box = svg.getBBox();
    if (box.width > 0) {
      return box.width;
    }
  } catch {
    // Ignore measurement failures before layout and keep the original size.
  }
  return null;
};

const applyAutoScale = (
  container: HTMLDivElement | null,
  sizingMode: "intrinsic" | "responsive",
  fixedViewport: boolean,
) => {
  if (!container) {
    return;
  }
  const svg = container.querySelector("svg");
  if (!(svg instanceof SVGSVGElement)) {
    return;
  }
  const intrinsicWidth = getIntrinsicSvgWidth(svg);
  const containerWidth = container.clientWidth || container.getBoundingClientRect().width;
  if (!intrinsicWidth || intrinsicWidth <= 0 || !containerWidth || containerWidth <= 0) {
    delete container.dataset.contentMode;
    svg.style.removeProperty("max-width");
    svg.style.removeProperty("width");
    return;
  }
  const maxDisplayWidth = Math.max(0, containerWidth - AUTO_SCALE_CONTAINER_PADDING);
  if (sizingMode === "intrinsic" && fixedViewport) {
    container.dataset.contentMode = "fit";
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxWidth = "100%";
    return;
  }
  if (sizingMode === "responsive") {
    container.dataset.contentMode = "fit";
    if (intrinsicWidth > maxDisplayWidth + 4) {
      svg.style.width = "100%";
      svg.style.maxWidth = "100%";
      return;
    }
  }
};

const getBarNodes = (container: HTMLDivElement): SVGGElement[] => (
  Array.from(container.querySelectorAll<SVGGElement>("g.node[id*='-bar-']"))
);

const toParentCoordinates = (
  parent: SVGGElement,
  x: number,
  y: number,
): { x: number; y: number } | null => {
  const matrix = parent.getScreenCTM();
  if (!matrix) {
    return null;
  }
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
  if (Math.abs(determinant) < 0.00001) {
    return null;
  }
  const translatedX = x - matrix.e;
  const translatedY = y - matrix.f;
  return {
    x: (matrix.d * translatedX - matrix.c * translatedY) / determinant,
    y: (-matrix.b * translatedX + matrix.a * translatedY) / determinant,
  };
};

const animateWrapperTransform = (
  wrapper: SVGGElement,
  node: SVGGElement,
  parent: Node,
  dx: number,
  dy: number,
) => {
  const start = performance.now();
  const removeWrapper = () => {
    if (node.parentNode === wrapper && wrapper.parentNode === parent) {
      parent.insertBefore(node, wrapper);
      wrapper.remove();
    }
  };
  const draw = (progress: number) => {
    const remaining = 1 - progress;
    wrapper.setAttribute("transform", `translate(${dx * remaining} ${dy * remaining})`);
  };
  const frame = (now: number) => {
    const elapsed = Math.min(1, (now - start) / BAR_TRANSITION_DURATION_MS);
    const eased = 1 - ((1 - elapsed) ** 3);
    draw(eased);
    if (elapsed < 1) {
      window.requestAnimationFrame(frame);
      return;
    }
    removeWrapper();
  };

  draw(0);
  window.requestAnimationFrame(frame);
};

const captureBarPositions = (container: HTMLDivElement): Map<string, DOMRect> => (
  new Map(
    getBarNodes(container)
      .filter((node) => Boolean(node.id))
      .map((node) => [node.id, node.getBoundingClientRect()]),
  )
);

const animateBarPositionChanges = (
  container: HTMLDivElement,
  previousPositions: Map<string, DOMRect>,
) => {
  getBarNodes(container).forEach((node) => {
    const previous = previousPositions.get(node.id);
    const current = node.getBoundingClientRect();
    if (!previous || Math.abs(previous.left - current.left) < 0.5) {
      return;
    }

    const previousCenterX = previous.left + previous.width / 2;
    const previousCenterY = previous.top + previous.height / 2;
    const currentCenterX = current.left + current.width / 2;
    const currentCenterY = current.top + current.height / 2;
    const parent = node.parentNode;
    if (!(parent instanceof SVGGElement)) {
      return;
    }
    const previousPoint = toParentCoordinates(parent, previousCenterX, previousCenterY);
    const currentPoint = toParentCoordinates(parent, currentCenterX, currentCenterY);
    if (!previousPoint || !currentPoint) {
      return;
    }
    const dx = previousPoint.x - currentPoint.x;
    const dy = previousPoint.y - currentPoint.y;

    // Graphviz owns the node transform. The temporary wrapper is animated in
    // the same SVG coordinate system, leaving that layout transform intact.
    const wrapper = document.createElementNS(SVG_NAMESPACE, "g");
    parent.insertBefore(wrapper, node);
    wrapper.appendChild(node);
    animateWrapperTransform(wrapper, node, parent, dx, dy);
  });
};

const configureGraphvizAnimation = (
  instance: GraphvizInstance,
  d3Transition: () => { duration: (duration: number) => unknown },
  animate: boolean,
  animationMode: AnimationMode,
) => {
  const useGraphTransition = animate && animationMode === "graph";
  instance.keyMode?.("title");
  instance.fade?.(false);
  instance.tweenPaths?.(useGraphTransition);
  instance.tweenShapes?.(useGraphTransition);
  instance.growEnteringEdges?.(useGraphTransition);
  instance.transition?.(() => d3Transition().duration(
    useGraphTransition ? GRAPHVIZ_TRANSITION_DURATION_MS : 0,
  ));
};

const configureGraphvizTransition = (
  instance: GraphvizInstance,
  d3Transition: () => { duration: (duration: number) => unknown },
  animate: boolean,
  animationMode: AnimationMode,
) => {
  const duration = animate && animationMode === "graph"
    ? GRAPHVIZ_TRANSITION_DURATION_MS
    : 0;
  instance.transition?.(() => d3Transition().duration(duration));
};

const configureGraphvizViewport = (
  instance: GraphvizInstance,
  container: HTMLDivElement,
  fixedViewport: boolean,
) => {
  if (!fixedViewport) {
    return;
  }
  const width = Math.round(container.clientWidth || container.getBoundingClientRect().width);
  const height = Math.round(container.clientHeight || container.getBoundingClientRect().height);
  if (width > 0 && height > 0) {
    instance.width?.(width);
    instance.height?.(height);
    instance.fit?.(true);
  }
};

const renderDot = (instance: GraphvizInstance, dot: string): Promise<void> => (
  new Promise((resolve, reject) => {
    let complete = false;
    const finish = () => {
      if (!complete) {
        complete = true;
        resolve();
      }
    };

    try {
      const result = instance.renderDot(dot, finish);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        Promise.resolve(result).then(finish, reject);
      }
    } catch (error) {
      reject(error);
    }
  })
);

const GraphvizPanel = ({
  dot,
  debugName,
  animate = true,
  animationMode = "none",
  onSvgChange,
  sizingMode = "intrinsic",
  fixedViewport = false,
}: GraphvizPanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSvgChangeRef = useRef(onSvgChange);
  const vizRef = useRef<GraphvizInstance | null>(null);
  const graphvizConfigRef = useRef<string | null>(null);
  const renderQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const renderSeqRef = useRef(0);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    onSvgChangeRef.current = onSvgChange;
  }, [onSvgChange]);

  useEffect(() => {
    if (!containerRef.current || !dot) {
      return;
    }

    let disposed = false;
    const currentSeq = renderSeqRef.current + 1;
    renderSeqRef.current = currentSeq;

    renderQueueRef.current = renderQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const { d3Transition, graphviz } = await loadGraphvizRuntime();
        if (disposed) {
          return undefined;
        }
        const graphvizConfig = `${animate}:${animationMode}`;
        const configChanged = graphvizConfigRef.current !== graphvizConfig;
        if (configChanged) {
          graphvizConfigRef.current = graphvizConfig;
        }
        if (!vizRef.current) {
          vizRef.current = (graphviz as (element: HTMLDivElement, options: { useWorker: boolean }) => GraphvizInstance)(containerRef.current as HTMLDivElement, { useWorker: false }).zoom(false);
        }
        if (configChanged && vizRef.current) {
          configureGraphvizAnimation(
            vizRef.current,
            d3Transition as () => { duration: (duration: number) => unknown },
            animate,
            animationMode,
          );
        }
        if (!vizRef.current) {
          return undefined;
        }
        configureGraphvizViewport(
          vizRef.current,
          containerRef.current as HTMLDivElement,
          fixedViewport,
        );
        setRenderError(null);
        configureGraphvizTransition(
          vizRef.current,
          d3Transition as () => { duration: (duration: number) => unknown },
          animate,
          animationMode,
        );
        const previousBarPositions = animate && animationMode === "bar"
          ? captureBarPositions(containerRef.current as HTMLDivElement)
          : new Map<string, DOMRect>();
        return renderDot(vizRef.current, dot).then(async () => {
          if (disposed || currentSeq !== renderSeqRef.current) {
            return undefined;
          }
          const svg = containerRef.current?.querySelector("svg");
          applyAutoScale(containerRef.current, sizingMode, fixedViewport);
          if (animate && animationMode === "bar" && containerRef.current) {
            animateBarPositionChanges(containerRef.current, previousBarPositions);
          }
          if (!disposed && currentSeq === renderSeqRef.current) {
            onSvgChangeRef.current?.(svg instanceof SVGSVGElement ? svg.outerHTML : null);
          }
          return undefined;
        });
      })
      .catch((error: unknown) => {
        const nextError = error instanceof Error ? error : new Error(String(error ?? "Graph render failed"));
        onSvgChangeRef.current?.(null);
        setRenderError(normalizeGraphRenderError(nextError));
      });

    return () => {
      disposed = true;
    };
  }, [animate, animationMode, debugName, dot, fixedViewport, sizingMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => applyAutoScale(container, sizingMode, fixedViewport));
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [fixedViewport, sizingMode]);

  useEffect(() => () => {
    renderSeqRef.current += 1;
    const instance = vizRef.current;
    // Let d3 complete the in-flight transition before removing its SVG state.
    // Destroying it immediately makes d3-graphviz look up a transition that no
    // longer exists when a route or card unmounts.
    void renderQueueRef.current.catch(() => undefined).then(() => {
      try {
        instance?.destroy?.();
      } catch {
        // The library may already have released its own resources.
      }
    });
    vizRef.current = null;
    graphvizConfigRef.current = null;
    onSvgChangeRef.current?.(null);
  }, []);

  if (renderError) {
    return <ErrorState title="Graph render failed" message={renderError} />;
  }

  return (
    <div
      className={`graphviz-panel${fixedViewport ? ` graphviz-panel--${sizingMode}` : ""}`}
      ref={containerRef}
    />
  );
};

export default GraphvizPanel;
