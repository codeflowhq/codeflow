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
  applyVariableConfig: (variableName: string, draft: VariableConfig) => void;
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
      [variableName]: prev[variableName] ?? defaultVariableConfig,
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

  const applyVariableConfig = useCallback((variableName: string, draft: VariableConfig) => {
    setVariableConfigs((prev) => ({
      ...prev,
      [variableName]: {
        ...defaultVariableConfig,
        ...(prev[variableName] ?? {}),
        ...draft,
        viewOptions: {
          ...(prev[variableName]?.viewOptions ?? defaultVariableConfig.viewOptions),
          ...(draft.viewOptions ?? {}),
        },
      },
    }));

    const wasPending = pendingWatchVariables.includes(variableName);
    if (wasPending) {
      setPendingWatchVariables((prev) => prev.filter((item) => item !== variableName));
    }
    messageApi?.success(wasPending ? `Added ${variableName} to watch list.` : `Applied config for ${variableName}.`);
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
    applyVariableConfig,
    markPendingWatchConfig,
    clearPendingWatchConfig,
  };
};
