import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Space, Typography } from "antd";
import { Suspense, lazy, useEffect, useMemo, useRef } from "react";

import { buildTimelineKey, isTimelineStepAtOrBefore } from "../shared/lib/timeline-keys";
import type { ManifestEntry, ManifestStep, VariableConfig } from "../shared/types/visualization";

const GraphvizPanel = lazy(() => import("../features/visualization/renderers/GraphvizPanel"));
const SvgPanel = lazy(() => import("../features/visualization/renderers/SvgPanel"));

const { Text } = Typography;

type VariablePanelProps = {
  entry: ManifestEntry;
  panelConfig?: VariableConfig;
  activeTimelineKey: string;
  onOpenConfig: () => void;
  onRemoveVariable?: () => void;
  onContentSizeChange?: (size: { width: number; height: number }) => void;
  onExportSourceChange?: (svg: string | null) => void;
};

const getSvgContentSize = (svgElement: SVGSVGElement) => {
  const viewBox = svgElement.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return {
      width: Math.ceil(viewBox.width),
      height: Math.ceil(viewBox.height),
    };
  }

  try {
    const box = svgElement.getBBox();
    if (box.width > 0 && box.height > 0) {
      return {
        width: Math.ceil(box.width),
        height: Math.ceil(box.height),
      };
    }
  } catch {
    // Some SVGs do not support getBBox before layout; fall back to client rect below.
  }

  const rect = svgElement.getBoundingClientRect();
  return {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  };
};

const VariablePanel = ({
  entry,
  panelConfig,
  activeTimelineKey,
  onOpenConfig,
  onRemoveVariable,
  onContentSizeChange,
  onExportSourceChange,
}: VariablePanelProps) => {
  const currentStep = useMemo<ManifestStep | undefined>(() => {
    if (!entry.steps.length) {
      return undefined;
    }
    const exact = entry.steps.find((step) => buildTimelineKey(step) === activeTimelineKey);
    if (exact) {
      return exact;
    }
    return [...entry.steps].reverse().find((step) => isTimelineStepAtOrBefore(step, activeTimelineKey)) ?? entry.steps[0];
  }, [activeTimelineKey, entry.steps]);
  void panelConfig;
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !onContentSizeChange) {
      return undefined;
    }

    const reportSize = () => {
      const svgElement = body.querySelector("svg");
      const svgSize = svgElement instanceof SVGSVGElement ? getSvgContentSize(svgElement) : null;
      const width = Math.ceil((svgSize?.width ?? body.scrollWidth) + 12);
      const height = Math.ceil((svgSize?.height ?? body.scrollHeight) + 8);
      onContentSizeChange({ width, height });
    };

    reportSize();

    const resizeObserver = new ResizeObserver(reportSize);
    resizeObserver.observe(body);

    const mutationObserver = new MutationObserver(() => {
      window.requestAnimationFrame(reportSize);
    });
    mutationObserver.observe(body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [activeTimelineKey, currentStep?.dot, currentStep?.svg, onContentSizeChange]);

  useEffect(() => {
    if (!currentStep) {
      onExportSourceChange?.(null);
    }
  }, [currentStep, onExportSourceChange]);

  return (
    <Card
      className="variable-panel-card"
      size="small"
      title={<div className="variable-window-drag-handle variable-window-title-handle"><Text strong>{entry.variable}</Text></div>}
      extra={(
        <Space size={4}>
          {onRemoveVariable ? (
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={onRemoveVariable}
              aria-label={`Remove ${entry.variable}`}
            />
          ) : null}
          <Button type="text" icon={<SettingOutlined />} onClick={onOpenConfig} aria-label={`Configure ${entry.variable}`} />
        </Space>
      )}
      styles={{ body: { minHeight: 0, padding: 8 } }}
      style={{ height: "100%" }}
    >
      <div ref={bodyRef} className="visual-window-body">
          {entry.kind === "dot" && currentStep?.dot ? (
            <Suspense fallback={<div className="panel-loading">Loading graph…</div>}>
              <GraphvizPanel dot={currentStep.dot} debugName={entry.variable} animate onSvgChange={onExportSourceChange} />
            </Suspense>
          ) : null}
          {entry.kind === "svg" && currentStep?.svg ? (
            <Suspense fallback={<div className="panel-loading">Loading svg…</div>}>
              <SvgPanel svg={currentStep.svg} onSvgChange={onExportSourceChange} />
            </Suspense>
          ) : null}
          {!currentStep ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No frame" /> : null}
      </div>
    </Card>
  );
};

export default VariablePanel;
