import { HolderOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Space, Tag, Typography } from "antd";
import { Suspense, lazy, useMemo } from "react";

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
};

const VariablePanel = ({ entry, panelConfig, activeTimelineKey, onOpenConfig }: VariablePanelProps) => {
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

  const meta = currentStep?.meta ?? {};
  const configSummary = useMemo(() => {
    const parts: string[] = [];
    if (panelConfig?.viewKind && panelConfig.viewKind !== "auto") {
      parts.push(`view=${panelConfig.viewKind}`);
    }
    if (panelConfig?.depth != null) {
      parts.push(`depth=${panelConfig.depth}`);
    }
    return parts;
  }, [panelConfig]);

  return (
    <Card
      size="small"
      title={<Text strong>{entry.variable}</Text>}
      extra={(
        <Space size={4}>
          <Button type="text" icon={<HolderOutlined />} className="variable-window-drag-handle" aria-label={`Move ${entry.variable}`} />
          <Button type="text" icon={<SettingOutlined />} onClick={onOpenConfig} aria-label={`Configure ${entry.variable}`} />
        </Space>
      )}
      styles={{ body: { minHeight: 220 } }}
      style={{ height: "100%" }}
    >
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Space wrap>
          {meta.line_number ? <Tag color="purple">line {meta.line_number}</Tag> : null}
          {configSummary.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </Space>

        <div className="visual-window-body">
          {entry.kind === "dot" && currentStep?.dot ? (
            <Suspense fallback={<div className="panel-loading">Loading graph…</div>}>
              <GraphvizPanel dot={currentStep.dot} debugName={entry.variable} animate />
            </Suspense>
          ) : null}
          {entry.kind === "svg" && currentStep?.svg ? (
            <Suspense fallback={<div className="panel-loading">Loading svg…</div>}>
              <SvgPanel svg={currentStep.svg} />
            </Suspense>
          ) : null}
          {!currentStep ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No frame" /> : null}
        </div>
      </Space>
    </Card>
  );
};

export default VariablePanel;
