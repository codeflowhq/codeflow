import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SettingOutlined } from "@ant-design/icons";

import {
  VIEW_KIND_OPTIONS,
  defaultVariableConfig,
} from "../../configDefaults";
import { buildVariableConfigRows } from "./config-sections";
import type { CollectionRecord, ExampleRecord, GlobalConfig, VariableConfig, ViewKind } from "../../shared/types/visualization";

type VariableConfigRow = VariableConfig & { variable: string };

type LibraryState = {
  activeProjectName: string;
  activeProjectDescription: string;
  activeProjectLabels: string[];
  collections: CollectionRecord[];
  handleLoadCollection: (record: CollectionRecord) => Promise<void>;
  handleDeleteCollection: (record: CollectionRecord) => Promise<void>;
  handleLoadExample: (example: ExampleRecord) => Promise<void>;
  setActiveProjectName: Dispatch<SetStateAction<string>>;
  setActiveProjectDescription: Dispatch<SetStateAction<string>>;
  setActiveProjectLabels: Dispatch<SetStateAction<string[]>>;
};

export type ConfigPageProps = {
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  variableConfigRows: VariableConfigRow[];
  configTableColumns: ColumnsType<VariableConfigRow>;
  viewKindOptions: ViewKind[];
};

export type LibraryPageProps = {
  collections: CollectionRecord[];
  examples: ExampleRecord[];
  onDeleteCollection: (record: CollectionRecord) => Promise<void>;
  onLoadCollection: (record: CollectionRecord) => Promise<void>;
  onLoadExample: (example: ExampleRecord) => Promise<void>;
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
            <Tag>{`color: ${record.viewOptions.color}`}</Tag>
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
    globalConfig,
    setGlobalConfig,
    variableConfigRows,
    configTableColumns,
    viewKindOptions: VIEW_KIND_OPTIONS,
  }), [configTableColumns, globalConfig, setGlobalConfig, variableConfigRows]);

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
