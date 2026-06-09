import { useMemo } from "react";
import { Button, Card, Dropdown, Space, Tag, Typography } from "antd";
import { CloseOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";

import type { WatchState } from "../workspace/workspace-types";

const { Text } = Typography;

type WatchPanelProps = {
  watchState: WatchState;
};

const WatchPanel = ({ watchState }: WatchPanelProps) => {
  const watchCards = useMemo(() => watchState.watchVariables.map((variable) => ({
    variable,
    pending: watchState.pendingWatchVariables.includes(variable),
  })), [watchState.pendingWatchVariables, watchState.watchVariables]);

  return (
    <Card
      className="surface-card surface-card-subtle variable-card-large"
      title="Variables"
      extra={(
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
          <Button type="primary">
            + Add <DownOutlined />
          </Button>
        </Dropdown>
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
            )) : <Text type="secondary">No variables watched yet.</Text>}
        </div>
      </Space>
    </Card>
  );
};

export default WatchPanel;
