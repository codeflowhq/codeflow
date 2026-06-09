import type { ManifestEntry, ManifestStep } from "../../shared/types/visualization";

export type CollectionPreviewEntry = {
  variable: string;
  kind: ManifestEntry["kind"];
  previewStep?: ManifestStep;
};

export const getCollectionPreviewEntries = (savedManifest?: ManifestEntry[]): CollectionPreviewEntry[] =>
  (savedManifest ?? []).slice(0, 3).map((entry) => ({
    variable: entry.variable,
    kind: entry.kind,
    previewStep: entry.steps[0],
  }));
