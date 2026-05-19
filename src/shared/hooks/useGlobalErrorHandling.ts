import { useEffect, useRef } from "react";

import { normalizeUnexpectedAppError } from "../../runtime/runtime-errors";

type ErrorHandler = (title: string, content: string) => void;

type LastErrorState = {
  message: string;
  timestamp: number;
};

const DUPLICATE_WINDOW_MS = 1000;

export const shouldSuppressDuplicateError = (
  previous: LastErrorState | null,
  nextMessage: string,
  now: number,
): boolean => Boolean(previous && previous.message === nextMessage && now - previous.timestamp < DUPLICATE_WINDOW_MS);

export const useGlobalErrorHandling = (onError?: ErrorHandler) => {
  const lastErrorRef = useRef<LastErrorState | null>(null);

  useEffect(() => {
    if (!onError) {
      return;
    }

    const notify = (title: string, error: unknown) => {
      const message = normalizeUnexpectedAppError(error);
      const now = Date.now();
      const previous = lastErrorRef.current;
      if (shouldSuppressDuplicateError(previous, message, now)) {
        return;
      }
      lastErrorRef.current = { message, timestamp: now };
      onError(title, message);
    };

    const handleWindowError = (event: ErrorEvent) => {
      notify("Unexpected error", event.error ?? event.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      notify("Unhandled error", event.reason);
      event.preventDefault();
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [onError]);
};
