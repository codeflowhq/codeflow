import { Button, Card, Form, Input, InputNumber, Select, Space, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { buildTypeDefaultRows, updateTypeViewDefault } from "./config-sections";
import type { GlobalConfig, VariableConfig, ViewKind } from "../../shared/types/visualization";

type VariableConfigRow = VariableConfig & { variable: string };
type TypeDefaultRow = {
  key: string;
  label: string;
  viewKind: ViewKind | "auto";
  viewKindOptions: Array<ViewKind | "auto">;
};

type DetailCardConfig = {
  key: "maxItemsPerView" | "maxDepth";
  label: string;
  meaning: string;
  min: number;
  max: number;
};

const DETAIL_CARD_CONFIGS: DetailCardConfig[] = [
  {
    key: "maxItemsPerView",
    label: "Max visible items per variable",
    meaning: "Example: data shows item 1, item 2, and more.",
    min: 1,
    max: 200,
  },
  {
    key: "maxDepth",
    label: "Structure expansion depth",
    meaning: "Example: variable -> item -> value",
    min: 1,
    max: 20,
  },
];


type SettingsPageProps = {
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  variableConfigRows: VariableConfigRow[];
  configTableColumns: ColumnsType<VariableConfigRow>;
  runtimeWheelFileNames: string[];
  onRuntimeWheelUpload: (files: FileList | null) => void;
  onClearRuntimeWheels: () => void;
};

const SettingsPage = ({
  globalConfig,
  setGlobalConfig,
  variableConfigRows,
  configTableColumns,
  runtimeWheelFileNames,
  onRuntimeWheelUpload,
  onClearRuntimeWheels,
}: SettingsPageProps) => {
  const typeDefaultRows = buildTypeDefaultRows(globalConfig.typeViewDefaults);
  const [activeDetailKey, setActiveDetailKey] = useState<DetailCardConfig["key"]>("maxDepth");
  const runtimeWheelInputRef = useRef<HTMLInputElement | null>(null);

  const typeDefaultColumns: ColumnsType<TypeDefaultRow> = [
    { title: "Data type", dataIndex: "label", key: "label" },
    {
      title: "Default view",
      dataIndex: "viewKind",
      key: "viewKind",
      render: (value, record) => (
        <Select
          value={value}
          options={record.viewKindOptions.map((option) => ({ label: option, value: option }))}
          style={{ width: 180 }}
          onChange={(nextValue: ViewKind | "auto") =>
            setGlobalConfig((prev) => updateTypeViewDefault(prev, record.key, nextValue))
          }
        />
      ),
    },
  ];
  const renderSharedDetailLegend = () => (
    <div className={`depth-legend depth-legend-${activeDetailKey}`} aria-hidden="true">
      <div className="depth-legend-structure">
        <span className="depth-legend-node depth-legend-node-root">
          <span className="depth-legend-chip depth-legend-root">data</span>
          <span className="depth-legend-node-label">Variable root</span>
        </span>
        <span className="depth-legend-arrow depth-legend-arrow-root" />
        <span className="depth-legend-node depth-legend-node-structure">
          <span className="depth-legend-box depth-legend-box-outer">
            <span className="depth-legend-box-label">item</span>
            <span className="depth-legend-box depth-legend-box-middle">
              <span className="depth-legend-box-label depth-legend-box-label-middle">value</span>
              <span className="depth-legend-box depth-legend-box-inner depth-legend-box-inner-empty" />
            </span>
          </span>
          <span className="depth-legend-node-label">Structure expansion depth</span>
        </span>
        <span className="depth-legend-arrow depth-legend-arrow-items" />
        <span className="depth-legend-node depth-legend-node-items">
          <span className="depth-legend-item-stack">
            <span className="depth-legend-item-pill">item 1</span>
            <span className="depth-legend-item-pill">item 2</span>
            <span className="depth-legend-item-pill">item 3</span>
            <span className="depth-legend-item-pill depth-legend-item-pill-muted">...</span>
          </span>
          <span className="depth-legend-node-label">Max visible items per variable</span>
        </span>
      </div>
    </div>
  );

  const renderDetailCard = ({ key, label, meaning, min, max }: DetailCardConfig) => {
    const isActive = activeDetailKey === key;

    return (
      <div
        key={key}
        className={`depth-setting-card${isActive ? " is-active is-primary" : ""}`}
        onMouseEnter={() => setActiveDetailKey(key)}
        onFocusCapture={() => setActiveDetailKey(key)}
        onClick={() => setActiveDetailKey(key)}
      >
        <span className="depth-setting-card-title">{label}</span>
        {isActive ? <span className="depth-setting-card-meaning">{meaning}</span> : null}
        <InputNumber
          min={min}
          max={max}
          value={globalConfig[key]}
          onChange={(value) => setGlobalConfig((prev) => ({ ...prev, [key]: value ?? prev[key] }))}
        />
      </div>
    );
  };

  return (
    <div className="config-page-grid config-page-grid-wide">
      <Card className="surface-card" title="Run limits and default rendering">
        <div className="settings-overview-grid">
          <div className="settings-run-section">
            <span className="settings-section-title">Run</span>
            <div className="settings-control-card">
              <span className="settings-control-title">Execution step limit</span>
              <span className="settings-control-hint">How many traced steps to keep.</span>
              <InputNumber
                min={1}
                max={500}
                value={globalConfig.stepLimit}
                onChange={(value) => setGlobalConfig((prev) => ({ ...prev, stepLimit: value ?? 12 }))}
              />
            </div>
          </div>

          <div className="settings-rendering-section">
            <span className="settings-section-title">Rendering detail</span>
            <div className="settings-control-card">
              <span className="settings-control-title">Show titles</span>
              <span className="settings-control-hint">Show the variable title above each visualization.</span>
              <div className="settings-control-footer">
                <Switch
                  checked={globalConfig.showTitles}
                  checkedChildren="On"
                  unCheckedChildren="Off"
                  onChange={(value) => setGlobalConfig((prev) => ({ ...prev, showTitles: value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-limits-section">
          <span className="settings-subsection-title">Detail settings</span>
          <div className="detail-settings-layout">
            {renderSharedDetailLegend()}
            <div className="detail-settings-side">
              <div className="depth-setting-grid">
                {DETAIL_CARD_CONFIGS.map(renderDetailCard)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="surface-card settings-card-compact" title="Advanced runtime setup">
        <Form layout="vertical">
          <Form.Item label="Custom converters">
            <Input
              value={globalConfig.customConverters}
              placeholder="my_package.converters:custom_converter"
              onChange={(event) => setGlobalConfig((prev) => ({ ...prev, customConverters: event.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Runtime packages">
            <Input
              value={globalConfig.runtimePackages}
              placeholder="pillow, scipy"
              onChange={(event) => setGlobalConfig((prev) => ({ ...prev, runtimePackages: event.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Runtime wheels">
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Input
                value={globalConfig.runtimeWheels}
                placeholder="/pyodide/wheels/custom.whl, https://host/pkg.whl"
                onChange={(event) => setGlobalConfig((prev) => ({ ...prev, runtimeWheels: event.target.value }))}
              />
              <Space wrap>
                <Button onClick={() => runtimeWheelInputRef.current?.click()}>
                  Upload local wheel
                </Button>
                <input
                  ref={runtimeWheelInputRef}
                  type="file"
                  accept=".whl"
                  multiple
                  hidden
                  onChange={(event) => {
                    onRuntimeWheelUpload(event.target.files);
                    event.target.value = "";
                  }}
                />
                {runtimeWheelFileNames.length > 0 ? (
                  <Button onClick={onClearRuntimeWheels}>
                    Clear session wheels
                  </Button>
                ) : null}
              </Space>
              {runtimeWheelFileNames.length > 0 ? (
                <Space wrap>
                  {runtimeWheelFileNames.map((name) => <Tag key={name}>{name}</Tag>)}
                </Space>
              ) : null}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="surface-card" title="Default view by data type">
        <Table rowKey="key" pagination={false} dataSource={typeDefaultRows} columns={typeDefaultColumns} />
      </Card>

      <Card className="surface-card" title="Watched variable overrides">
        <Table rowKey="variable" pagination={false} dataSource={variableConfigRows} columns={configTableColumns} />
      </Card>
    </div>
  );
};

export default SettingsPage;
