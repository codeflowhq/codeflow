import { describe, expect, it } from "vitest";

import { buildTimelineKey, compareTimelineKeys, isTimelineStepAtOrBefore, parseTimelineKey } from "./timeline-keys";

describe("timeline-keys", () => {
  it("builds timeline keys from normalized or raw manifest fields", () => {
    expect(buildTimelineKey({ timelineKey: "7:3" })).toBe("7:3");
    expect(buildTimelineKey({ executionId: 4, order: 2 })).toBe("4:2");
    expect(buildTimelineKey({ meta: { execution_id: 9, order: 1 }, index: 3 })).toBe("9:1");
  });

  it("parses and compares timeline keys consistently", () => {
    expect(parseTimelineKey("12:5")).toEqual({ execution: 12, order: 5 });
    expect(compareTimelineKeys("1:2", "1:5")).toBeLessThan(0);
    expect(compareTimelineKeys("2:0", "1:99")).toBeGreaterThan(0);
  });

  it("checks if a step is at or before a target frame", () => {
    expect(isTimelineStepAtOrBefore({ executionId: 1, order: 2 }, "1:3")).toBe(true);
    expect(isTimelineStepAtOrBefore({ executionId: 2, order: 0 }, "1:99")).toBe(false);
  });
});
