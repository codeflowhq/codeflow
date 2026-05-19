type TimelineMeta = {
  execution_id?: number;
  order?: number;
};

export type TimelineStepLike = {
  timelineKey?: string;
  timeline_key?: string;
  executionId?: number | null;
  execution_id?: number | null;
  order?: number | null;
  index?: number | null;
  meta?: TimelineMeta;
};

export const buildTimelineKey = (step: TimelineStepLike): string => {
  const executionId = step.timelineKey
    ? String(step.timelineKey).split(":")[0]
    : (step.executionId ?? step.execution_id ?? step.meta?.execution_id ?? step.index ?? 0);
  const order = step.order ?? step.meta?.order ?? 0;
  return step.timelineKey ?? step.timeline_key ?? `${executionId}:${order}`;
};

export const parseTimelineKey = (timelineKey: string): { execution: number; order: number } => {
  const [execution = "0", order = "0"] = String(timelineKey ?? "0:0").split(":");
  return {
    execution: Number(execution) || 0,
    order: Number(order) || 0,
  };
};

export const compareTimelineKeys = (leftKey: string, rightKey: string): number => {
  const left = parseTimelineKey(leftKey);
  const right = parseTimelineKey(rightKey);
  return left.execution - right.execution || left.order - right.order;
};

export const isTimelineStepAtOrBefore = (step: TimelineStepLike, targetTimelineKey: string): boolean =>
  compareTimelineKeys(buildTimelineKey(step), targetTimelineKey) <= 0;
