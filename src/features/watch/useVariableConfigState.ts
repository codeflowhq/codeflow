import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { VariableConfig } from "../../shared/types/visualization";

type MessageApi = { success: (message: string) => void };

type UseVariableConfigStateOptions = {
  defaultVariableConfig: VariableConfig;
  messageApi?: MessageApi;
};

type OpenVariableConfigOptions = {
  pending?: boolean;
};

type VariableConfigState = {
  variableConfigs: Record<string, VariableConfig>;
  setVariableConfigs: Dispatch<SetStateAction<Record<string, VariableConfig>>>;
  configDrawerOpen: boolean;
  configDrawerVariable: string | null;
  pendingWatchVariables: string[];
  openVariableConfig: (variableName: string, options?: OpenVariableConfigOptions) => void;
  closeConfigDrawer: () => void;
  applyVariableConfigs: (drafts: Record<string, VariableConfig>) => void;
  markPendingWatchConfig: (variableName: string) => void;
  clearPendingWatchConfig: (variableName: string) => void;
};

export const useVariableConfigState = ({ defaultVariableConfig, messageApi }: UseVariableConfigStateOptions): VariableConfigState => {
  const [variableConfigs, setVariableConfigs] = useState<Record<string, VariableConfig>>({});
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configDrawerVariable, setConfigDrawerVariable] = useState<string | null>(null);
  const [pendingWatchVariables, setPendingWatchVariables] = useState<string[]>([]);

  const ensureConfig = useCallback((variableName: string) => {
    setVariableConfigs((prev) => ({
      ...prev,
      [variableName]: prev[variableName] ?? {
        ...defaultVariableConfig,
        viewOptions: {
          ...defaultVariableConfig.viewOptions,
        },
      },
    }));
  }, [defaultVariableConfig]);

  const openVariableConfig = useCallback((variableName: string, { pending = false }: OpenVariableConfigOptions = {}) => {
    ensureConfig(variableName);
    setConfigDrawerVariable(variableName);
    setConfigDrawerOpen(true);
    if (pending) {
      setPendingWatchVariables((prev) => (prev.includes(variableName) ? prev : [...prev, variableName]));
    }
  }, [ensureConfig]);

  const closeConfigDrawer = useCallback(() => {
    setConfigDrawerOpen(false);
  }, []);

  const markPendingWatchConfig = useCallback((variableName: string) => {
    ensureConfig(variableName);
    setPendingWatchVariables((prev) => (prev.includes(variableName) ? prev : [...prev, variableName]));
  }, [ensureConfig]);

  const clearPendingWatchConfig = useCallback((variableName: string) => {
    setPendingWatchVariables((prev) => prev.filter((item) => item !== variableName));
  }, []);

  const applyVariableConfigs = useCallback((drafts: Record<string, VariableConfig>) => {
    const draftEntries = Object.entries(drafts);
    if (draftEntries.length === 0) {
      setConfigDrawerOpen(false);
      return;
    }

    setVariableConfigs((prev) => {
      const next = { ...prev };
      for (const [variableName, draft] of draftEntries) {
        next[variableName] = {
          ...defaultVariableConfig,
          ...(prev[variableName] ?? {}),
          ...draft,
          viewOptions: {
            color:
              draft.viewOptions?.color
              ?? prev[variableName]?.viewOptions?.color
              ?? (prev[variableName]?.viewOptions as { barColor?: string } | undefined)?.barColor
              ?? (draft.viewOptions as { barColor?: string } | undefined)?.barColor
              ?? defaultVariableConfig.viewOptions.color,
          },
        };
      }
      return next;
    });

    const appliedVariables = draftEntries.map(([variableName]) => variableName);
    const pendingAppliedVariables = appliedVariables.filter((variableName) => pendingWatchVariables.includes(variableName));
    if (pendingAppliedVariables.length > 0) {
      setPendingWatchVariables((prev) => prev.filter((item) => !pendingAppliedVariables.includes(item)));
    }

    if (pendingAppliedVariables.length === appliedVariables.length) {
      messageApi?.success(`Applied watch settings for ${appliedVariables.length} variable${appliedVariables.length === 1 ? '' : 's'}.`);
    } else if (pendingAppliedVariables.length > 0) {
      messageApi?.success(`Applied settings for ${appliedVariables.length} variable${appliedVariables.length === 1 ? '' : 's'} and added ${pendingAppliedVariables.length} to the watch list.`);
    } else {
      messageApi?.success(`Applied settings for ${appliedVariables.length} variable${appliedVariables.length === 1 ? '' : 's'}.`);
    }
    setConfigDrawerOpen(false);
  }, [defaultVariableConfig, messageApi, pendingWatchVariables]);

  return {
    variableConfigs,
    setVariableConfigs,
    configDrawerOpen,
    configDrawerVariable,
    pendingWatchVariables,
    openVariableConfig,
    closeConfigDrawer,
    applyVariableConfigs,
    markPendingWatchConfig,
    clearPendingWatchConfig,
  };
};
