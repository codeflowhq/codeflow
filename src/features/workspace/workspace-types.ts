import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { editor } from "monaco-editor";

import type {
  ManifestEntry,
  VariableConfig,
  VisualizationLayoutMode,
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";
import type { EditorMountHandler } from "../editor/useEditorDecorations";
import type { TimelineFrame } from "../../shared/lib/timeline";

export type WatchState = {
  advancedSelectionState: {
    status: "idle" | "match" | "warning" | "error";
    message: string;
  };
  candidateVariables: string[];
  selectedVariable: string | null;
  selectionLocked: boolean;
  setSelectedVariable: Dispatch<SetStateAction<string | null>>;
  setSelectionLocked: Dispatch<SetStateAction<boolean>>;
  advancedSelectionOpen: boolean;
  setAdvancedSelectionOpen: Dispatch<SetStateAction<boolean>>;
  watchDraft: string;
  setWatchDraft: Dispatch<SetStateAction<string>>;
  watchVariables: string[];
  pendingWatchVariables: string[];
  removeWatchVariable: (variable: string) => void;
  handleAddWatchVariable: (variable: string, options?: { openConfig?: boolean }) => void;
  handleOpenVariableConfig: (variable: string) => void;
  handleSubmitWatchExpression: () => void;
};

export type EditorState = {
  editorOptions: editor.IStandaloneEditorConstructionOptions;
  handleEditorMount: EditorMountHandler;
  runtimeReady: boolean;
  setSourceCode: Dispatch<SetStateAction<string>>;
  sourceCode: string;
  status: string;
  statusMessage: string;
};

export type TimelineState = {
  activeTimelineFrame?: TimelineFrame;
  activeTimelineIndex: number;
  activeTimelineKey: string;
  isPlaying: boolean;
  setActiveTimelineKey: Dispatch<SetStateAction<string>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  stepTo: (offset: number) => void;
  timelineFrames: TimelineFrame[];
};

export type PageActions = {
  runVisualization: () => Promise<void>;
  openSettings: () => void;
  openCollections: () => void;
  openSaveModal: () => void;
  exportProject: () => Promise<void>;
  shareProject: () => Promise<void>;
};

export type VisualState = {
  manifest: ManifestEntry[];
  exportSources: Record<string, string>;
  layoutState: VisualizationLayoutState;
  setLayoutMode: (mode: VisualizationLayoutMode) => void;
  setMasonryOrder: (order: string[]) => void;
  setExportSource: (variable: string, svg: string | null) => void;
  setWindowLayout: (variable: string, layout: VisualizationWindowLayout) => void;
  setWindowZIndex: (variable: string, zIndex: number) => void;
};

export type WorkspaceValue = {
  editorState: EditorState;
  pageActions: PageActions;
  timelineState: TimelineState;
  variableConfigs: Record<string, VariableConfig>;
  visualState: VisualState;
  watchState: WatchState;
};

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);
