import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import { Button, Slider, Space, Tag, Tooltip, Typography } from "antd";

import { describeTimelineFrame } from "../../shared/lib/timeline";
import type { TimelineState } from "../workspace/workspace-types";

const { Text } = Typography;

type TimelineControlsProps = {
  timelineState: TimelineState;
  panelCount: number;
  layoutMode: "masonry" | "windows";
};

const TimelineControls = ({ timelineState, panelCount, layoutMode }: TimelineControlsProps) => {
  const activeLine = timelineState.activeTimelineFrame?.lineNumber;
  const layoutLabel = layoutMode === "masonry" ? "Masonry" : "Windows";
  const layoutHint = layoutMode === "masonry" ? "stacked panels" : "floating windows";

  return (
    <>
      <div className="timeline-toolbar">
        <div className="timeline-summary">
          <Text strong>
            {timelineState.timelineFrames.length
              ? `Step ${timelineState.activeTimelineIndex + 1} of ${timelineState.timelineFrames.length}`
              : "Execution timeline"}
          </Text>
          <Text type="secondary">{describeTimelineFrame(timelineState.activeTimelineFrame)}</Text>
        </div>
        <Space wrap>
          <Tooltip title="First step"><Button aria-label="Jump to first timeline step" icon={<StepBackwardOutlined />} onClick={() => timelineState.setActiveTimelineKey(timelineState.timelineFrames[0]?.timelineKey ?? "")} /></Tooltip>
          <Tooltip title="Previous"><Button aria-label="Go to previous timeline step" icon={<ArrowLeftOutlined />} onClick={() => timelineState.stepTo(-1)} /></Tooltip>
          <Tooltip title={timelineState.isPlaying ? "Pause" : "Play"}><Button aria-label={timelineState.isPlaying ? "Pause timeline playback" : "Play timeline playback"} type="primary" icon={timelineState.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={() => timelineState.setIsPlaying((prev) => !prev)} /></Tooltip>
          <Tooltip title="Next"><Button aria-label="Go to next timeline step" icon={<ArrowRightOutlined />} onClick={() => timelineState.stepTo(1)} /></Tooltip>
          <Tooltip title="Last step"><Button aria-label="Jump to last timeline step" icon={<StepForwardOutlined />} onClick={() => timelineState.setActiveTimelineKey(timelineState.timelineFrames[timelineState.timelineFrames.length - 1]?.timelineKey ?? "")} /></Tooltip>
        </Space>
      </div>

      <div className="timeline-hud">
        <Tag color="blue">{panelCount} panel(s)</Tag>
        <Tag color="geekblue">layout: {layoutLabel}</Tag>
        <Tag>{layoutHint}</Tag>
        {activeLine != null ? <Tag color="purple">line {activeLine}</Tag> : <Tag>line —</Tag>}
      </div>

      <div className="timeline-slider-block">
        <Text type="secondary">{timelineState.activeTimelineFrame ? timelineState.activeTimelineFrame.stepId : "No steps"}</Text>
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
