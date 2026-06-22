// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTimelinePlayback } from "./useTimelinePlayback";
import type { ManifestEntry } from "../../shared/types/visualization";

const manifest: ManifestEntry[] = [
  {
    variable: "data",
    kind: "svg",
    steps: [
      {
        stepId: "step 1",
        timelineKey: "1:1",
        executionId: 1,
        order: 1,
        index: 1,
        svg: "<svg id='first' />",
      },
      {
        stepId: "step 2",
        timelineKey: "2:2",
        executionId: 2,
        order: 2,
        index: 2,
        svg: "<svg id='second' />",
      },
      {
        stepId: "step 3",
        timelineKey: "3:3",
        executionId: 3,
        order: 3,
        index: 3,
        svg: "<svg id='third' />",
      },
    ],
  },
];

const singleStepManifest: ManifestEntry[] = [
  {
    variable: "data",
    kind: "svg",
    steps: [
      {
        stepId: "step 1",
        timelineKey: "1:1",
        executionId: 1,
        order: 1,
        index: 1,
        svg: "<svg id='only' />",
      },
    ],
  },
];

const shiftedManifest: ManifestEntry[] = [
  {
    variable: "data",
    kind: "svg",
    steps: [
      {
        stepId: "step 10",
        timelineKey: "10:1",
        executionId: 10,
        order: 1,
        index: 10,
        svg: "<svg id='shifted' />",
      },
      {
        stepId: "step 11",
        timelineKey: "11:2",
        executionId: 11,
        order: 2,
        index: 11,
        svg: "<svg id='shifted-second' />",
      },
    ],
  },
];

describe("useTimelinePlayback", () => {
  it("starts playback from the first visible frame instead of jumping to the end", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useTimelinePlayback(manifest));

    expect(result.current.activeTimelineKey).toBe("1:1");

    act(() => {
      result.current.setIsPlaying(true);
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.activeTimelineKey).toBe("2:2");
    expect(result.current.isPlaying).toBe(true);

    vi.useRealTimers();
  });

  it("advances from the first frame when playback starts with an empty requested key", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useTimelinePlayback(manifest));

    act(() => {
      result.current.setActiveTimelineKey("");
      result.current.setIsPlaying(true);
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.activeTimelineKey).toBe("2:2");
    expect(result.current.isPlaying).toBe(true);

    vi.useRealTimers();
  });

  it("stops on the only frame when playback has a single timeline step", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useTimelinePlayback(singleStepManifest));

    act(() => {
      result.current.setIsPlaying(true);
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.activeTimelineKey).toBe("1:1");
    expect(result.current.activeTimelineIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);

    vi.useRealTimers();
  });

  it("falls back to the new first frame when the manifest changes and the old key disappears", () => {
    const { result, rerender } = renderHook(
      ({ nextManifest }) => useTimelinePlayback(nextManifest),
      { initialProps: { nextManifest: manifest } },
    );

    act(() => {
      result.current.setActiveTimelineKey("3:3");
    });

    expect(result.current.activeTimelineKey).toBe("3:3");

    rerender({ nextManifest: shiftedManifest });

    expect(result.current.activeTimelineKey).toBe("10:1");
    expect(result.current.activeTimelineIndex).toBe(0);
  });
});
