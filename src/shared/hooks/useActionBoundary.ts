import { useCallback } from "react";

import { normalizeRuntimeError, normalizeUnexpectedAppError } from "../../runtime/runtime-errors";

type ActionBoundaryOptions = {
  onError: (title: string, content: string) => void;
};

type RunActionOptions<T> = {
  title: string;
  normalize?: (error: unknown) => string;
  fallback?: T;
};

export const useActionBoundary = ({ onError }: ActionBoundaryOptions) => {
  const runAction = useCallback(async <T>(action: () => Promise<T> | T, options: RunActionOptions<T>): Promise<T> => {
    try {
      return await action();
    } catch (error) {
      onError(options.title, (options.normalize ?? normalizeUnexpectedAppError)(error));
      if ("fallback" in options) {
        return options.fallback as T;
      }
      throw error;
    }
  }, [onError]);

  const runRuntimeAction = useCallback(async <T>(action: () => Promise<T> | T, title: string, fallback?: T): Promise<T> => runAction(action, {
    title,
    normalize: normalizeRuntimeError,
    ...(fallback !== undefined ? { fallback } : {}),
  }), [runAction]);

  return { runAction, runRuntimeAction };
};
