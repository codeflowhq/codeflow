import { describe, expect, it } from "vitest";

import { normalizeManifest } from "./manifest-normalizer";

describe("normalizeManifest", () => {
  it("normalizes snake_case steps into camelCase timeline data", () => {
    const payload = normalizeManifest({
      manifest: [{
        variable: "data",
        kind: "svg",
        steps: [{
          step_id: "step 3",
          timeline_key: "5:7",
          execution_id: 5,
          order: 7,
          meta: { execution_id: 5, order: 7 },
        }],
      }],
    });

    expect(payload.manifest[0].steps[0]).toMatchObject({
      stepId: "step 3",
      timelineKey: "5:7",
      executionId: 5,
      order: 7,
    });
  });

  it("fills in missing ids from execution metadata", () => {
    const payload = normalizeManifest({
      manifest: [{
        variable: "queue",
        kind: "svg",
        steps: [{
          index: 4,
          meta: { execution_id: 2, order: 8 },
        }],
      }],
    });

    expect(payload.manifest[0].steps[0]).toMatchObject({
      stepId: "8",
      timelineKey: "2:8",
      executionId: 2,
      order: 8,
      index: 4,
    });
  });
});
