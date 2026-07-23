import { useMemo } from "react";
import { Button, Card, Dropdown, Space, Tag, Typography } from "antd";
import { CloseOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";

import type { WatchState } from "../workspace/workspace-types";

const { Text } = Typography;

type WatchPanelProps = {
  watchState: WatchState;
  addButtonRef?: ((node: HTMLSpanElement | null) => void) | undefined;
  firstConfigButtonRef?: ((node: HTMLButtonElement | null) => void) | undefined;
  showGuideVariablePlaceholder?: boolean;
};

const WatchPanel = ({
  watchState,
  addButtonRef,
  firstConfigButtonRef,
  showGuideVariablePlaceholder = false,
}: WatchPanelProps) => {
  const watchCards = useMemo(() => watchState.watchVariables.map((variable) => ({
    variable,
    pending: watchState.pendingWatchVariables.includes(variable),
  })), [watchState.pendingWatchVariables, watchState.watchVariables]);

  return (
    <Card
      className="surface-card surface-card-subtle variable-card-large"
      title="Variables"
      extra={(
        <Space size={8}>
          {watchState.selectionLocked ? (
            <Button onClick={() => watchState.setSelectionLocked(false)}>
              Exit select mode
            </Button>
          ) : watchState.advancedSelectionOpen ? (
            <Button onClick={() => watchState.setAdvancedSelectionOpen(false)}>
              Exit advanced selection
            </Button>
          ) : (
            <Dropdown
              menu={{
                items: [
                  { key: "select", label: "Select variables" },
                  { key: "advanced", label: "Advanced selection" },
                ],
                onClick: ({ key }) => {
                  if (key === "select") {
                    watchState.setAdvancedSelectionOpen(false);
                    watchState.setSelectionLocked(true);
                    return;
                  }
                  watchState.setSelectionLocked(false);
                  watchState.setAdvancedSelectionOpen(true);
                },
              }}
              trigger={["click"]}
            >
              <span ref={addButtonRef}>
                <Button type="primary">
                  + Add <DownOutlined />
                </Button>
              </span>
            </Dropdown>
          )}
        </Space>
      )}
    >
      <Space orientation="vertical" size={18} style={{ width: "100%" }}>
        <div className="watch-card-grid">
          {watchCards.length ? watchCards.map(({ variable, pending }) => (
              <div
                key={variable}
                className="watch-card"
              >
                <div className="watch-card-main">
                  <Text strong>{variable}</Text>
                  {pending ? <Text type="secondary">Needs config</Text> : null}
                </div>
                <Space size={4}>
                  {pending ? <Tag color="orange">pending</Tag> : null}
                  <Button
                    ref={variable === watchCards[0]?.variable ? firstConfigButtonRef : undefined}
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    aria-label={`Configure ${variable}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      watchState.handleOpenVariableConfig(variable);
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    aria-label={`Remove ${variable}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      watchState.removeWatchVariable(variable);
                    }}
                  />
                </Space>
              </div>
            )) : (
              <Space orientation="vertical" size={4}>
                <Text type="secondary">No variables watched yet.</Text>
                {showGuideVariablePlaceholder ? (
                  <div className="watch-card watch-card-guide-placeholder" aria-hidden="true">
                    <div className="watch-card-main">
                      <Text strong>example</Text>
                      <Text type="secondary">Guide preview</Text>
                    </div>
                    <Space size={4}>
                      <Button ref={firstConfigButtonRef} type="text" size="small" icon={<SettingOutlined />} />
                    </Space>
                  </div>
                ) : null}
              </Space>
            )}
        </div>
      </Space>
    </Card>
  );
};

export default WatchPanel;
