import { Card, Form, Input, InputNumber, Select, Table, Typography } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type { ColumnsType } from "antd/es/table";

import { buildTypeDefaultRows, updateTypeViewDefault } from "./config-sections";
import type { GlobalConfig, VariableConfig, ViewKind } from "../../shared/types/visualization";

const { Paragraph, Text } = Typography;

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
  projectName: string;
  setProjectName: Dispatch<SetStateAction<string>>;
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  variableConfigRows: VariableConfigRow[];
  configTableColumns: ColumnsType<VariableConfigRow>;
  outputFormatOptions: { label: string; value: string }[];
  viewKindOptions: ViewKind[];
};

const SettingsPage = ({
  projectName,
  setProjectName,
  globalConfig,
  setGlobalConfig,
  variableConfigRows,
  configTableColumns,
  outputFormatOptions,
  viewKindOptions,
}: SettingsPageProps) => {
  const typeDefaultRows = buildTypeDefaultRows(globalConfig.typeViewDefaults);

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

  return (
    <div className="config-page-grid config-page-grid-wide">
      <Card className="surface-card" title="Run limits and default rendering">
        <Paragraph type="secondary">
          These settings apply before the browser run starts. Use them to control how much execution is traced and how uncategorized values are rendered by default.
        </Paragraph>
        <Form layout="vertical" className="compact-form-grid">
          <Form.Item label="Project name">
            <Input
              value={projectName}
              placeholder="Untitled project"
              onChange={(event) => setProjectName(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Output format">
            <Select
              value={globalConfig.outputFormat}
              options={outputFormatOptions}
              onChange={(value: GlobalConfig["outputFormat"]) => setGlobalConfig((prev) => ({ ...prev, outputFormat: value }))}
            />
          </Form.Item>
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
          <Form.Item label="Nested view depth cap">
            <InputNumber min={0} max={20} value={globalConfig.maxDepth} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, maxDepth: value ?? 3 }))} />
          </Form.Item>
          <Form.Item label="Default recursion depth">
            <InputNumber min={-1} max={20} value={globalConfig.recursionDepthDefault} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, recursionDepthDefault: value ?? -1 }))} />
          </Form.Item>
          <Form.Item label="Automatic depth cap">
            <InputNumber min={0} max={20} value={globalConfig.autoRecursionDepthCap} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, autoRecursionDepthCap: value ?? 6 }))} />
          </Form.Item>
          <Form.Item label="Max visible items per view">
            <InputNumber min={1} max={200} value={globalConfig.maxItemsPerView} onChange={(value) => setGlobalConfig((prev) => ({ ...prev, maxItemsPerView: value ?? 50 }))} />
          </Form.Item>
        </Form>
      </Card>

      <Card className="surface-card" title="Browser packages and converters">
        <Paragraph type="secondary">
          Use this section only when the browser runtime needs extra Python packages. Custom converters accept comma-separated Python callables in the form <Text code>package.module:function_name</Text>.
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
