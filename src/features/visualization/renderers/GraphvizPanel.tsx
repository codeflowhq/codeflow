import { useEffect, useRef, useState } from "react";

import { loadGraphvizRuntime } from "../../../shared/lib/graphviz-runtime";
import { normalizeGraphRenderError } from "../../../runtime/runtime-errors";
import ErrorState from "../../../shared/ui/ErrorState";

const GRAPHVIZ_DURATION_MS = 300;

type GraphvizInstance = {
  zoom: (enabled: boolean) => GraphvizInstance;
  transition: (factory: () => { duration: (ms: number) => unknown }) => GraphvizInstance;
  renderDot: (dot: string) => Promise<unknown> | unknown;
};

type GraphvizPanelProps = {
  dot: string;
  debugName?: string;
  animate?: boolean;
  onSvgChange?: (svg: string | null) => void;
};

const GraphvizPanel = ({ dot, debugName, animate = true, onSvgChange }: GraphvizPanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSvgChangeRef = useRef(onSvgChange);
  const vizRef = useRef<GraphvizInstance | null>(null);
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
        const { graphviz, d3Transition } = await loadGraphvizRuntime();
        if (disposed) {
          return undefined;
        }
        if (!vizRef.current) {
          const instance = (graphviz as (element: HTMLDivElement, options: { useWorker: boolean }) => GraphvizInstance)(containerRef.current as HTMLDivElement, { useWorker: false }).zoom(false);
          if (animate) {
            instance.transition(() => (d3Transition as () => { duration: (ms: number) => unknown })().duration(GRAPHVIZ_DURATION_MS) as { duration: (ms: number) => unknown });
          }
          vizRef.current = instance;
        }
        if (!vizRef.current) {
          return undefined;
        }
        setRenderError(null);
        return Promise.resolve(vizRef.current.renderDot(dot)).then((value) => {
          const svg = containerRef.current?.querySelector("svg");
          onSvgChangeRef.current?.(svg instanceof SVGSVGElement ? svg.outerHTML : null);
          return value;
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
  }, [animate, debugName, dot]);

  useEffect(() => () => {
    renderSeqRef.current += 1;
    renderQueueRef.current = Promise.resolve();
    vizRef.current = null;
    onSvgChangeRef.current?.(null);
  }, []);

  if (renderError) {
    return <ErrorState title="Graph render failed" message={renderError} />;
  }

  return <div className="graphviz-panel" ref={containerRef} />;
};

export default GraphvizPanel;
