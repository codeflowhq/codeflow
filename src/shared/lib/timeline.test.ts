import { describe, expect, it } from "vitest";

import { buildTimelineFrames, describeTimelineFrame } from "./timeline";

describe("timeline helpers", () => {
  it("returns the empty-state message when no frame exists", () => {
    expect(describeTimelineFrame()).toBe(
      "Run the visualization to generate execution steps.",
    );
  });

  it("builds a readable timeline summary from step and line data", () => {
    expect(describeTimelineFrame({
      timelineKey: "1:2",
      eventOrder: 2,
      index: 0,
      executionOrder: 1,
      order: 2,
      stepId: "step:17:7:index:17",
      lineNumber: 9,
    })).toBe("Trace step 17 • line 9");
  });

  it("carries line numbers into built timeline frames", () => {
    const frames = buildTimelineFrames([
      {
        variable: "data",
        kind: "svg",
        steps: [
          {
            stepId: "step 3",
            timelineKey: "1:3",
            eventOrder: 4,
            executionId: 1,
            order: 3,
            index: 0,
            svg: "<svg />",
            meta: { line_number: 7 },
          },
        ],
      },
    ]);

    expect(frames[0]?.lineNumber).toBe(7);
  });

  it("returns an empty frame list when the manifest is empty", () => {
    expect(buildTimelineFrames([])).toEqual([]);
  });

  it("keeps only the first occurrence for duplicate timeline keys", () => {
    const frames = buildTimelineFrames([
      {
        variable: "data",
        kind: "svg",
        steps: [
          {
            stepId: "step 1",
            timelineKey: "1:1",
            eventOrder: 1,
            executionId: 1,
            order: 1,
            index: 1,
            svg: "<svg />",
          },
        ],
      },
      {
        variable: "queue",
        kind: "svg",
        steps: [
          {
            stepId: "step 1 duplicate",
            timelineKey: "1:1",
            eventOrder: 9,
            executionId: 9,
            order: 9,
            index: 9,
            svg: "<svg />",
          },
        ],
      },
    ]);

    expect(frames).toHaveLength(1);
    expect(frames[0]).toMatchObject({
      timelineKey: "1:1",
      executionOrder: 1,
      eventOrder: 1,
      order: 1,
      index: 1,
      stepId: "step 1",
    });
  });

  it("sorts timeline frames by event order before execution metadata", () => {
    const frames = buildTimelineFrames([
      {
        variable: "suffixes",
        kind: "svg",
        steps: [
          {
            stepId: "step 6",
            timelineKey: "3:6",
            eventOrder: 4,
            executionId: 3,
            order: 6,
            index: 3,
            svg: "<svg />",
          },
        ],
      },
      {
        variable: "sorted_suffixes",
        kind: "svg",
        steps: [
          {
            stepId: "step 4",
            timelineKey: "0:4",
            eventOrder: 7,
            executionId: 0,
            order: 4,
            index: 0,
            svg: "<svg />",
          },
        ],
      },
    ]);

    expect(frames.map((frame) => frame.timelineKey)).toEqual(["3:6", "0:4"]);
  });
});
