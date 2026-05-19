import { describe, expect, it } from "vitest";

import { buildTimelineFrames, describeTimelineFrame } from "./timeline";

describe("timeline helpers", () => {
  it("builds a readable timeline summary from step and line data", () => {
    expect(describeTimelineFrame({
      timelineKey: "1:2",
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
});
