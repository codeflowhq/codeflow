import { Suspense, lazy } from "react";
import { Button, Card, Space, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";

import { TOP_MENU_LIBRARY, TOP_MENU_VISUALIZATION, VIZ_MENU_CONFIG, VIZ_MENU_MAIN } from "../features/navigation/navigationState";
import { WorkspaceProvider } from "../features/workspace/workspace-store";
import type { WorkspaceValue } from "../features/workspace/workspace-types";
import type { ConfigPageProps, LibraryPageProps } from "../features/settings/settings-store";
import type { TopMenuKey, VizMenuKey } from "../shared/types/visualization";

const WorkspacePage = lazy(() => import("../features/workspace/WorkspacePage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const CollectionsPage = lazy(() => import("../features/library/CollectionsPage"));

const { Title, Text } = Typography;

type NavigationState = {
  topMenuKey: TopMenuKey;
  vizMenuKey: VizMenuKey;
  openVisualizationConfig: () => void;
  openVisualizationMain: () => void;
};

type AppRoutesProps = {
  navigation: NavigationState;
  projectName: string;
  onRenameProject: (name: string) => void;
  workspaceValue: WorkspaceValue;
  configPageProps: ConfigPageProps;
  libraryPageProps: LibraryPageProps;
};

export const AppRoutes = ({
  navigation,
  projectName,
  onRenameProject,
  workspaceValue,
  configPageProps,
  libraryPageProps,
}: AppRoutesProps) => (
  <div className="page-copy workspace-shell">
    {navigation.topMenuKey === TOP_MENU_VISUALIZATION && navigation.vizMenuKey === VIZ_MENU_MAIN ? (
      <WorkspaceProvider value={workspaceValue}>
        <Suspense fallback={<Card className="surface-card" loading />}>
          <WorkspacePage
            projectName={projectName}
            onOpenSettings={navigation.openVisualizationConfig}
            onRenameProject={onRenameProject}
          />
        </Suspense>
      </WorkspaceProvider>
    ) : null}
    {navigation.topMenuKey === TOP_MENU_VISUALIZATION && navigation.vizMenuKey === VIZ_MENU_CONFIG ? (
      <Suspense fallback={<Card className="surface-card" loading />}>
        <div className="workspace-page-header workspace-page-header-tight">
          <Button type="link" className="workspace-breadcrumb-link" onClick={navigation.openVisualizationMain}>
            {projectName}
          </Button>
          <Text className="workspace-breadcrumb-separator">&gt;</Text>
          <Space size={10}>
            <SettingOutlined />
            <Title level={2} className="workspace-page-title workspace-page-title-inline">Settings</Title>
          </Space>
        </div>
        <SettingsPage {...configPageProps} />
      </Suspense>
    ) : null}
    {navigation.topMenuKey === TOP_MENU_LIBRARY ? (
      <Suspense fallback={<Card className="surface-card" loading />}>
        <CollectionsPage {...libraryPageProps} />
      </Suspense>
    ) : null}
  </div>
);
