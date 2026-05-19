import { useEffect, useState } from "react";

import { initializeBrowserRuntime } from "../../runtime/python-bridge";

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
      .catch(() => {
        if (!cancelled) {
          setRuntimeReady(false);
          onError?.("Browser runtime failed", "Reload the page and try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onError]);

  return runtimeReady;
};
