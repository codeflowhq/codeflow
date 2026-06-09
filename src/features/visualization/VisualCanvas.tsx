import { Button, Card, Empty, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import type { ManifestEntry, VariableConfig, VisualizationLayoutMode, VisualizationLayoutState, VisualizationWindowLayout } from "../../shared/types/visualization";
import VariablePanel from "../../components/VariablePanel";

const DEFAULT_WINDOW_WIDTH = 280;
const MIN_WINDOW_WIDTH = 220;
const MIN_WINDOW_HEIGHT = 128;
const WINDOW_GAP = 16;
const WINDOW_COLUMNS = 2;
const WINDOW_CHROME_WIDTH = 16;
const WINDOW_CHROME_HEIGHT = 40;
const AUTO_WINDOW_MAX_RATIO = 0.58;
const AUTO_WINDOW_MAX_WIDTH = 420;

type ContentSize = {
  width: number;
  height: number;
};

const estimateWindowHeight = (entry: ManifestEntry, contentSize?: ContentSize) => {
  const measuredHeight = contentSize ? contentSize.height + WINDOW_CHROME_HEIGHT : null;
  if (measuredHeight) {
    return Math.max(MIN_WINDOW_HEIGHT, measuredHeight);
  }
  if (entry.kind === "svg") {
    return 164;
  }
  return 172;
};

const estimateWindowWidth = (entry: ManifestEntry, canvasWidth: number, contentSize?: ContentSize) => {
  const usableWidth = Math.max(canvasWidth, MIN_WINDOW_WIDTH);
  const autoMaxWidth = Math.max(
    MIN_WINDOW_WIDTH,
    Math.min(AUTO_WINDOW_MAX_WIDTH, Math.floor(usableWidth * AUTO_WINDOW_MAX_RATIO)),
  );
  const measuredWidth = contentSize ? contentSize.width + WINDOW_CHROME_WIDTH : null;
  if (measuredWidth) {
    return Math.min(Math.max(MIN_WINDOW_WIDTH, measuredWidth), autoMaxWidth);
  }
  if (entry.kind === "svg") {
    return Math.min(260, autoMaxWidth);
  }
  return Math.min(DEFAULT_WINDOW_WIDTH, autoMaxWidth);
};

const buildDefaultWindowLayout = (
  entry: ManifestEntry,
  index: number,
  canvasWidth: number,
  contentSize?: ContentSize,
): VisualizationWindowLayout => {
  const usableWidth = Math.max(canvasWidth, MIN_WINDOW_WIDTH);
  const twoColumnWidth = Math.floor((usableWidth - WINDOW_GAP) / WINDOW_COLUMNS);
  const useTwoColumns = twoColumnWidth >= MIN_WINDOW_WIDTH;
  const columns = useTwoColumns ? WINDOW_COLUMNS : 1;
  const preferredWidth = estimateWindowWidth(entry, useTwoColumns ? twoColumnWidth : usableWidth, contentSize);
  const width = useTwoColumns ? Math.min(preferredWidth, twoColumnWidth) : Math.min(preferredWidth, usableWidth);
  const height = estimateWindowHeight(entry, contentSize);
  return {
    x: (index % columns) * (width + WINDOW_GAP),
    y: Math.floor(index / columns) * (height + WINDOW_GAP),
    width,
    height,
  };
};

const clampWindowLayout = (layout: VisualizationWindowLayout, canvasWidth: number): VisualizationWindowLayout => {
  const maxWidth = Math.max(MIN_WINDOW_WIDTH, canvasWidth);
  const width = Math.min(layout.width, maxWidth);
  const x = Math.max(0, Math.min(layout.x, Math.max(0, canvasWidth - width)));
  return { ...layout, width, x };
};

type VisualCanvasProps = {
  manifest: ManifestEntry[];
  activeTimelineKey: string;
  variableConfigs: Record<string, VariableConfig>;
  exportSources: Record<string, string>;
  onOpenConfig: (variable: string) => void;
  onRemoveVariable?: (variable: string) => void;
  onRunVisualization: () => Promise<void>;
  canRun: boolean;
  layoutMode: VisualizationLayoutMode;
  layoutState: VisualizationLayoutState;
  setExportSource: (variable: string, svg: string | null) => void;
  setMasonryOrder: (order: string[]) => void;
  setWindowLayout: (variable: string, layout: VisualizationWindowLayout) => void;
  setWindowZIndex: (variable: string, zIndex: number) => void;
};

const { Text } = Typography;

const VisualCanvas = ({
  manifest,
  activeTimelineKey,
  variableConfigs,
  exportSources,
  onOpenConfig,
  onRemoveVariable,
  onRunVisualization,
  canRun,
  layoutMode,
  layoutState,
  setExportSource,
  setMasonryOrder,
  setWindowLayout,
  setWindowZIndex,
}: VisualCanvasProps) => {
  const [windowContentSizes, setWindowContentSizes] = useState<Record<string, ContentSize>>({});
  const [draggedMasonryVariable, setDraggedMasonryVariable] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [boundsElement, setBoundsElement] = useState<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);

  useEffect(() => {
    Object.keys(exportSources).forEach((variable) => {
      if (!manifestVariables.includes(variable)) {
        setExportSource(variable, null);
      }
    });
  }, [exportSources, manifestVariables, setExportSource]);

  const handleCanvasRef = useCallback((node: HTMLDivElement | null) => {
    canvasRef.current = node;
    setBoundsElement((prev) => (prev === node ? prev : node));
  }, []);

  useEffect(() => {
    const element = boundsElement;
    if (!element) {
      return undefined;
    }
    const updateWidth = () => setCanvasWidth(element.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [boundsElement]);

  const effectiveWindowZIndices = useMemo(() => Object.fromEntries(
    manifest.map((entry, index) => [entry.variable, layoutState.windows.zIndices[entry.variable] ?? index + 1]),
  ) as Record<string, number>, [layoutState.windows.zIndices, manifest]);


  const bringWindowToFront = useCallback((variable: string) => {
    const current = effectiveWindowZIndices[variable] ?? 0;
    const maxZIndex = Math.max(0, ...Object.values(effectiveWindowZIndices));
    if (current === maxZIndex) {
      return;
    }
    setWindowZIndex(variable, maxZIndex + 1);
  }, [effectiveWindowZIndices, setWindowZIndex]);

  const handleContentSizeChange = useCallback((variable: string, size: ContentSize) => {
    setWindowContentSizes((prev) => {
      const current = prev[variable];
      if (current && current.width === size.width && current.height === size.height) {
        return prev;
      }
      return { ...prev, [variable]: size };
    });
  }, []);

  const handleWindowLayoutChange = useCallback((variable: string, patch: Partial<VisualizationWindowLayout>) => {
    const fallbackWidth = canvasWidth || DEFAULT_WINDOW_WIDTH;
    const entry = manifest.find((item) => item.variable === variable);
    const nextLayout = clampWindowLayout({
      ...(layoutState.windows.layouts[variable] ?? buildDefaultWindowLayout(
        entry ?? manifest[0],
        0,
        fallbackWidth,
        windowContentSizes[variable],
      )),
      ...patch,
    }, fallbackWidth);
    setWindowLayout(variable, nextLayout);
  }, [canvasWidth, layoutState.windows.layouts, manifest, setWindowLayout, windowContentSizes]);

  const effectiveWindowLayouts = useMemo(() => Object.fromEntries(
    manifest.map((entry, index) => [
      entry.variable,
      clampWindowLayout(
        layoutState.windows.layouts[entry.variable] ?? buildDefaultWindowLayout(
          entry,
          index,
          canvasWidth || DEFAULT_WINDOW_WIDTH,
          windowContentSizes[entry.variable],
        ),
        canvasWidth || DEFAULT_WINDOW_WIDTH,
      ),
    ]),
  ) as Record<string, VisualizationWindowLayout>, [canvasWidth, layoutState.windows.layouts, manifest, windowContentSizes]);

  const canvasHeight = useMemo(() => {
    const bottoms = manifestVariables.map((variable) => {
      const layout = effectiveWindowLayouts[variable];
      return layout.y + layout.height;
    });
    return Math.max(640, ...bottoms, 640) + WINDOW_GAP;
  }, [effectiveWindowLayouts, manifestVariables]);

  const effectiveMasonryOrder = useMemo(() => {
    const preserved = layoutState.masonryOrder.filter((variable) => manifestVariables.includes(variable));
    const additions = manifestVariables.filter((variable) => !preserved.includes(variable));
    return [...preserved, ...additions];
  }, [layoutState.masonryOrder, manifestVariables]);

  const masonryEntries = useMemo(() => {
    const entryMap = new Map(manifest.map((entry) => [entry.variable, entry]));
    return effectiveMasonryOrder
      .map((variable) => entryMap.get(variable))
      .filter((entry): entry is ManifestEntry => Boolean(entry));
  }, [effectiveMasonryOrder, manifest]);

  const moveMasonryVariable = useCallback((targetVariable: string) => {
    if (!draggedMasonryVariable || draggedMasonryVariable === targetVariable) {
      return;
    }
    const sourceIndex = effectiveMasonryOrder.indexOf(draggedMasonryVariable);
    const targetIndex = effectiveMasonryOrder.indexOf(targetVariable);
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }
    const next = [...effectiveMasonryOrder];
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, draggedMasonryVariable);
    setMasonryOrder(next);
  }, [draggedMasonryVariable, effectiveMasonryOrder, setMasonryOrder]);

  if (manifest.length === 0) {
    return (
      <Card className="surface-card surface-card-subtle visual-empty-card">
        <Empty
          description={(
            <Space orientation="vertical" size={10} style={{ width: "100%" }}>
              <Text strong>No visualization yet</Text>
              <Text type="secondary">1. Select variables to watch</Text>
              <Text type="secondary">2. Run the visualization</Text>
              <Text type="secondary">3. Step through the execution</Text>
              <Button type="primary" disabled={!canRun} onClick={() => void onRunVisualization()}>
                Run visualization
              </Button>
            </Space>
          )}
        />
      </Card>
    );
  }

  if (layoutMode === "masonry") {
    return (
      <div className="visual-canvas visual-canvas-masonry">
        {masonryEntries.map((entry) => (
          <div
            key={entry.variable}
            className="visual-canvas-masonry-item"
            draggable
            onDragStart={() => setDraggedMasonryVariable(entry.variable)}
            onDragEnd={() => setDraggedMasonryVariable(null)}
            onDragOver={(event) => {
              event.preventDefault();
              moveMasonryVariable(entry.variable);
            }}
            onDrop={(event) => {
              event.preventDefault();
              moveMasonryVariable(entry.variable);
              setDraggedMasonryVariable(null);
            }}
          >
            <VariablePanel
              entry={entry}
              activeTimelineKey={activeTimelineKey}
              panelConfig={variableConfigs[entry.variable]}
              onOpenConfig={() => onOpenConfig(entry.variable)}
              onRemoveVariable={onRemoveVariable ? () => onRemoveVariable(entry.variable) : undefined}
              onExportSourceChange={(svg) => setExportSource(entry.variable, svg)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={handleCanvasRef} className="visual-canvas" style={{ height: canvasHeight, width: "100%" }}>
      {manifest.map((entry, index) => {
        const fallbackLayout = effectiveWindowLayouts[entry.variable] ?? buildDefaultWindowLayout(entry, index, canvasWidth || DEFAULT_WINDOW_WIDTH);
        return (
          <Rnd
            key={entry.variable}
            bounds={boundsElement ?? "parent"}
            dragHandleClassName="variable-window-drag-handle"
            minWidth={MIN_WINDOW_WIDTH}
            minHeight={MIN_WINDOW_HEIGHT}
            resizeHandleComponent={{
              bottomRight: <div className="visual-window-resize-handle" />,
            }}
            size={{ width: fallbackLayout.width, height: fallbackLayout.height }}
            position={{ x: fallbackLayout.x, y: fallbackLayout.y }}
            style={{ zIndex: effectiveWindowZIndices[entry.variable] ?? index + 1 }}
            onMouseDown={() => bringWindowToFront(entry.variable)}
            onDragStart={() => bringWindowToFront(entry.variable)}
            onResizeStart={() => bringWindowToFront(entry.variable)}
            onDrag={(_event, data) => handleWindowLayoutChange(entry.variable, { x: data.x, y: data.y })}
            onDragStop={(_event, data) => handleWindowLayoutChange(entry.variable, { x: data.x, y: data.y })}
            onResize={(_event, _direction, ref, _delta, position) => {
              handleWindowLayoutChange(entry.variable, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: position.x,
                y: position.y,
              });
            }}
            onResizeStop={(_event, _direction, ref, _delta, position) => {
              handleWindowLayoutChange(entry.variable, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: position.x,
                y: position.y,
              });
            }}
            className="visual-window-rnd"
          >
            <VariablePanel
              entry={entry}
              activeTimelineKey={activeTimelineKey}
              panelConfig={variableConfigs[entry.variable]}
              onOpenConfig={() => onOpenConfig(entry.variable)}
              onRemoveVariable={onRemoveVariable ? () => onRemoveVariable(entry.variable) : undefined}
              onContentSizeChange={(size) => handleContentSizeChange(entry.variable, size)}
              onExportSourceChange={(svg) => setExportSource(entry.variable, svg)}
            />
          </Rnd>
        );
      })}
    </div>
  );
};

export default VisualCanvas;
