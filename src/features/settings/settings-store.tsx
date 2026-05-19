import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SettingOutlined } from "@ant-design/icons";

import {
  OUTPUT_FORMAT_OPTIONS,
  VIEW_KIND_OPTIONS,
  defaultVariableConfig,
} from "../../configDefaults";
import { buildVariableConfigRows } from "./config-sections";
import type { CollectionRecord, ExampleRecord, GlobalConfig, VariableConfig, ViewKind } from "../../shared/types/visualization";

type VariableConfigRow = VariableConfig & { variable: string };

type LibraryState = {
  activeProjectName: string;
  collections: CollectionRecord[];
  handleLoadCollection: (record: CollectionRecord) => void;
  handleDeleteCollection: (record: CollectionRecord) => void;
  handleLoadExample: (example: ExampleRecord) => void;
  setActiveProjectName: Dispatch<SetStateAction<string>>;
};

export type ConfigPageProps = {
  projectName: string;
  setProjectName: Dispatch<SetStateAction<string>>;
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  variableConfigRows: VariableConfigRow[];
  configTableColumns: ColumnsType<VariableConfigRow>;
  outputFormatOptions: { label: string; value: string }[];
  viewKindOptions: ViewKind[];
};

export type LibraryPageProps = {
  collections: CollectionRecord[];
  examples: ExampleRecord[];
  onDeleteCollection: (record: CollectionRecord) => void;
  onLoadCollection: (record: CollectionRecord) => void;
  onLoadExample: (example: ExampleRecord) => void;
};

type UseSettingsStoreOptions = {
  manifestVariables: string[];
  variableConfigs: Record<string, VariableConfig>;
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  handleOpenVariableConfig: (variable: string) => void;
  libraryState: LibraryState;
  examples: ExampleRecord[];
};

export const useSettingsStore = ({
  manifestVariables,
  variableConfigs,
  globalConfig,
  setGlobalConfig,
  handleOpenVariableConfig,
  libraryState,
  examples,
}: UseSettingsStoreOptions) => {
  const variableConfigRows = useMemo(
    () => buildVariableConfigRows(manifestVariables, variableConfigs, defaultVariableConfig),
    [manifestVariables, variableConfigs],
  );

  const configTableColumns = useMemo<ColumnsType<VariableConfigRow>>(
    () => [
      { title: "Variable", dataIndex: "variable", key: "variable" },
      {
        title: "Configuration",
        key: "summary",
        render: (_unused, record) => (
          <Space wrap>
            <Tag>{record.viewKind}</Tag>
            <Tag>{record.depth == null ? "depth: inherit" : `depth: ${record.depth}`}</Tag>
            <Tag>{`color: ${record.viewOptions.barColor}`}</Tag>
          </Space>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_unused, record) => (
          <Button icon={<SettingOutlined />} onClick={() => handleOpenVariableConfig(record.variable)}>
            Configure
          </Button>
        ),
      },
    ],
    [handleOpenVariableConfig],
  );

  const configPageProps = useMemo<ConfigPageProps>(() => ({
    projectName: libraryState.activeProjectName,
    setProjectName: libraryState.setActiveProjectName,
    globalConfig,
    setGlobalConfig,
    variableConfigRows,
    configTableColumns,
    outputFormatOptions: OUTPUT_FORMAT_OPTIONS,
    viewKindOptions: VIEW_KIND_OPTIONS,
  }), [configTableColumns, globalConfig, libraryState.activeProjectName, libraryState.setActiveProjectName, setGlobalConfig, variableConfigRows]);

  const libraryPageProps = useMemo<LibraryPageProps>(() => ({
    collections: libraryState.collections,
    examples,
    onDeleteCollection: libraryState.handleDeleteCollection,
    onLoadCollection: libraryState.handleLoadCollection,
    onLoadExample: libraryState.handleLoadExample,
  }), [examples, libraryState.collections, libraryState.handleDeleteCollection, libraryState.handleLoadCollection, libraryState.handleLoadExample]);

  return {
    configPageProps,
    libraryPageProps,
    variableConfigRows,
  };
};
