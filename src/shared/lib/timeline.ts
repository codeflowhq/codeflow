import type { ManifestEntry } from "../types/visualization";

import { buildTimelineKey } from "./timeline-keys";

export type TimelineFrame = {
  timelineKey: string;
  index: number;
  executionOrder: number;
  order: number;
  stepId: string;
  lineNumber: number | null;
};

const parseStepSequence = (stepId: string): number | null => {
  const match = /step[:\s]+(\d+)/i.exec(stepId);
  return match ? Number(match[1]) : null;
};

export const describeTimelineFrame = (frame?: TimelineFrame): string => {
  if (!frame) {
    return "Run the visualization to generate execution steps.";
  }

  const parts: string[] = [];
  const stepSequence = parseStepSequence(frame.stepId);
  if (stepSequence != null) {
    parts.push(`Trace step ${stepSequence}`);
  }
  if (frame.lineNumber != null) {
    parts.push(`line ${frame.lineNumber}`);
  }
  if (!parts.length) {
    parts.push(frame.stepId.replace(/[:_]+/g, " "));
  }

  return parts.join(" • ");
};

export const buildTimelineFrames = (manifestEntries: ManifestEntry[]): TimelineFrame[] => {
  const frames = new Map<string, TimelineFrame>();
  manifestEntries.forEach((entry) => {
    entry.steps.forEach((step) => {
      const executionOrder = Number(step.executionId ?? step.meta?.execution_id ?? step.index ?? 0);
      const order = Number(step.order ?? step.meta?.order ?? 0);
      const timelineKey = buildTimelineKey(step);
      if (!frames.has(timelineKey)) {
        frames.set(timelineKey, {
          timelineKey,
          index: step.index ?? 0,
          executionOrder,
          order,
          stepId: step.stepId ?? timelineKey,
          lineNumber: step.meta?.line_number != null ? Number(step.meta.line_number) : null,
        });
      }
    });
  });
  return [...frames.values()].sort(
    (left, right) =>
      left.executionOrder - right.executionOrder ||
      left.order - right.order ||
      left.index - right.index ||
      left.timelineKey.localeCompare(right.timelineKey),
  );
};
