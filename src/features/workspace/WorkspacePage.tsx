import { Button, Card, Dropdown, Space, Typography } from "antd";
import { MoreOutlined, PlayCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";

import { useWorkspace } from "./useWorkspace";
import EditorPanel from "../editor/EditorPanel";
import WatchPanel from "../watch/WatchPanel";
import TimelineControls from "../visualization/TimelineControls";
import VisualCanvas from "../visualization/VisualCanvas";

const { Title } = Typography;

type WorkspacePageProps = {
  projectName: string;
  onOpenSettings: () => void;
  onRenameProject: (name: string) => void;
};

const WorkspacePage = ({ projectName, onOpenSettings, onRenameProject }: WorkspacePageProps) => {
  const { editorState, pageActions, timelineState, variableConfigs, visualState, watchState } = useWorkspace();
  const [layoutMode, setLayoutMode] = useState<"masonry" | "windows">("masonry");
  const hasCode = editorState.sourceCode.trim().length > 0;

  const layoutMenu = useMemo(
    () => ({
      items: [
        { key: "masonry", label: "Masonry" },
        { key: "windows", label: "Windows" },
      ],
      onClick: ({ key }: { key: string }) => setLayoutMode(key as "masonry" | "windows"),
    }),
    [],
  );

  return (
    <div className="workspace-page-stack">
      <div className="workspace-page-header">
        <Space size={12}>
          <Title
            level={2}
            className="workspace-page-title"
            editable={{ onChange: onRenameProject, tooltip: "Rename project" }}
          >
            {projectName}
          </Title>
          <Button icon={<SettingOutlined />} onClick={onOpenSettings} aria-label="Open project settings" />
        </Space>
        <Space wrap>
          <Button onClick={pageActions.openSaveModal}>Save</Button>
          <Button onClick={pageActions.shareProject}>Share</Button>
        </Space>
      </div>

      <div className="viz-main-grid workspace-reference-grid">
        <div className="viz-left-stack workspace-left-column">
          <EditorPanel
            editorState={editorState}
            watchState={watchState}
            onExitPickingMode={() => watchState.setSelectionLocked(false)}
            onCloseAdvancedSelection={() => watchState.setAdvancedSelectionOpen(false)}
          />
          <WatchPanel watchState={watchState} />
        </div>

        <Card
          className="surface-card surface-card-subtle workspace-visual-card"
          title="Visualization"
          extra={(
            <Space size={8}>
              <Dropdown menu={layoutMenu} trigger={["click"]}>
                <Button>
                  Layout <MoreOutlined />
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
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <TimelineControls timelineState={timelineState} panelCount={visualState.manifest.length} layoutMode={layoutMode} />
            <VisualCanvas
              manifest={visualState.manifest}
              activeTimelineKey={timelineState.activeTimelineFrame?.timelineKey ?? ""}
              variableConfigs={variableConfigs}
              onOpenConfig={watchState.handleOpenVariableConfig}
              onRunVisualization={pageActions.runVisualization}
              canRun={hasCode}
              layoutMode={layoutMode}
            />
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default WorkspacePage;
