import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  TOP_MENU_LIBRARY,
  TOP_MENU_VISUALIZATION,
  VIZ_MENU_CONFIG,
  VIZ_MENU_MAIN,
} from "./navigationState";
import type { TopMenuKey, VizMenuKey } from "../../shared/types/visualization";

const WORKSPACE_PATH = "/workspace";
const SETTINGS_PATH = "/settings";
const COLLECTIONS_PATH = "/collections";

type NavigationSnapshot = {
  topMenuKey: TopMenuKey;
  vizMenuKey: VizMenuKey;
};

const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === "/") {
    return "/";
  }
  return pathname.replace(/\/+$/, "") || "/";
};

const parseNavigationPath = (pathname: string): NavigationSnapshot => {
  const normalized = normalizePathname(pathname);
  if (normalized === COLLECTIONS_PATH) {
    return { topMenuKey: TOP_MENU_LIBRARY, vizMenuKey: VIZ_MENU_MAIN };
  }
  if (normalized === SETTINGS_PATH) {
    return { topMenuKey: TOP_MENU_VISUALIZATION, vizMenuKey: VIZ_MENU_CONFIG };
  }
  return { topMenuKey: TOP_MENU_VISUALIZATION, vizMenuKey: VIZ_MENU_MAIN };
};

const buildNavigationPath = ({ topMenuKey, vizMenuKey }: NavigationSnapshot): string => {
  if (topMenuKey === TOP_MENU_LIBRARY) {
    return COLLECTIONS_PATH;
  }
  return vizMenuKey === VIZ_MENU_CONFIG ? SETTINGS_PATH : WORKSPACE_PATH;
};

const buildLocationUrl = (pathname: string): string =>
  `${pathname}${window.location.search}${window.location.hash}`;

export const useNavigationState = () => {
  const [navigationState, setNavigationState] = useState<NavigationSnapshot>(() =>
    parseNavigationPath(window.location.pathname),
  );
  const stateRef = useRef(navigationState);

  useEffect(() => {
    stateRef.current = navigationState;
  }, [navigationState]);

  const applyNavigation = useCallback((nextState: NavigationSnapshot, mode: "push" | "replace" = "push") => {
    stateRef.current = nextState;
    setNavigationState(nextState);
    const nextPath = buildNavigationPath(nextState);
    if (normalizePathname(window.location.pathname) === nextPath) {
      return;
    }
    const method = mode === "replace" ? "replaceState" : "pushState";
    window.history[method](window.history.state, "", buildLocationUrl(nextPath));
  }, []);

  useEffect(() => {
    const canonicalPath = buildNavigationPath(stateRef.current);
    if (normalizePathname(window.location.pathname) !== canonicalPath) {
      window.history.replaceState(window.history.state, "", buildLocationUrl(canonicalPath));
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextState = parseNavigationPath(window.location.pathname);
      stateRef.current = nextState;
      setNavigationState(nextState);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setTopMenuKey = useCallback<Dispatch<SetStateAction<TopMenuKey>>>((value) => {
    const previous = stateRef.current;
    const nextTopMenuKey =
      typeof value === "function" ? value(previous.topMenuKey) : value;
    applyNavigation(
      {
        topMenuKey: nextTopMenuKey,
        vizMenuKey: previous.vizMenuKey,
      },
      "push",
    );
  }, [applyNavigation]);

  const setVizMenuKey = useCallback<Dispatch<SetStateAction<VizMenuKey>>>((value) => {
    const previous = stateRef.current;
    const nextVizMenuKey =
      typeof value === "function" ? value(previous.vizMenuKey) : value;
    applyNavigation(
      {
        topMenuKey: previous.topMenuKey,
        vizMenuKey: nextVizMenuKey,
      },
      "push",
    );
  }, [applyNavigation]);

  const openVisualizationMain = useCallback(() => {
    applyNavigation(
      { topMenuKey: TOP_MENU_VISUALIZATION, vizMenuKey: VIZ_MENU_MAIN },
      "push",
    );
  }, [applyNavigation]);

  const openVisualizationConfig = useCallback(() => {
    applyNavigation(
      { topMenuKey: TOP_MENU_VISUALIZATION, vizMenuKey: VIZ_MENU_CONFIG },
      "push",
    );
  }, [applyNavigation]);

  const openLibrary = useCallback(() => {
    applyNavigation(
      { topMenuKey: TOP_MENU_LIBRARY, vizMenuKey: stateRef.current.vizMenuKey },
      "push",
    );
  }, [applyNavigation]);

  return {
    topMenuKey: navigationState.topMenuKey,
    setTopMenuKey,
    vizMenuKey: navigationState.vizMenuKey,
    setVizMenuKey,
    openLibrary,
    openVisualizationConfig,
    openVisualizationMain,
  };
};
