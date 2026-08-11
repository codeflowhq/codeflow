import { Button, Card, Dropdown, Input, Modal, Select, Space, Tooltip, Tour, Typography } from "antd";
import { EditOutlined, MoreOutlined, SettingOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";

import { useWorkspace } from "./useWorkspace";
import EditorPanel from "../editor/EditorPanel";
import WatchPanel from "../watch/WatchPanel";
import TimelineControls from "../visualization/TimelineControls";
import VisualCanvas from "../visualization/VisualCanvas";
import FeatureBoundary from "../../shared/ui/FeatureBoundary";

const { Title } = Typography;

type WorkspacePageProps = {
  projectName: string;
  projectDescription: string;
  projectLabels: string[];
  availableLabels: string[];
  onOpenSettings: () => void;
  onUpdateProjectDetails: (name: string, description: string, labels: string[]) => void;
  guideOpen: boolean;
  onCloseGuide: () => void;
};

const WorkspacePage = ({
  projectName,
  projectDescription,
  projectLabels = [],
  availableLabels = [],
  onOpenSettings,
  onUpdateProjectDetails,
  guideOpen,
  onCloseGuide,
}: WorkspacePageProps) => {
  const { editorState, pageActions, timelineState, variableConfigs, visualState, watchState } = useWorkspace();
  const layoutMode = visualState.layoutState.mode;
  const hasExportablePanels = Object.values(visualState.exportSources[timelineState.activeTimelineKey] ?? {}).some((svg) => svg.trim().length > 0);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState(projectName);
  const [projectDescriptionDraft, setProjectDescriptionDraft] = useState(projectDescription);
  const [projectLabelsDraft, setProjectLabelsDraft] = useState(projectLabels);
  const autoPlayAfterRunRef = useRef(false);
  const [codeGuideTarget, setCodeGuideTarget] = useState<HTMLDivElement | null>(null);
  const [variablesGuideTarget, setVariablesGuideTarget] = useState<HTMLDivElement | null>(null);
  const [primaryActionGuideTarget, setPrimaryActionGuideTarget] = useState<HTMLButtonElement | null>(null);
  const [timelineGuideTarget, setTimelineGuideTarget] = useState<HTMLDivElement | null>(null);
  const [watchAddGuideTarget, setWatchAddGuideTarget] = useState<HTMLSpanElement | null>(null);
  const [projectSettingsGuideTarget, setProjectSettingsGuideTarget] = useState<HTMLElement | null>(null);
  const [variableSettingsGuideTarget, setVariableSettingsGuideTarget] = useState<HTMLButtonElement | null>(null);
  const hasTimeline = timelineState.timelineFrames.length > 0;
  const isAtLastStep = hasTimeline && timelineState.activeTimelineIndex >= timelineState.timelineFrames.length - 1;
  const shouldRunPrimaryAction = !hasTimeline || editorState.hasPendingRunChanges;
  const visibleManifest = useMemo(
    () => visualState.manifest.filter((entry) => watchState.watchVariables.includes(entry.variable)),
    [visualState.manifest, watchState.watchVariables],
  );
  const guideSteps = useMemo(() => [
    {
      title: "Write code",
      description: "Paste or write Python code here.",
      target: codeGuideTarget,
    },
    {
      title: "Add variables",
      description: "Use + Add to choose how to add watched variables.",
      target: variablesGuideTarget,
    },
    {
      title: "Two add methods",
      description: "Select variables lets you click names in the editor. Advanced selection lets you type an expression.",
      target: watchAddGuideTarget,
    },
    {
      title: "Play",
      description: shouldRunPrimaryAction
        ? "Play will refresh the visualization first when the code or watched variables changed."
        : "Play replays the current timeline. At the last step, it starts again from the beginning.",
      target: primaryActionGuideTarget,
    },
    {
      title: "Step through",
      description: "Use the slider and step buttons to move through the execution.",
      target: timelineGuideTarget,
    },
    {
      title: "Project settings",
      description: "Use this settings button for global visualization and runtime settings.",
      target: projectSettingsGuideTarget,
    },
    {
      title: "Variable settings",
      description: "Each watched variable has its own settings button here after you add one.",
      target: variableSettingsGuideTarget ?? variablesGuideTarget,
    },
  ], [
    codeGuideTarget,
    primaryActionGuideTarget,
    projectSettingsGuideTarget,
    shouldRunPrimaryAction,
    timelineGuideTarget,
    variableSettingsGuideTarget,
    variablesGuideTarget,
    watchAddGuideTarget,
  ]);

  const layoutMenu = useMemo(
    () => ({
      items: [
        { key: "masonry", label: "Masonry" },
        { key: "windows", label: "Windows" },
      ],
      onClick: ({ key }: { key: string }) => visualState.setLayoutMode(key as "masonry" | "windows"),
    }),
    [visualState],
  );
  const exportMenu = useMemo(
    () => ({
      items: [
        { key: "current", label: "Export current step" },
      ],
      onClick: () => void pageActions.exportProject("current"),
    }),
    [pageActions],
  );

  const handleSubmitProjectDetails = () => {
    onUpdateProjectDetails(
      projectNameDraft.trim() || "Untitled project",
      projectDescriptionDraft.trim(),
      projectLabelsDraft,
    );
    setProjectDetailsOpen(false);
  };

  useEffect(() => {
    if (!autoPlayAfterRunRef.current || shouldRunPrimaryAction || timelineState.timelineFrames.length === 0) {
      return;
    }
    autoPlayAfterRunRef.current = false;
    timelineState.setActiveTimelineKey(timelineState.timelineFrames[0]?.timelineKey ?? "");
    timelineState.setIsPlaying(true);
  }, [
    shouldRunPrimaryAction,
    timelineState,
  ]);

  return (
    <div className="workspace-page-stack">
      <Tour open={guideOpen} onClose={onCloseGuide} steps={guideSteps} />
      <div className="workspace-page-header">
        <Space size={12}>
          <div className="workspace-title-group">
            <div>
              <Title level={2} className="workspace-page-title">
                {projectName}
              </Title>
            </div>
            <Space size={4}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setProjectNameDraft(projectName);
                  setProjectDescriptionDraft(projectDescription);
                  setProjectLabelsDraft(projectLabels);
                  setProjectDetailsOpen(true);
                }}
                aria-label="Edit project details"
              />
              <Button
                ref={setProjectSettingsGuideTarget}
                type="text"
                icon={<SettingOutlined />}
                onClick={onOpenSettings}
                aria-label="Open visualization settings"
              />
            </Space>
          </div>
        </Space>
        <Space wrap>
          <Button onClick={pageActions.openSaveModal}>Save</Button>
          <Tooltip title={hasExportablePanels ? undefined : "Run once and wait for the current step to finish rendering before exporting."}>
            <span>
              <Dropdown menu={exportMenu} trigger={["click"]}>
                <Button disabled={!hasExportablePanels}>Export <MoreOutlined /></Button>
              </Dropdown>
            </span>
          </Tooltip>
          <Button onClick={() => void pageActions.shareProject()}>Share</Button>
        </Space>
      </div>
      <Modal
        open={projectDetailsOpen}
        title="Project details"
        onCancel={() => setProjectDetailsOpen(false)}
        onOk={handleSubmitProjectDetails}
        okButtonProps={{ disabled: !projectNameDraft.trim() }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Text strong>Project name</Typography.Text>
            <Input
              value={projectNameDraft}
              placeholder="Untitled project"
              onChange={(event) => setProjectNameDraft(event.target.value)}
            />
          </div>
          <div>
            <Typography.Text strong>Description</Typography.Text>
            <Input.TextArea
              value={projectDescriptionDraft}
              placeholder="Add a short description for this project"
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={(event) => setProjectDescriptionDraft(event.target.value)}
            />
          </div>
          <div>
            <Typography.Text strong>Labels</Typography.Text>
            <Select
              style={{ width: "100%" }}
              mode="tags"
              value={projectLabelsDraft}
              options={availableLabels.map((label) => ({ label, value: label }))}
              placeholder="Add labels"
              tokenSeparators={[","]}
              onChange={(values) => setProjectLabelsDraft(values)}
            />
          </div>
        </Space>
      </Modal>

      <div className="viz-main-grid workspace-reference-grid">
        <div className="viz-left-stack workspace-left-column">
          <div ref={setCodeGuideTarget}>
            <FeatureBoundary title="The editor panel failed to render.">
              <EditorPanel
                editorState={editorState}
                watchState={watchState}
                onCloseAdvancedSelection={() => watchState.setAdvancedSelectionOpen(false)}
              />
            </FeatureBoundary>
          </div>
          <div ref={setVariablesGuideTarget}>
            <FeatureBoundary title="The watch panel failed to render.">
              <WatchPanel
                watchState={watchState}
                addButtonRef={setWatchAddGuideTarget}
                firstConfigButtonRef={setVariableSettingsGuideTarget}
                showGuideVariablePlaceholder={guideOpen && watchState.watchVariables.length === 0}
              />
            </FeatureBoundary>
          </div>
        </div>

        <Card
          className="surface-card surface-card-subtle workspace-visual-card"
          title="Visualization"
          extra={(
            <Space size={8}>
              <Dropdown menu={layoutMenu} trigger={["click"]}>
                <Button>
                  {layoutMode === "masonry" ? "Masonry" : "Windows"} <MoreOutlined />
                </Button>
              </Dropdown>
            </Space>
          )}
        >
          <div className="workspace-visual-stack">
            <div ref={setTimelineGuideTarget}>
              <FeatureBoundary title="The timeline controls failed to render.">
                <TimelineControls
                  timelineState={timelineState}
                  panelCount={visibleManifest.length}
                  layoutMode={layoutMode}
                  playButtonRef={setPrimaryActionGuideTarget}
                  sliderRef={setTimelineGuideTarget}
                  primaryActionLabel={timelineState.isPlaying ? "Pause" : "Play"}
                  primaryActionLoading={editorState.status === "loading"}
                  primaryActionDisabled={!editorState.runtimeReady}
                  primaryActionTooltip={shouldRunPrimaryAction ? "Refresh the visualization and start playback." : undefined}
                  onPrimaryAction={() => {
                    if (shouldRunPrimaryAction) {
                      autoPlayAfterRunRef.current = true;
                      void pageActions.runVisualization().then((succeeded) => {
                        if (!succeeded) {
                          autoPlayAfterRunRef.current = false;
                        }
                      });
                      return;
                    }
                    if (timelineState.isPlaying) {
                      timelineState.setIsPlaying(false);
                      return;
                    }
                    if (isAtLastStep) {
                      timelineState.setActiveTimelineKey(timelineState.timelineFrames[0]?.timelineKey ?? "");
                    }
                    timelineState.setIsPlaying(true);
                  }}
                />
              </FeatureBoundary>
            </div>
            <FeatureBoundary title="The visualization panel failed to render." actionLabel="Run again" onAction={() => void pageActions.runVisualization()}>
              <VisualCanvas
                manifest={visibleManifest}
                activeTimelineKey={timelineState.activeTimelineFrame?.timelineKey ?? ""}
                activeTimelineEventOrder={timelineState.activeTimelineFrame?.eventOrder ?? null}
                variableConfigs={variableConfigs}
                exportSources={visualState.exportSources}
                emptyStateMessage={editorState.statusMessage || undefined}
                onOpenConfig={watchState.handleOpenVariableConfig}
                onRemoveVariable={watchState.removeWatchVariable}
                onRunVisualization={pageActions.runVisualization}
                onOpenGuide={pageActions.openGuide}
                canRun={editorState.sourceCode.trim().length > 0}
                layoutMode={layoutMode}
                layoutState={visualState.layoutState}
                setExportSource={visualState.setExportSource}
                setMasonryOrder={visualState.setMasonryOrder}
                setWindowLayout={visualState.setWindowLayout}
                setWindowZIndex={visualState.setWindowZIndex}
              />
            </FeatureBoundary>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkspacePage;
