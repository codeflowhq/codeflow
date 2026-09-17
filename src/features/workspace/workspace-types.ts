import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { editor } from "monaco-editor";

import type {
  ManifestEntry,
  OverlayGroup,
  VariableConfig,
  VisualizationLayoutMode,
  VisualizationLayoutState,
  VisualizationWindowLayout,
} from "../../shared/types/visualization";
import type { EditorMountHandler } from "../editor/useEditorDecorations";
import type { TimelineFrame } from "../../shared/lib/timeline";
import type { ExportScope, ExportSourceCache } from "../visualization/useExportState";
import type { PlaybackSpeed } from "../visualization/useTimelinePlayback";

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
  hasPendingRunChanges: boolean;
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
  playbackSpeed: PlaybackSpeed;
  setActiveTimelineKey: Dispatch<SetStateAction<string>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setPlaybackSpeed: Dispatch<SetStateAction<PlaybackSpeed>>;
  stepTo: (offset: number) => void;
  timelineFrames: TimelineFrame[];
};

export type PageActions = {
  runVisualization: (overlayGroups?: OverlayGroup[]) => Promise<boolean>;
  openSettings: () => void;
  openCollections: () => void;
  openSaveModal: () => void;
  openGuide: () => void;
  exportProject: (scope?: ExportScope) => Promise<void>;
  shareProject: () => Promise<void>;
};

export type VisualState = {
  manifest: ManifestEntry[];
  exportSources: ExportSourceCache;
  layoutState: VisualizationLayoutState;
  setLayoutMode: (mode: VisualizationLayoutMode) => void;
  setMasonryOrder: (order: string[]) => void;
  createOverlayGroup: (variables: string[]) => void;
  removeOverlayGroup: (groupId: string) => void;
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
