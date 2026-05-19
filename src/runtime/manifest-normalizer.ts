import type { ManifestEntry, ManifestStep, NormalizedManifest, RawManifestPayload, RawManifestStep } from "../shared/types/visualization";

import { buildTimelineKey } from "../shared/lib/timeline-keys";

const normalizeStep = (step: RawManifestStep, index: number): ManifestStep => {
  const executionId = step.execution_id ?? step.executionId ?? step.meta?.execution_id ?? null;
  const order = step.order ?? step.meta?.order ?? null;
  const normalized = {
    ...step,
    index: step.index ?? index + 1,
    executionId,
    order,
  };
  return {
    ...normalized,
    stepId: step.step_id ?? step.stepId ?? String(order ?? normalized.index),
    timelineKey: buildTimelineKey({ ...step, executionId, order, index: normalized.index }),
  };
};

export const normalizeManifest = (
  payload: RawManifestPayload,
): NormalizedManifest => ({
  manifest: (payload.manifest ?? []).map((entry) => ({
    ...entry,
    compatibleViewKinds: entry.compatible_view_kinds ?? entry.compatibleViewKinds,
    steps: (entry.steps ?? []).map(normalizeStep),
  })),
});
