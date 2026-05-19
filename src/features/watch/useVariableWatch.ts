import { useCallback } from "react";

import { useVariableConfigState } from "./useVariableConfigState";
import { useWatchListState } from "./useWatchListState";
import type { VariableConfig } from "../../shared/types/visualization";

type MessageApi = {
  error: (message: string) => void;
  success: (message: string) => void;
};

type AddWatchOptions = {
  openConfig?: boolean;
};

type UseVariableWatchOptions = {
  defaultVariableConfig: VariableConfig;
  initialWatchVariables: string[];
  isWatchExpression: (value: string) => boolean;
  getWatchExpressionRoot: (value: string) => string | null;
  availableVariableRoots: string[];
  messageApi: MessageApi;
};

export const useVariableWatch = ({ defaultVariableConfig, initialWatchVariables, isWatchExpression, getWatchExpressionRoot, availableVariableRoots, messageApi }: UseVariableWatchOptions) => {
  const watchList = useWatchListState({ initialWatchVariables, isWatchExpression, getWatchExpressionRoot, availableVariableRoots, messageApi });
  const configState = useVariableConfigState({
    defaultVariableConfig,
    messageApi,
  });

  const handleOpenVariableConfig = useCallback((variableName: string) => {
    configState.openVariableConfig(variableName);
  }, [configState]);

  const handleAddWatchVariable = useCallback((variableName: string, options: AddWatchOptions = {}) => {
    if (!isWatchExpression(variableName)) {
      return;
    }
    watchList.setSelectedVariable(variableName);
    const alreadyWatched = watchList.watchVariables.includes(variableName);
    if (options.openConfig && !alreadyWatched) {
      configState.openVariableConfig(variableName, { pending: true });
      return;
    }
    const added = watchList.addWatchVariable(variableName);
    if (added) {
      configState.markPendingWatchConfig(variableName);
    }
    if (options.openConfig && alreadyWatched) {
      configState.openVariableConfig(variableName);
    } else if (added) {
      messageApi.success(`Added ${variableName} to watch list.`);
    }
  }, [configState, isWatchExpression, messageApi, watchList]);

  const handleSubmitWatchExpression = useCallback(() => {
    watchList.submitWatchExpression((candidate) => {
      handleAddWatchVariable(candidate);
    });
  }, [handleAddWatchVariable, watchList]);

  return {
    watchList,
    configState,
    handleAddWatchVariable,
    handleOpenVariableConfig,
    handleSubmitWatchExpression,
  };
};
