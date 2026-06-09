import { describe, expect, it } from "vitest";

import { getCollectionPreviewEntries } from "./collectionPreview";
import type { ManifestEntry } from "../../shared/types/visualization";

const savedManifest: ManifestEntry[] = [
  {
    variable: "data",
    kind: "svg",
    compatibleViewKinds: ["auto", "bar"],
    steps: [{ stepId: "step 1", timelineKey: "1:1", executionId: 1, order: 1, index: 0, svg: "<svg />" }],
  },
  {
    variable: "queue",
    kind: "dot",
    steps: [{ stepId: "step 2", timelineKey: "1:2", executionId: 1, order: 2, index: 0, dot: "digraph { a -> b }" }],
  },
];

describe("collectionPreview", () => {
  it("builds preview entries from saved manifest", () => {
    expect(getCollectionPreviewEntries(savedManifest)).toEqual([
      {
        variable: "data",
        kind: "svg",
        previewStep: savedManifest[0]?.steps[0],
      },
      {
        variable: "queue",
        kind: "dot",
        previewStep: savedManifest[1]?.steps[0],
      },
    ]);
  });
});
