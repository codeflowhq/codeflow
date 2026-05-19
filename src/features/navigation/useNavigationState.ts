import { useCallback, useState } from "react";

import {
  TOP_MENU_LIBRARY,
  TOP_MENU_VISUALIZATION,
  VIZ_MENU_CONFIG,
  VIZ_MENU_MAIN,
} from "./navigationState";
import type { TopMenuKey, VizMenuKey } from "../../shared/types/visualization";

export const useNavigationState = () => {
  const [topMenuKey, setTopMenuKey] = useState<TopMenuKey>(TOP_MENU_VISUALIZATION);
  const [vizMenuKey, setVizMenuKey] = useState<VizMenuKey>(VIZ_MENU_MAIN);

  const openVisualizationMain = useCallback(() => {
    setTopMenuKey(TOP_MENU_VISUALIZATION);
    setVizMenuKey(VIZ_MENU_MAIN);
  }, []);

  const openVisualizationConfig = useCallback(() => {
    setTopMenuKey(TOP_MENU_VISUALIZATION);
    setVizMenuKey(VIZ_MENU_CONFIG);
  }, []);

  const openLibrary = useCallback(() => {
    setTopMenuKey(TOP_MENU_LIBRARY);
  }, []);

  return {
    topMenuKey,
    setTopMenuKey,
    vizMenuKey,
    setVizMenuKey,
    openLibrary,
    openVisualizationConfig,
    openVisualizationMain,
  };
};
