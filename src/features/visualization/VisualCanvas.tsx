import { Button, Card, Checkbox, Empty, Space, Typography } from "antd";
import { DisconnectOutlined, MergeCellsOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import type { ManifestEntry, OverlayGroup, VariableConfig, VisualizationLayoutMode, VisualizationLayoutState, VisualizationWindowLayout } from "../../shared/types/visualization";
import type { ExportSourceCache } from "./useExportState";
import { mergeOverlayGroups } from "./layout-state";
import VariablePanel from "./components/VariablePanel";

const DEFAULT_WINDOW_WIDTH = 280;
const MIN_WINDOW_WIDTH = 220;
const MIN_WINDOW_HEIGHT = 128;
const WINDOW_GAP = 16;
const WINDOW_COLUMNS = 2;
const WINDOW_CHROME_WIDTH = 16;
const WINDOW_CHROME_HEIGHT = 40;
const AUTO_WINDOW_MAX_RATIO = 0.58;
const AUTO_WINDOW_MAX_WIDTH = 420;
const MASONRY_COLUMNS = 2;
const MASONRY_MAX_CONTENT_PADDING = 16;

type ContentSize = {
  width: number;
  height: number;
};

const parseSvgDimension = (value: string | undefined) => {
  const match = value?.match(/^\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const getMaxSvgStepWidth = (entry: ManifestEntry) => Math.max(
  0,
  ...entry.steps.map((step) => {
    if (!step.svg) {
      return 0;
    }
    const svgTag = step.svg.match(/<svg\b[^>]*>/i)?.[0];
    if (!svgTag) {
      return 0;
    }
    const viewBox = svgTag.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1];
    const viewBoxWidth = viewBox
      ?.trim()
      .split(/\s+/)
      .map(Number)[2];
    if (viewBoxWidth && viewBoxWidth > 0) {
      return viewBoxWidth;
    }
    const width = svgTag.match(/\bwidth\s*=\s*["']([^"']+)["']/i)?.[1];
    return parseSvgDimension(width) ?? 0;
  }),
);

const getMaxDotNodeCount = (entry: ManifestEntry) => Math.max(
  0,
  ...entry.steps.map((step) => (
    step.dot?.match(/^\s*(?!(?:graph|node|edge)\b)(?:"[^"]+"|[A-Za-z0-9_]+)\s+\[/gm)?.length ?? 0
  )),
);

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
  activeTimelineEventOrder?: number | null;
  variableConfigs: Record<string, VariableConfig>;
  exportSources: ExportSourceCache;
  emptyStateMessage?: string;
  onOpenConfig: (variable: string) => void;
  onRemoveVariable?: (variable: string) => void;
  onRunVisualization: (overlayGroups?: OverlayGroup[]) => Promise<boolean>;
  onOpenGuide: () => void;
  canRun: boolean;
  layoutMode: VisualizationLayoutMode;
  layoutState: VisualizationLayoutState;
  setExportSource: (variable: string, svg: string | null) => void;
  setMasonryOrder: (order: string[]) => void;
  createOverlayGroup?: (variables: string[]) => void;
  removeOverlayGroup?: (groupId: string) => void;
  setWindowLayout: (variable: string, layout: VisualizationWindowLayout) => void;
  setWindowZIndex: (variable: string, zIndex: number) => void;
};

const { Text } = Typography;

const VisualCanvas = ({
  manifest,
  activeTimelineKey,
  activeTimelineEventOrder,
  variableConfigs,
  exportSources,
  emptyStateMessage,
  onOpenConfig,
  onRemoveVariable,
  onRunVisualization,
  onOpenGuide,
  canRun,
  layoutMode,
  layoutState,
  setExportSource,
  setMasonryOrder,
  createOverlayGroup,
  removeOverlayGroup,
  setWindowLayout,
  setWindowZIndex,
}: VisualCanvasProps) => {
  const [windowContentSizes, setWindowContentSizes] = useState<Record<string, ContentSize>>({});
  const [draggedMasonryVariable, setDraggedMasonryVariable] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [boundsElement, setBoundsElement] = useState<HTMLDivElement | null>(null);
  const [selectedOverlayVariables, setSelectedOverlayVariables] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);
  const overlayCandidates = useMemo(() => Object.entries(variableConfigs)
    .filter(([, config]) => config.viewKind === "line" || config.viewKind === "scatter")
    .map(([variable]) => variable), [variableConfigs]);
  const activeOverlaySelection = selectedOverlayVariables.filter((name) => overlayCandidates.includes(name));
  const overlayGroups = (layoutState.overlayGroups ?? []).filter((group) => (
    group.variables.length >= 2
    && group.variables.every((variable) => overlayCandidates.includes(variable))
  ));
  const selectedGroup = overlayGroups.find((group) => (
    activeOverlaySelection.some((variable) => group.variables.includes(variable))
  ));
  const hasVisibleOverlayLayer = manifestVariables.some((variable) => overlayCandidates.includes(variable));

  const toggleOverlayVariable = (variable: string, checked: boolean) => {
    setSelectedOverlayVariables((current) => (
      checked ? [...new Set([...current, variable])] : current.filter((name) => name !== variable)
    ));
  };

  const overlayControls = hasVisibleOverlayLayer || overlayGroups.length > 0 ? (
    <div className="visual-overlay-controls">
      <div className="visual-overlay-summary">
        <Text strong>Overlay layers</Text>
        <Text type="secondary">
          {selectedGroup
            ? `${selectedGroup.layerOrder.length} layers grouped`
            : `${activeOverlaySelection.length} selected`}
        </Text>
      </div>
      <Space wrap size={6}>
        <Button
          type="primary"
          size="small"
          icon={<MergeCellsOutlined />}
          aria-label="Overlay"
          disabled={activeOverlaySelection.length < 2}
          onClick={() => {
            const nextGroups = mergeOverlayGroups(overlayGroups, activeOverlaySelection);
            createOverlayGroup?.(activeOverlaySelection);
            setSelectedOverlayVariables([activeOverlaySelection[0]]);
            void onRunVisualization(nextGroups);
          }}
        >
          Overlay
        </Button>
        <Button
          size="small"
          icon={<DisconnectOutlined />}
          aria-label="Ungroup"
          disabled={!selectedGroup}
          onClick={() => {
            if (selectedGroup) {
              const nextGroups = overlayGroups.filter((group) => group.id !== selectedGroup.id);
              removeOverlayGroup?.(selectedGroup.id);
              setSelectedOverlayVariables([]);
              void onRunVisualization(nextGroups);
            }
          }}
        >
          Ungroup
        </Button>
      </Space>
    </div>
  ) : null;
  useEffect(() => {
    const currentExportSources = exportSources[activeTimelineKey] ?? {};
    Object.keys(currentExportSources).forEach((variable) => {
      if (!manifestVariables.includes(variable)) {
        setExportSource(variable, null);
      }
    });
  }, [activeTimelineKey, exportSources, manifestVariables, setExportSource]);

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

  const masonrySingleColumnWidth = useMemo(() => {
    if (canvasWidth <= 0) {
      return MIN_WINDOW_WIDTH;
    }
    return Math.max(
      MIN_WINDOW_WIDTH,
      Math.floor((canvasWidth - WINDOW_GAP) / MASONRY_COLUMNS),
    );
  }, [canvasWidth]);

  const getMasonryItemLayout = useCallback((entry: ManifestEntry) => {
    // DOT size is unavailable until Graphviz runs. Use the largest trace
    // snapshot so cards do not reflow while playback adds nodes.
    if (entry.kind === "dot") {
      return { span: getMaxDotNodeCount(entry) > 9 ? 2 as const : 1 as const };
    }
    const intrinsicWidth = entry.kind === "svg" ? getMaxSvgStepWidth(entry) : null;
    const measuredWidth = intrinsicWidth
      ? intrinsicWidth + WINDOW_CHROME_WIDTH + MASONRY_MAX_CONTENT_PADDING
      : null;
    return {
      span: measuredWidth && measuredWidth > masonrySingleColumnWidth ? 2 as const : 1 as const,
    };
  }, [masonrySingleColumnWidth]);

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
              {emptyStateMessage ? <Text>{emptyStateMessage}</Text> : null}
              <Text type="secondary">
                Open Guide for a quick walkthrough, or press Play after choosing variables.
              </Text>
              <Space wrap>
                <Button onClick={onOpenGuide}>Open guide</Button>
                <Button type="primary" disabled={!canRun} onClick={() => void onRunVisualization()}>
                  Play
                </Button>
              </Space>
            </Space>
          )}
        />
      </Card>
    );
  }

  if (layoutMode === "masonry") {
    return (
      <div ref={handleCanvasRef} className="visual-canvas visual-canvas-masonry">
        {overlayControls ? <div style={{ gridColumn: "1 / -1" }}>{overlayControls}</div> : null}
        {masonryEntries.map((entry) => {
          const itemLayout = getMasonryItemLayout(entry);
          return (
            <div
              key={entry.variable}
              className="visual-canvas-masonry-item"
              data-span={itemLayout.span}
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
                panelTitle={overlayGroups.find((group) => group.variables[0] === entry.variable)?.layerOrder.join(" + ")}
                selectionControl={overlayCandidates.includes(entry.variable) ? (
                  <Checkbox
                    aria-label={`Select ${entry.variable} for overlay`}
                    checked={activeOverlaySelection.includes(entry.variable)}
                    onChange={(event) => toggleOverlayVariable(entry.variable, event.target.checked)}
                  />
                ) : null}
                activeTimelineKey={activeTimelineKey}
                activeTimelineEventOrder={activeTimelineEventOrder}
                panelConfig={variableConfigs[entry.variable]}
                onOpenConfig={() => onOpenConfig(entry.variable)}
                onRemoveVariable={onRemoveVariable ? () => onRemoveVariable(entry.variable) : undefined}
                onExportSourceChange={(svg) => setExportSource(entry.variable, svg)}
                layoutMode="masonry"
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {overlayControls}
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
              panelTitle={overlayGroups.find((group) => group.variables[0] === entry.variable)?.layerOrder.join(" + ")}
              selectionControl={overlayCandidates.includes(entry.variable) ? (
                <Checkbox
                  aria-label={`Select ${entry.variable} for overlay`}
                  checked={activeOverlaySelection.includes(entry.variable)}
                  onChange={(event) => toggleOverlayVariable(entry.variable, event.target.checked)}
                />
              ) : null}
              activeTimelineKey={activeTimelineKey}
              activeTimelineEventOrder={activeTimelineEventOrder}
              panelConfig={variableConfigs[entry.variable]}
              onOpenConfig={() => onOpenConfig(entry.variable)}
              onRemoveVariable={onRemoveVariable ? () => onRemoveVariable(entry.variable) : undefined}
              onContentSizeChange={(size) => handleContentSizeChange(entry.variable, size)}
              onExportSourceChange={(svg) => setExportSource(entry.variable, svg)}
              layoutMode="windows"
            />
          </Rnd>
        );
        })}
      </div>
    </>
  );
};

export default VisualCanvas;
