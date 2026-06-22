import { useCallback, useEffect, useMemo, useState } from "react";

import { buildTimelineFrames, type TimelineFrame } from "../../shared/lib/timeline";
import type { ManifestEntry } from "../../shared/types/visualization";

const TIMELINE_PLAYBACK_INTERVAL_MS = 800;

const resolveTimelineIndex = (
  timelineFrames: TimelineFrame[],
  timelineKey: string,
) => {
  if (timelineFrames.length === 0) {
    return -1;
  }
  const exactIndex = timelineFrames.findIndex((frame) => frame.timelineKey === timelineKey);
  return exactIndex >= 0 ? exactIndex : 0;
};

export const useTimelinePlayback = (manifest: ManifestEntry[]) => {
  const [requestedTimelineKey, setActiveTimelineKey] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineFrames = useMemo(() => buildTimelineFrames(manifest), [manifest]);
  const activeTimelineKey = useMemo(() => {
    if (timelineFrames.length === 0) {
      return "";
    }
    const resolvedIndex = resolveTimelineIndex(timelineFrames, requestedTimelineKey);
    return timelineFrames[resolvedIndex]?.timelineKey ?? "";
  }, [requestedTimelineKey, timelineFrames]);
  const activeTimelineIndex = useMemo(() => {
    const index = resolveTimelineIndex(timelineFrames, activeTimelineKey);
    return index >= 0 ? index : 0;
  }, [activeTimelineKey, timelineFrames]);
  const activeTimelineFrame = timelineFrames[activeTimelineIndex] as TimelineFrame | undefined;

  useEffect(() => {
    if (!isPlaying || timelineFrames.length === 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setActiveTimelineKey((prev) => {
        const currentIndex = resolveTimelineIndex(timelineFrames, prev);
        if (currentIndex >= timelineFrames.length - 1) {
          setIsPlaying(false);
          return timelineFrames[timelineFrames.length - 1]?.timelineKey ?? "";
        }
        return timelineFrames[currentIndex + 1].timelineKey;
      });
    }, TIMELINE_PLAYBACK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPlaying, timelineFrames]);

  const stepTo = useCallback(
    (offset: number) => {
      if (timelineFrames.length === 0) {
        return;
      }
      const nextIndex = Math.max(0, Math.min(timelineFrames.length - 1, activeTimelineIndex + offset));
      setActiveTimelineKey(timelineFrames[nextIndex]?.timelineKey ?? "");
    },
    [activeTimelineIndex, timelineFrames],
  );

  return {
    activeTimelineFrame,
    activeTimelineIndex,
    activeTimelineKey,
    isPlaying,
    setActiveTimelineKey,
    setIsPlaying,
    stepTo,
    timelineFrames,
  };
};
