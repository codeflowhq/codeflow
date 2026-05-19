import { describe, expect, it } from "vitest";

import { getCollectionMetadata, getCollectionPreviewEntries } from "./collectionPreview";
import type { CollectionRecord, ManifestEntry } from "../../shared/types/visualization";

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

const record: CollectionRecord = {
  id: "1",
  name: "Example",
  savedAt: "2026-05-17T00:00:00.000Z",
  sourceCode: "data = [1]\nprint(data)",
  watchVariables: ["data", "i"],
  globalConfig: { stepLimit: 12, outputFormat: "svg", maxDepth: 3, maxItemsPerView: 50, recursionDepthDefault: -1, autoRecursionDepthCap: 6, showTitles: false, customConverters: "", runtimePackages: "", runtimeWheels: "", typeViewDefaults: {} },
  variableConfigs: {},
  savedManifest,
};

describe("collectionPreview", () => {
  it("builds preview entries from saved manifest", () => {
    expect(getCollectionPreviewEntries(savedManifest)).toEqual([
      {
        variable: "data",
        kind: "svg",
        compatibleViewKinds: ["auto", "bar"],
        frameCount: 1,
        previewStep: savedManifest[0]?.steps[0],
      },
      {
        variable: "queue",
        kind: "dot",
        compatibleViewKinds: [],
        frameCount: 1,
        previewStep: savedManifest[1]?.steps[0],
      },
    ]);
  });

  it("builds compact project metadata", () => {
    expect(getCollectionMetadata(record)).toEqual({
      watchCount: 2,
      visualCount: 2,
      lineCount: 2,
      characterCount: record.sourceCode.length,
    });
  });
});
