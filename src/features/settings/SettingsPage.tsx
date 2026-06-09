import { Card, Form, Input, InputNumber, Select, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dispatch, SetStateAction } from "react";

import { buildTypeDefaultRows, updateTypeViewDefault } from "./config-sections";
import type { GlobalConfig, VariableConfig, ViewKind } from "../../shared/types/visualization";

const { Paragraph, Text } = Typography;

type DetailLevel = "simple" | "balanced" | "deep";

const DETAIL_LEVEL_PRESETS: Record<Exclude<DetailLevel, "custom">, Pick<GlobalConfig, "maxDepth" | "recursionDepthDefault" | "autoRecursionDepthCap">> = {
  simple: { maxDepth: 1, recursionDepthDefault: 1, autoRecursionDepthCap: 2 },
  balanced: { maxDepth: 3, recursionDepthDefault: -1, autoRecursionDepthCap: 6 },
  deep: { maxDepth: 5, recursionDepthDefault: 4, autoRecursionDepthCap: 10 },
};

const DETAIL_LEVEL_COPY: Record<DetailLevel, { title: string; description: string }> = {
  simple: {
    title: "Simple",
    description: "Keep nested data shallow and compact.",
  },
  balanced: {
    title: "Balanced",
    description: "Show the usual amount of nested detail.",
  },
  deep: {
    title: "Deep",
    description: "Expand nested data more aggressively.",
  },
};

const CUSTOM_DETAIL_LEVEL_COPY = {
  title: "Custom",
  description: "Advanced depth values were imported or adjusted manually.",
};

const DETAIL_LEVEL_NODES: Record<DetailLevel, number[]> = {
  simple: [1],
  balanced: [1, 2, 3],
  deep: [1, 2, 3, 4, 5],
};

const getDetailLevel = (config: GlobalConfig): DetailLevel | null => {
  for (const [level, preset] of Object.entries(DETAIL_LEVEL_PRESETS) as Array<[DetailLevel, (typeof DETAIL_LEVEL_PRESETS)[DetailLevel]]>) {
    if (
      config.maxDepth === preset.maxDepth &&
      config.recursionDepthDefault === preset.recursionDepthDefault &&
      config.autoRecursionDepthCap === preset.autoRecursionDepthCap
    ) {
      return level;
    }
  }
  return null;
};

const applyDetailLevelPreset = (previous: GlobalConfig, level: DetailLevel): GlobalConfig => ({
  ...previous,
  ...DETAIL_LEVEL_PRESETS[level],
});

const booleanOptions = [
  { label: "Hidden", value: false },
  { label: "Visible", value: true },
];

type VariableConfigRow = VariableConfig & { variable: string };
type TypeDefaultRow = {
  key: string;
  label: string;
  viewKind: ViewKind | "auto";
};

type SettingsPageProps = {
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  variableConfigRows: VariableConfigRow[];
  configTableColumns: ColumnsType<VariableConfigRow>;
  viewKindOptions: ViewKind[];
};

const SettingsPage = ({
  globalConfig,
  setGlobalConfig,
  variableConfigRows,
  configTableColumns,
  viewKindOptions,
}: SettingsPageProps) => {
  const typeDefaultRows = buildTypeDefaultRows(globalConfig.typeViewDefaults);
  const detailLevel = getDetailLevel(globalConfig);

  const typeDefaultColumns: ColumnsType<TypeDefaultRow> = [
    { title: "Data type", dataIndex: "label", key: "label" },
    {
      title: "Default view",
      dataIndex: "viewKind",
      key: "viewKind",
      render: (value, record) => (
        <Select
          value={value}
          options={viewKindOptions.map((option) => ({ label: option, value: option }))}
          style={{ width: 180 }}
          onChange={(nextValue: ViewKind | "auto") =>
            setGlobalConfig((prev) => updateTypeViewDefault(prev, record.key, nextValue))
          }
        />
      ),
    },
  ];

  const renderDetailLevelCard = (level: DetailLevel) => (
    <button
      key={level}
      type="button"
      className={`detail-level-card${detailLevel === level ? " is-active" : ""}`}
      onClick={() => setGlobalConfig((prev) => applyDetailLevelPreset(prev, level))}
    >
      <span className="detail-level-card-title">{DETAIL_LEVEL_COPY[level].title}</span>
      <span className="detail-level-card-preview" aria-hidden="true">
        {DETAIL_LEVEL_NODES[level].map((node, index) => (
          <span key={`${level}-${node}`} className="detail-level-node-group">
            {index > 0 ? <span className="detail-level-connector" /> : null}
            <span className="detail-level-node">{node}</span>
          </span>
        ))}
      </span>
      <span className="detail-level-card-description">{DETAIL_LEVEL_COPY[level].description}</span>
    </button>
  );

  const renderCustomDetailLevelCard = () => (
    <div className="detail-level-card detail-level-card-static is-active" aria-label="Custom detail level">
      <span className="detail-level-card-title">{CUSTOM_DETAIL_LEVEL_COPY.title}</span>
      <span className="detail-level-card-preview" aria-hidden="true">
        <span className="detail-level-node detail-level-node-custom">?</span>
      </span>
      <span className="detail-level-card-description">{CUSTOM_DETAIL_LEVEL_COPY.description}</span>
    </div>
  );

  return (
    <div className="config-page-grid config-page-grid-wide">
      <Card className="surface-card" title="Run limits and default rendering">
        <Paragraph type="secondary">
          These settings apply before the browser run starts. Use them to control how much execution is traced and how uncategorized values are rendered by default.
        </Paragraph>
        <Form layout="vertical" className="compact-form-grid">
          <Form.Item label="Titles">
            <Select
              value={globalConfig.showTitles}
              options={booleanOptions}
              onChange={(value: boolean) => setGlobalConfig((prev) => ({ ...prev, showTitles: value }))}
            />
          </Form.Item>
          <Form.Item label="Execution step limit">
            <InputNumber min={1} max={500} value={globalConfig.stepLimit} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, stepLimit: value ?? 12 }))} />
          </Form.Item>
          <Form.Item label="Max visible items per variable">
            <InputNumber min={1} max={200} value={globalConfig.maxItemsPerView} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, maxItemsPerView: value ?? 50 }))} />
          </Form.Item>
          <Form.Item label="Detail level">
            <div className="detail-level-grid">
              {renderDetailLevelCard("simple")}
              {renderDetailLevelCard("balanced")}
              {renderDetailLevelCard("deep")}
              {detailLevel === null ? renderCustomDetailLevelCard() : null}
            </div>
            <Text type="secondary" className="detail-level-help">
              Controls how much nested data is expanded by default.
            </Text>
          </Form.Item>
        </Form>
      </Card>

      <Card className="surface-card" title="Browser packages and converters">
        <Paragraph type="secondary">
          Use this section only when the browser runtime needs extra Python packages. Custom converters accept comma-separated Python callables in the form package.module:function_name.
        </Paragraph>
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
            <Input
              value={globalConfig.runtimeWheels}
              placeholder="/pyodide/wheels/custom.whl, https://host/pkg.whl"
              onChange={(event) => setGlobalConfig((prev) => ({ ...prev, runtimeWheels: event.target.value }))}
            />
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
