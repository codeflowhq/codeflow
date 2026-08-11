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
          event_order: 11,
          execution_id: 5,
          order: 7,
          meta: { execution_id: 5, order: 7, var_id: 11 },
        }],
      }],
    });

    expect(payload.manifest[0].steps[0]).toMatchObject({
      stepId: "step 3",
      timelineKey: "5:7",
      eventOrder: 11,
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
          meta: { execution_id: 2, order: 8, var_id: 6 },
        }],
      }],
    });

    expect(payload.manifest[0].steps[0]).toMatchObject({
      stepId: "8",
      timelineKey: "2:8",
      eventOrder: 6,
      executionId: 2,
      order: 8,
      index: 4,
    });
  });

  it("prefers snake_case source fields when both naming styles are present", () => {
    const payload = normalizeManifest({
      manifest: [{
        variable: "graph",
        kind: "dot",
        compatible_view_kinds: ["graph", "tree"],
        compatibleViewKinds: ["table"],
        steps: [{
          step_id: "snake-step",
          stepId: "camel-step",
          timeline_key: "7:4",
          timelineKey: "5:2",
          event_order: 13,
          eventOrder: 12,
          execution_id: 7,
          executionId: 5,
          order: 4,
          index: 9,
          dot: "digraph G {}",
          meta: { line_number: 12, execution_id: 99, order: 99, var_id: 77 },
        }],
      }],
    });

    expect(payload.manifest[0]).toMatchObject({
      variable: "graph",
      kind: "dot",
      compatibleViewKinds: ["graph", "tree"],
    });
    expect(payload.manifest[0].steps[0]).toMatchObject({
      stepId: "snake-step",
      timelineKey: "7:4",
      eventOrder: 13,
      executionId: 7,
      order: 4,
      index: 9,
      dot: "digraph G {}",
      meta: { line_number: 12, execution_id: 99, order: 99 },
    });
  });

  it("falls back to camelCase compatible view kinds and empty step lists", () => {
    const payload = normalizeManifest({
      manifest: [{
        variable: "image_data",
        kind: "svg",
        compatibleViewKinds: ["image"],
      }],
    });

    expect(payload).toEqual({
      manifest: [{
        variable: "image_data",
        kind: "svg",
        compatibleViewKinds: ["image"],
        steps: [],
      }],
    });
  });

  it("returns an empty manifest when the payload is missing entries", () => {
    expect(normalizeManifest({})).toEqual({ manifest: [] });
  });
});
