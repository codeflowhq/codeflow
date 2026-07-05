import { useCallback, useState } from "react";

import type { CollectionRecord } from "../../shared/types/visualization";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const normalizeCollectionRecord = (value: unknown): CollectionRecord | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Partial<CollectionRecord>;
  if (
    typeof record.id !== "string"
    || typeof record.name !== "string"
    || typeof record.savedAt !== "string"
    || typeof record.sourceCode !== "string"
    || typeof record.globalConfig !== "object"
    || record.globalConfig === null
  ) {
    return null;
  }
  return {
    id: record.id,
    name: record.name,
    savedAt: record.savedAt,
    sourceCode: record.sourceCode,
    description: typeof record.description === "string" ? record.description : undefined,
    labels: isStringArray(record.labels) ? record.labels : undefined,
    watchVariables: isStringArray(record.watchVariables) ? record.watchVariables : ["data"],
    globalConfig: record.globalConfig as CollectionRecord["globalConfig"],
    variableConfigs: typeof record.variableConfigs === "object" && record.variableConfigs !== null ? record.variableConfigs : {},
    savedManifest: Array.isArray(record.savedManifest) ? record.savedManifest : undefined,
    layoutState: typeof record.layoutState === "object" && record.layoutState !== null ? record.layoutState : undefined,
  };
};

const parseStoredCollections = (stored: string | null): CollectionRecord[] => {
  if (!stored) {
    return [];
  }
  const parsed = JSON.parse(stored) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .map(normalizeCollectionRecord)
    .filter((record): record is CollectionRecord => record !== null);
};

export const useCollections = (storageKey: string) => {
  const [collections, setCollections] = useState<CollectionRecord[]>(() => {
    try {
      return parseStoredCollections(window.localStorage.getItem(storageKey));
    } catch {
      return [];
    }
  });

  const persistCollections = useCallback(
    (nextCollections: CollectionRecord[]) => {
      setCollections(nextCollections);
      window.localStorage.setItem(storageKey, JSON.stringify(nextCollections));
    },
    [storageKey],
  );

  return { collections, setCollections, persistCollections };
};
