import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import { Button, Slider, Space, Tooltip, Typography } from "antd";

import type { TimelineState } from "../workspace/workspace-types";
import type { VisualizationLayoutMode } from "../../shared/types/visualization";

const { Text } = Typography;

type TimelineControlsProps = {
  timelineState: TimelineState;
  panelCount: number;
  layoutMode: VisualizationLayoutMode;
  playButtonRef?: ((node: HTMLButtonElement | null) => void) | undefined;
  sliderRef?: ((node: HTMLDivElement | null) => void) | undefined;
  primaryActionLabel: "Play" | "Pause";
  primaryActionLoading: boolean;
  primaryActionDisabled: boolean;
  primaryActionTooltip?: string;
  onPrimaryAction: () => void;
};

const TimelineControls = ({
  timelineState,
  panelCount,
  layoutMode,
  playButtonRef,
  sliderRef,
  primaryActionLabel,
  primaryActionLoading,
  primaryActionDisabled,
  primaryActionTooltip,
  onPrimaryAction,
}: TimelineControlsProps) => {
  void panelCount;
  void layoutMode;
  const hasTimeline = timelineState.timelineFrames.length > 0;

  return (
    <>
      <div className="timeline-toolbar">
        <div className="timeline-summary">
          <Text strong>
            {timelineState.timelineFrames.length
              ? `Step ${timelineState.activeTimelineIndex + 1} of ${timelineState.timelineFrames.length}`
              : "Execution timeline"}
          </Text>
        </div>
        <Space wrap>
          <Tooltip title="First step"><Button disabled={!hasTimeline} aria-label="Jump to first timeline step" icon={<StepBackwardOutlined />} onClick={() => timelineState.setActiveTimelineKey(timelineState.timelineFrames[0]?.timelineKey ?? "")} /></Tooltip>
          <Tooltip title="Previous"><Button disabled={!hasTimeline} aria-label="Go to previous timeline step" icon={<ArrowLeftOutlined />} onClick={() => timelineState.stepTo(-1)} /></Tooltip>
          <Tooltip title={primaryActionTooltip}>
            <Button
              ref={playButtonRef}
              className="timeline-primary-action"
              type="primary"
              aria-label={primaryActionLabel === "Pause" ? "Pause timeline playback" : "Play timeline playback"}
              icon={primaryActionLabel === "Pause" ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              loading={primaryActionLoading}
              disabled={primaryActionDisabled}
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </Button>
          </Tooltip>
          <Tooltip title="Next"><Button disabled={!hasTimeline} aria-label="Go to next timeline step" icon={<ArrowRightOutlined />} onClick={() => timelineState.stepTo(1)} /></Tooltip>
          <Tooltip title="Last step"><Button disabled={!hasTimeline} aria-label="Jump to last timeline step" icon={<StepForwardOutlined />} onClick={() => timelineState.setActiveTimelineKey(timelineState.timelineFrames[timelineState.timelineFrames.length - 1]?.timelineKey ?? "")} /></Tooltip>
        </Space>
      </div>

      <div ref={sliderRef} className="timeline-slider-block">
        <Slider
          min={0}
          max={Math.max(timelineState.timelineFrames.length - 1, 0)}
          value={timelineState.activeTimelineIndex}
          onChange={(value) => {
            const nextFrame = timelineState.timelineFrames[value as number];
            if (nextFrame) {
              timelineState.setActiveTimelineKey(nextFrame.timelineKey);
            }
          }}
        />
      </div>
    </>
  );
};

export default TimelineControls;
