import { useMemo } from "react";
import type { KeyboardEvent } from "react";
import { Button, Card, Dropdown, Space, Tag, Typography } from "antd";
import { CloseOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";

import type { WatchState } from "../workspace/workspace-types";

const { Text } = Typography;

const handleKeyboardActivate = (event: KeyboardEvent, callback: () => void) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
};

type WatchPanelProps = {
  watchState: WatchState;
};

const WatchPanel = ({ watchState }: WatchPanelProps) => {
  const watchCards = useMemo(() => watchState.watchVariables.map((variable) => ({
    variable,
    pending: watchState.pendingWatchVariables.includes(variable),
    selected: watchState.selectedVariable === variable,
  })), [watchState.pendingWatchVariables, watchState.selectedVariable, watchState.watchVariables]);

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
        <div className="variables-list-section compact-variables-section">
          <Text strong>Watch list</Text>
          <div className="watch-card-grid" style={{ marginTop: 10 }}>
            {watchCards.length ? watchCards.map(({ variable, pending, selected }) => (
              <div
                key={variable}
                className={`watch-card ${selected ? "watch-card-selected" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Select watched variable ${variable}`}
                onClick={() => watchState.setSelectedVariable(variable)}
                onKeyDown={(event) => handleKeyboardActivate(event, () => watchState.setSelectedVariable(variable))}
              >
                <div className="watch-card-main">
                  <Text strong>{variable}</Text>
                  <Text type="secondary">{pending ? "Needs config" : "Ready"}</Text>
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
        </div>

        {watchState.selectionLocked ? <Text type="secondary">Picking mode is active. Click identifiers in the code editor to add them here.</Text> : null}
      </Space>
    </Card>
  );
};

export default WatchPanel;
