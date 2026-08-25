import { useEffect, useState } from "react";

import { initializeBrowserRuntime } from "../../runtime/python-bridge";
import { normalizeRuntimeError } from "../../runtime/runtime-errors";

export const useRuntimeBootstrap = ({
  onError,
}: {
  onError?: (title: string, content: string) => void;
}) => {
  const [runtimeReady, setRuntimeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initializeBrowserRuntime()
      .then(() => {
        if (!cancelled) {
          setRuntimeReady(true);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRuntimeReady(false);
          onError?.("Browser runtime failed", normalizeRuntimeError(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onError]);

  return runtimeReady;
};
