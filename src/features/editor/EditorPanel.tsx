import Editor from "@monaco-editor/react";
import { Alert, Button, Card, Input, Space, Tag, Tooltip, Typography } from "antd";
import { CloseOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

import type { EditorState, WatchState } from "../workspace/workspace-types";

const { Text } = Typography;

type EditorPanelProps = {
  editorState: EditorState;
  watchState: WatchState;
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

const statusLabel = (status: string) => {
  if (status === "ready") {
    return "Runtime ready";
  }
  return status;
};

const statusAlertType = (status: string, message: string) => {
  if (status === "error") {
    return "error" as const;
  }
  if (status === "loading") {
    return "info" as const;
  }
  if (message !== "Runtime ready") {
    return "warning" as const;
  }
  return "info" as const;
};

const buildStatusAlert = (status: string, message: string): { message: ReactNode; description?: ReactNode } => {
  const missingPackageMatch = /^Missing Python package:\s*([^.]+)\.\s*Add it in Settings > Runtime packages, then run again\.$/.exec(message);
  if (missingPackageMatch) {
    return {
      message: "Missing Python package",
      description: (
        <Space wrap size={[6, 6]}>
          <Tag color="volcano">{missingPackageMatch[1]}</Tag>
          <Text type="secondary">Add it in</Text>
          <Text code>Settings &gt; Runtime packages</Text>
          <Text type="secondary">then run again.</Text>
        </Space>
      ),
    };
  }
  return { message };
};

const shouldShowStatusAlert = (status: string, message: string) =>
  Boolean(message) && status !== "error" && (status === "loading" || message !== "Runtime ready");

const advancedInputStatus = (status: WatchState["advancedSelectionState"]["status"]) => {
  if (status === "error") {
    return "error" as const;
  }
  if (status === "warning") {
    return "warning" as const;
  }
  return undefined;
};

const advancedHelperClassName = (status: WatchState["advancedSelectionState"]["status"]) => {
  if (status === "match") {
    return "advanced-selection-helper advanced-selection-helper-match";
  }
  if (status === "warning") {
    return "advanced-selection-helper advanced-selection-helper-warning";
  }
  if (status === "error") {
    return "advanced-selection-helper advanced-selection-helper-error";
  }
  return "advanced-selection-helper";
};

const canSubmitAdvancedSelection = (status: WatchState["advancedSelectionState"]["status"]) =>
  status !== "error" && status !== "warning";

const handleAdvancedSelectionEnter = (
  status: WatchState["advancedSelectionState"]["status"],
  submit: () => void,
) => {
  if (!canSubmitAdvancedSelection(status)) {
    return;
  }
  submit();
};

const EditorPanel = ({
  editorState,
  watchState,
  onCloseAdvancedSelection,
}: EditorPanelProps) => (
  <Card
    className="surface-card surface-card-subtle"
    title="Code"
    extra={<Tag color={statusColor(editorState.status)}>{statusLabel(editorState.status)}</Tag>}
  >
    <Space orientation="vertical" size={12} style={{ width: "100%" }}>
      {watchState.selectionLocked ? (
        <div className="workspace-banner workspace-banner-active">
          <div className="workspace-banner-copy">
            <Text strong>Select mode is on</Text>
            <Text type="secondary">Click variable names in the editor to add them.</Text>
          </div>
        </div>
      ) : null}

      {watchState.advancedSelectionOpen ? (
        <div className="advanced-selection-bar">
          <div className="advanced-selection-input-group">
            <Input
              className={watchState.advancedSelectionState.status === "match" ? "advanced-selection-input advanced-selection-input-match" : "advanced-selection-input"}
              status={advancedInputStatus(watchState.advancedSelectionState.status)}
              value={watchState.watchDraft}
              placeholder={'data["indomie"]'}
              onChange={(event) => watchState.setWatchDraft(event.target.value)}
              onPressEnter={() => handleAdvancedSelectionEnter(
                watchState.advancedSelectionState.status,
                watchState.handleSubmitWatchExpression,
              )}
            />
            {watchState.advancedSelectionState.message ? (
              <Text className={advancedHelperClassName(watchState.advancedSelectionState.status)}>
                {watchState.advancedSelectionState.message}
              </Text>
            ) : null}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={watchState.handleSubmitWatchExpression}
            aria-label="Add custom watch expression"
            disabled={!canSubmitAdvancedSelection(watchState.advancedSelectionState.status)}
          />
          <Button danger icon={<CloseOutlined />} onClick={onCloseAdvancedSelection} aria-label="Close advanced selection" />
        </div>
      ) : null}

      <div className="editor-shell">
        {watchState.selectionLocked || watchState.advancedSelectionOpen ? (
          <Tooltip title={watchState.selectionLocked ? "Cannot edit in selection mode." : "Cannot edit in advanced selection."}>
            <div
              className="editor-readonly-indicator"
              aria-label={watchState.selectionLocked ? "Editing locked in selection mode" : "Editing locked in advanced selection"}
            >
              <LockOutlined />
            </div>
          </Tooltip>
        ) : null}
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
      {shouldShowStatusAlert(editorState.status, editorState.statusMessage) ? (
        <Alert
          type={statusAlertType(editorState.status, editorState.statusMessage)}
          showIcon
          {...buildStatusAlert(editorState.status, editorState.statusMessage)}
        />
      ) : null}
    </Space>
  </Card>
);

export default EditorPanel;
