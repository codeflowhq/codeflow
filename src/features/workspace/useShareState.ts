import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { GlobalConfig, TopMenuKey, VariableConfig, VizMenuKey } from "../../shared/types/visualization";

type MessageApi = {
  success: (message: string) => void;
};

type SharePayload = {
  sourceCode: string;
  watchVariables: string[];
  globalConfig: GlobalConfig;
  variableConfigs: Record<string, VariableConfig>;
};

type UseShareStateOptions = {
  defaultGlobalConfig: GlobalConfig;
  defaultSnippet: string;
  globalConfig: GlobalConfig;
  messageApi: MessageApi;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  setSourceCode: Dispatch<SetStateAction<string>>;
  setStatusMessage: Dispatch<SetStateAction<string>>;
  setTopMenuKey: Dispatch<SetStateAction<TopMenuKey>>;
  setVariableConfigs: Dispatch<SetStateAction<Record<string, VariableConfig>>>;
  setVizMenuKey: Dispatch<SetStateAction<VizMenuKey>>;
  setWatchVariables: Dispatch<SetStateAction<string[]>>;
  shareParam: string;
  sourceCode: string;
  variableConfigs: Record<string, VariableConfig>;
  watchVariables: string[];
};

const encodeShareState = (payload: SharePayload): string => btoa(encodeURIComponent(JSON.stringify(payload)));
const decodeShareState = (raw: string): SharePayload => JSON.parse(decodeURIComponent(atob(raw))) as SharePayload;

export const useShareState = ({
  defaultGlobalConfig,
  defaultSnippet,
  globalConfig,
  messageApi,
  setGlobalConfig,
  setSourceCode,
  setStatusMessage,
  setTopMenuKey,
  setVariableConfigs,
  setVizMenuKey,
  setWatchVariables,
  shareParam,
  sourceCode,
  variableConfigs,
  watchVariables,
}: UseShareStateOptions) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get(shareParam);
    if (!shared) {
      return;
    }
    try {
      const state = decodeShareState(shared);
      setSourceCode(state.sourceCode ?? defaultSnippet);
      setWatchVariables(state.watchVariables ?? ["data"]);
      setGlobalConfig(state.globalConfig ?? defaultGlobalConfig);
      setVariableConfigs(state.variableConfigs ?? {});
      setTopMenuKey("visualization");
      setVizMenuKey("main");
      setStatusMessage("Loaded shared state from URL.");
    } catch {
      setStatusMessage("Share link is invalid or unreadable.");
    }
  }, [defaultGlobalConfig, defaultSnippet, setGlobalConfig, setSourceCode, setStatusMessage, setTopMenuKey, setVariableConfigs, setVizMenuKey, setWatchVariables, shareParam]);

  const handleShare = useCallback(async () => {
    const payload: SharePayload = { sourceCode, watchVariables, globalConfig, variableConfigs };
    const url = new URL(window.location.href);
    url.searchParams.set(shareParam, encodeShareState(payload));
    await navigator.clipboard.writeText(url.toString());
    messageApi.success("Share link copied.");
  }, [globalConfig, messageApi, shareParam, sourceCode, variableConfigs, watchVariables]);

  return { handleShare };
};
