import type { CollectionRecord, ManifestEntry, ManifestStep } from "../../shared/types/visualization";

export type CollectionPreviewEntry = {
  variable: string;
  kind: ManifestEntry["kind"];
  compatibleViewKinds: string[];
  frameCount: number;
  previewStep?: ManifestStep;
};

export type CollectionMetadata = {
  watchCount: number;
  visualCount: number;
  lineCount: number;
  characterCount: number;
};

export const getCollectionPreviewEntries = (savedManifest?: ManifestEntry[]): CollectionPreviewEntry[] =>
  (savedManifest ?? []).slice(0, 3).map((entry) => ({
    variable: entry.variable,
    kind: entry.kind,
    compatibleViewKinds: entry.compatibleViewKinds ?? [],
    frameCount: entry.steps.length,
    previewStep: entry.steps[0],
  }));

export const getCollectionMetadata = (record: CollectionRecord): CollectionMetadata => ({
  watchCount: record.watchVariables.length,
  visualCount: record.savedManifest?.length ?? 0,
  lineCount: record.sourceCode ? record.sourceCode.split(/\r?\n/).length : 0,
  characterCount: record.sourceCode.length,
});
