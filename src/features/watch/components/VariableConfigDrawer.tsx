import { useMemo, useState } from "react";
import { Alert, Button, Form, InputNumber, Menu, Modal, Select, Space, Tag, Typography } from "antd";

import type { VariableConfig, ViewKind } from "../../../shared/types/visualization";
import { viewSelectionSupportsColor, viewSelectionSupportsDepth } from "../../../shared/lib/view-capabilities";

const { Paragraph, Text } = Typography;
const PRESET_VIEW_COLORS = [
  "#64748b",
  "#0f766e",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#dc2626",
  "#ca8a04",
  "#475569",
] as const;

type VariableConfigDrawerProps = {
  open: boolean;
  variableName: string | null;
  availableVariables: string[];
  variableConfig: VariableConfig;
  defaultVariableConfig: VariableConfig;
  defaultDepthValue: number;
  viewKindOptionsByVariable: Record<string, ViewKind[]>;
  onClose: () => void;
  onApply: (drafts: Record<string, VariableConfig>) => void;
  pendingWatchVariables: string[];
  onSelectVariable: (variableName: string) => void;
};

const cloneConfig = (config: VariableConfig): VariableConfig => ({
  ...config,
  viewOptions: {
    ...config.viewOptions,
  },
});

const VariableConfigDrawer = ({
  open,
  variableName,
  availableVariables,
  variableConfig,
  defaultVariableConfig,
  defaultDepthValue,
  viewKindOptionsByVariable,
  onClose,
  onApply,
  pendingWatchVariables,
  onSelectVariable,
}: VariableConfigDrawerProps) => {
  const [drafts, setDrafts] = useState<Record<string, VariableConfig>>({});
  const defaultDepthLabel = defaultDepthValue < 0 ? "Auto" : String(defaultDepthValue);

  const selectedDraft = useMemo(() => {
    if (!variableName) {
      return cloneConfig(defaultVariableConfig);
    }
    return drafts[variableName] ?? cloneConfig(variableConfig);
  }, [defaultVariableConfig, drafts, variableConfig, variableName]);

  const viewKindOptions = useMemo(() => {
    if (!variableName) {
      return ["auto"] as ViewKind[];
    }
    return viewKindOptionsByVariable[variableName] ?? ["auto"];
  }, [variableName, viewKindOptionsByVariable]);

  const isPending = variableName ? pendingWatchVariables.includes(variableName) : false;
  const supportsColor = useMemo(
    () => viewSelectionSupportsColor(selectedDraft.viewKind, viewKindOptions),
    [selectedDraft.viewKind, viewKindOptions],
  );
  const supportsDepth = useMemo(
    () => viewSelectionSupportsDepth(selectedDraft.viewKind, viewKindOptions),
    [selectedDraft.viewKind, viewKindOptions],
  );

  const updateDraft = (updater: (current: VariableConfig) => VariableConfig) => {
    if (!variableName) {
      return;
    }
    setDrafts((prev) => ({
      ...prev,
      [variableName]: updater(prev[variableName] ?? cloneConfig(variableConfig)),
    }));
  };

  const handleResetDraft = () => {
    if (!variableName) {
      return;
    }
    Modal.confirm({
      title: "Reset watch settings?",
      content: `Reset all settings for ${variableName} back to the default watch configuration.`,
      okText: "Reset",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => updateDraft(() => cloneConfig(defaultVariableConfig)),
    });
  };

  const confirmApply = () => {
    const appliedCount = Object.keys(drafts).length;
    if (appliedCount === 0) {
      onClose();
      return;
    }
    Modal.confirm({
      title: "Apply watch settings?",
      content: `Apply changes for ${appliedCount} variable${appliedCount === 1 ? "" : "s"}.`,
      okText: "Apply",
      cancelText: "Cancel",
      centered: true,
      onOk: () => onApply(drafts),
    });
  };

  return (
    <Modal
      open={open}
      width={720}
      title={variableName ? `Watch settings · ${variableName}` : "Watch settings"}
      onCancel={onClose}
      destroyOnClose
      footer={null}
    >
      {variableName ? (
        <>
          <Form layout="vertical">
            <Paragraph type="secondary">
              Configure how this watched variable is rendered. Use the variable list on the left to jump between watched variables without leaving this dialog.
            </Paragraph>
            <div className="watch-settings-layout">
              <div className="watch-settings-sidebar">
                <Text strong>Watched variables</Text>
                <Menu
                  mode="inline"
                  selectedKeys={[variableName]}
                  items={availableVariables.map((value) => ({
                    key: value,
                    label: (
                      <Space size={8}>
                        <span>{value}</span>
                        {pendingWatchVariables.includes(value) ? <Tag color="gold">needs config</Tag> : null}
                      </Space>
                    ),
                  }))}
                  onClick={({ key }) => onSelectVariable(String(key))}
                  style={{ marginTop: 12 }}
                />
              </div>
              <div className="watch-settings-content">
                {isPending ? (
                  <Alert
                    type="info"
                    showIcon
                    message="Watch needs configuration"
                    description="This variable is already in the watch list. Apply settings when you are ready."
                    style={{ marginBottom: 16 }}
                  />
                ) : null}
                <Form.Item label="View kind">
                  <Select
                    value={selectedDraft.viewKind}
                    options={viewKindOptions.map((value) => ({ label: value, value }))}
                    onChange={(value: ViewKind) => updateDraft((prev) => ({ ...prev, viewKind: value }))}
                  />
                </Form.Item>
                {supportsDepth ? (
                  <Form.Item label="Depth">
                    <InputNumber
                      min={0}
                      max={20}
                      value={selectedDraft.depth ?? undefined}
                      onChange={(value) => updateDraft((prev) => ({ ...prev, depth: value ?? null }))}
                      placeholder={`Default: ${defaultDepthLabel}`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                ) : null}
                {supportsColor ? (
                  <Form.Item label="Color">
                    <div className="watch-settings-color-row">
                      {PRESET_VIEW_COLORS.map((color) => {
                        const selectedColor = selectedDraft.viewOptions?.color ?? defaultVariableConfig.viewOptions.color;
                        const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            type="button"
                            className={`watch-settings-color-swatch${isSelected ? " is-selected" : ""}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Use color ${color}`}
                            aria-pressed={isSelected}
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                viewOptions: {
                                  ...(prev.viewOptions ?? defaultVariableConfig.viewOptions),
                                  color,
                                },
                              }))
                            }
                          />
                        );
                      })}
                    </div>
                  </Form.Item>
                ) : null}
              </div>
            </div>
          </Form>

          <div className="drawer-action-footer">
            <Space>
              <Button onClick={handleResetDraft}>Reset all</Button>
              <Button onClick={onClose}>Cancel</Button>
            </Space>
            <Button type="primary" onClick={confirmApply}>Apply changes</Button>
          </div>
        </>
      ) : null}
    </Modal>
  );
};

export default VariableConfigDrawer;
