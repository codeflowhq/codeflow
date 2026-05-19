import { Button, Card, Empty, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import type { ManifestEntry, VariableConfig } from "../../shared/types/visualization";
import VariablePanel from "../../components/VariablePanel";

const DEFAULT_WINDOW_WIDTH = 520;
const DEFAULT_WINDOW_HEIGHT = 420;
const MIN_WINDOW_WIDTH = 360;
const WINDOW_GAP = 16;
const WINDOW_COLUMNS = 2;

type WindowLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const buildDefaultWindowLayout = (index: number, canvasWidth: number): WindowLayout => {
  const usableWidth = Math.max(canvasWidth, MIN_WINDOW_WIDTH);
  const twoColumnWidth = Math.floor((usableWidth - WINDOW_GAP) / WINDOW_COLUMNS);
  const useTwoColumns = twoColumnWidth >= MIN_WINDOW_WIDTH;
  const columns = useTwoColumns ? WINDOW_COLUMNS : 1;
  const width = useTwoColumns ? Math.min(DEFAULT_WINDOW_WIDTH, twoColumnWidth) : Math.min(DEFAULT_WINDOW_WIDTH, usableWidth);
  return {
    x: (index % columns) * (width + WINDOW_GAP),
    y: Math.floor(index / columns) * (DEFAULT_WINDOW_HEIGHT + WINDOW_GAP),
    width,
    height: DEFAULT_WINDOW_HEIGHT,
  };
};

const clampWindowLayout = (layout: WindowLayout, canvasWidth: number): WindowLayout => {
  const maxWidth = Math.max(MIN_WINDOW_WIDTH, canvasWidth);
  const width = Math.min(layout.width, maxWidth);
  const x = Math.max(0, Math.min(layout.x, Math.max(0, canvasWidth - width)));
  return { ...layout, width, x };
};

type VisualCanvasProps = {
  manifest: ManifestEntry[];
  activeTimelineKey: string;
  variableConfigs: Record<string, VariableConfig>;
  onOpenConfig: (variable: string) => void;
  onRunVisualization: () => Promise<void>;
  canRun: boolean;
  layoutMode: "masonry" | "windows";
};

const { Text } = Typography;

const VisualCanvas = ({
  manifest,
  activeTimelineKey,
  variableConfigs,
  onOpenConfig,
  onRunVisualization,
  canRun,
  layoutMode,
}: VisualCanvasProps) => {
  const [windowLayouts, setWindowLayouts] = useState<Record<string, WindowLayout>>({});
  const [canvasWidth, setCanvasWidth] = useState(0);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const manifestVariables = useMemo(() => manifest.map((entry) => entry.variable), [manifest]);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) {
      return undefined;
    }
    const updateWidth = () => setCanvasWidth(element.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleWindowLayoutChange = useCallback((variable: string, patch: Partial<WindowLayout>) => {
    const fallbackWidth = canvasWidth || DEFAULT_WINDOW_WIDTH;
    setWindowLayouts((prev) => ({
      ...prev,
      [variable]: clampWindowLayout({
        ...(prev[variable] ?? buildDefaultWindowLayout(0, fallbackWidth)),
        ...patch,
      }, fallbackWidth),
    }));
  }, [canvasWidth]);

  const effectiveWindowLayouts = useMemo(() => Object.fromEntries(
    manifestVariables.map((variable, index) => [variable, clampWindowLayout(windowLayouts[variable] ?? buildDefaultWindowLayout(index, canvasWidth || DEFAULT_WINDOW_WIDTH), canvasWidth || DEFAULT_WINDOW_WIDTH)]),
  ) as Record<string, WindowLayout>, [canvasWidth, manifestVariables, windowLayouts]);

  const canvasHeight = useMemo(() => {
    const bottoms = manifestVariables.map((variable) => {
      const layout = effectiveWindowLayouts[variable];
      return layout.y + layout.height;
    });
    return Math.max(640, ...bottoms, 640) + WINDOW_GAP;
  }, [effectiveWindowLayouts, manifestVariables]);

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
        {manifest.map((entry) => (
          <div key={entry.variable} className="visual-canvas-masonry-item">
            <VariablePanel
              entry={entry}
              activeTimelineKey={activeTimelineKey}
              panelConfig={variableConfigs[entry.variable]}
              onOpenConfig={() => onOpenConfig(entry.variable)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={canvasRef} className="visual-canvas" style={{ height: canvasHeight }}>
      {manifest.map((entry, index) => {
        const layout = effectiveWindowLayouts[entry.variable] ?? buildDefaultWindowLayout(index, canvasWidth || DEFAULT_WINDOW_WIDTH);
        return (
          <Rnd
            key={entry.variable}
            bounds="parent"
            dragHandleClassName="variable-window-drag-handle"
            minWidth={360}
            minHeight={280}
            size={{ width: layout.width, height: layout.height }}
            position={{ x: layout.x, y: layout.y }}
            onDragStop={(_event, data) => handleWindowLayoutChange(entry.variable, { x: data.x, y: data.y })}
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
            />
          </Rnd>
        );
      })}
    </div>
  );
};

export default VisualCanvas;
