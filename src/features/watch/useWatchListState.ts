import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type MessageApi = { error: (message: string) => void };

type UseWatchListStateOptions = {
  initialWatchVariables: string[];
  isWatchExpression: (value: string) => boolean;
  getWatchExpressionRoot: (value: string) => string | null;
  availableVariableRoots: string[];
  messageApi: MessageApi;
};

type WatchListState = {
  watchDraft: string;
  setWatchDraft: Dispatch<SetStateAction<string>>;
  watchVariables: string[];
  setWatchVariables: Dispatch<SetStateAction<string[]>>;
  selectedVariable: string | null;
  setSelectedVariable: Dispatch<SetStateAction<string | null>>;
  selectionLocked: boolean;
  setSelectionLocked: Dispatch<SetStateAction<boolean>>;
  advancedSelectionOpen: boolean;
  setAdvancedSelectionOpen: Dispatch<SetStateAction<boolean>>;
  addWatchVariable: (variableName: string) => boolean;
  removeWatchVariable: (variableName: string) => void;
  submitWatchExpression: (onValidExpression: (candidate: string) => void) => void;
};

export const useWatchListState = ({ initialWatchVariables, isWatchExpression, getWatchExpressionRoot, availableVariableRoots, messageApi }: UseWatchListStateOptions): WatchListState => {
  const [watchDraft, setWatchDraft] = useState("");
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [selectionLocked, setSelectionLocked] = useState(false);
  const [advancedSelectionOpen, setAdvancedSelectionOpen] = useState(false);
  const [watchVariables, setWatchVariables] = useState(initialWatchVariables);

  const addWatchVariable = useCallback((variableName: string) => {
    if (!isWatchExpression(variableName)) {
      return false;
    }
    setSelectedVariable(variableName);
    let added = false;
    setWatchVariables((prev) => {
      if (prev.includes(variableName)) {
        return prev;
      }
      added = true;
      return [...prev, variableName];
    });
    return added;
  }, [isWatchExpression]);

  const removeWatchVariable = useCallback((variableName: string) => {
    setWatchVariables((prev) => prev.filter((item) => item !== variableName));
    setSelectedVariable((prev) => (prev === variableName ? null : prev));
  }, []);

  const submitWatchExpression = useCallback((onValidExpression: (candidate: string) => void) => {
    const candidate = watchDraft.trim();
    if (!candidate) {
      return;
    }
    if (!isWatchExpression(candidate)) {
      messageApi.error("Invalid watch expression.");
      return;
    }
    const root = getWatchExpressionRoot(candidate);
    if (root && !availableVariableRoots.includes(root)) {
      messageApi.error(`Unknown variable: ${root}.`);
      return;
    }
    onValidExpression(candidate);
    setWatchDraft("");
  }, [availableVariableRoots, getWatchExpressionRoot, isWatchExpression, messageApi, watchDraft]);

  return {
    watchDraft,
    setWatchDraft,
    watchVariables,
    setWatchVariables,
    selectedVariable,
    setSelectedVariable,
    selectionLocked,
    setSelectionLocked,
    advancedSelectionOpen,
    setAdvancedSelectionOpen,
    addWatchVariable,
    removeWatchVariable,
    submitWatchExpression,
  };
};
