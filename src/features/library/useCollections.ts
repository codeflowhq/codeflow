import { useCallback, useState } from "react";

import type { CollectionRecord } from "../../shared/types/visualization";

export const useCollections = (storageKey: string) => {
  const [collections, setCollections] = useState<CollectionRecord[]>(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as CollectionRecord[];
      }
    } catch {
      return [];
    }
    return [];
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
