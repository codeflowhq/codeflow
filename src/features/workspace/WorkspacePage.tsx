import { Button, Card, Dropdown, Input, Modal, Select, Space, Tooltip, Typography } from "antd";
import { EditOutlined, MoreOutlined, PlayCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";

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
};

const WorkspacePage = ({ projectName, projectDescription, projectLabels = [], availableLabels = [], onOpenSettings, onUpdateProjectDetails }: WorkspacePageProps) => {
  const { editorState, pageActions, timelineState, variableConfigs, visualState, watchState } = useWorkspace();
  const layoutMode = visualState.layoutState.mode;
  const hasExportablePanels = Object.values(visualState.exportSources[timelineState.activeTimelineKey] ?? {}).some((svg) => svg.trim().length > 0);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState(projectName);
  const [projectDescriptionDraft, setProjectDescriptionDraft] = useState(projectDescription);
  const [projectLabelsDraft, setProjectLabelsDraft] = useState(projectLabels);
  const hasCode = editorState.sourceCode.trim().length > 0;
  const visibleManifest = useMemo(
    () => visualState.manifest.filter((entry) => watchState.watchVariables.includes(entry.variable)),
    [visualState.manifest, watchState.watchVariables],
  );

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

  return (
    <div className="workspace-page-stack">
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
              <Button type="text" icon={<SettingOutlined />} onClick={onOpenSettings} aria-label="Open visualization settings" />
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
          <FeatureBoundary title="The editor panel failed to render.">
            <EditorPanel
              editorState={editorState}
              watchState={watchState}
              onExitPickingMode={() => watchState.setSelectionLocked(false)}
              onCloseAdvancedSelection={() => watchState.setAdvancedSelectionOpen(false)}
            />
          </FeatureBoundary>
          <FeatureBoundary title="The watch panel failed to render.">
            <WatchPanel watchState={watchState} />
          </FeatureBoundary>
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
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={editorState.status === "loading"}
                disabled={!editorState.runtimeReady}
                onClick={() => void pageActions.runVisualization()}
              >
                Run
              </Button>
            </Space>
          )}
        >
          <div className="workspace-visual-stack">
            <FeatureBoundary title="The timeline controls failed to render.">
              <TimelineControls timelineState={timelineState} panelCount={visibleManifest.length} layoutMode={layoutMode} />
            </FeatureBoundary>
            <FeatureBoundary title="The visualization panel failed to render." actionLabel="Run again" onAction={() => void pageActions.runVisualization()}>
              <VisualCanvas
                manifest={visibleManifest}
                activeTimelineKey={timelineState.activeTimelineFrame?.timelineKey ?? ""}
                variableConfigs={variableConfigs}
                exportSources={visualState.exportSources}
                onOpenConfig={watchState.handleOpenVariableConfig}
                onRemoveVariable={watchState.removeWatchVariable}
                onRunVisualization={pageActions.runVisualization}
                canRun={hasCode}
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
