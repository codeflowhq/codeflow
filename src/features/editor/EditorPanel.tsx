import Editor from "@monaco-editor/react";
import { Button, Card, Input, Space, Tag, Typography } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";

import type { EditorState, WatchState } from "../workspace/workspace-types";

const { Text } = Typography;

type EditorPanelProps = {
  editorState: EditorState;
  watchState: WatchState;
  onExitPickingMode: () => void;
  onCloseAdvancedSelection: () => void;
};

const statusColor = (status: string) => {
  if (status === "error") {
    return "error";
  }
  if (status === "ready") {
    return "success";
  }
  return "processing";
};

const EditorPanel = ({
  editorState,
  watchState,
  onExitPickingMode,
  onCloseAdvancedSelection,
}: EditorPanelProps) => (
  <Card
    className="surface-card surface-card-subtle"
    title="Code"
    extra={<Tag color={statusColor(editorState.status)}>{editorState.status}</Tag>}
  >
    <Space orientation="vertical" size={12} style={{ width: "100%" }}>
      {watchState.selectionLocked ? (
        <div className="workspace-banner workspace-banner-active">
          <div className="workspace-banner-copy">
            <Text strong>Picking mode active</Text>
            <Text type="secondary">Click identifiers in the editor to add them to the watch list.</Text>
          </div>
          <Button onClick={onExitPickingMode}>Exit picking mode</Button>
        </div>
      ) : null}

      {watchState.advancedSelectionOpen ? (
        <div className="advanced-selection-bar">
          <Input
            value={watchState.watchDraft}
            placeholder={'data["indomie"]'}
            onChange={(event) => watchState.setWatchDraft(event.target.value)}
            onPressEnter={watchState.handleSubmitWatchExpression}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={watchState.handleSubmitWatchExpression} aria-label="Add custom watch expression" />
          <Button danger icon={<CloseOutlined />} onClick={onCloseAdvancedSelection} aria-label="Close advanced selection" />
        </div>
      ) : null}

      <div className="editor-shell">
        <Editor
          height="460px"
          defaultLanguage="python"
          theme="vs-dark"
          value={editorState.sourceCode}
          options={editorState.editorOptions}
          onChange={(value) => editorState.setSourceCode(value ?? "")}
          onMount={editorState.handleEditorMount}
        />
      </div>
    </Space>
  </Card>
);

export default EditorPanel;
