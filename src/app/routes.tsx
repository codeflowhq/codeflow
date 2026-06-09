import { Suspense, lazy } from "react";
import { Button, Card, Space, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";

import { TOP_MENU_LIBRARY, TOP_MENU_VISUALIZATION, VIZ_MENU_CONFIG, VIZ_MENU_MAIN } from "../features/navigation/navigationState";
import { WorkspaceProvider } from "../features/workspace/workspace-store";
import type { WorkspaceValue } from "../features/workspace/workspace-types";
import type { ConfigPageProps, LibraryPageProps } from "../features/settings/settings-store";
import type { TopMenuKey, VizMenuKey } from "../shared/types/visualization";
import PageBoundary from "./PageBoundary";

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
  workspaceValue: WorkspaceValue;
  configPageProps: ConfigPageProps;
  libraryPageProps: LibraryPageProps;
  projectDescription: string;
  projectLabels: string[];
  availableLabels: string[];
  onUpdateProjectDetails: (name: string, description: string, labels: string[]) => void;
};

export const AppRoutes = ({
  navigation,
  projectName,
  workspaceValue,
  configPageProps,
  libraryPageProps,
  projectDescription,
  projectLabels,
  availableLabels,
  onUpdateProjectDetails,
}: AppRoutesProps) => (
  <div className="page-copy workspace-shell">
    {navigation.topMenuKey === TOP_MENU_VISUALIZATION && navigation.vizMenuKey === VIZ_MENU_MAIN ? (
      <WorkspaceProvider value={workspaceValue}>
        <PageBoundary title="The workspace failed to render.">
          <Suspense fallback={<Card className="surface-card" loading />}>
            <WorkspacePage
              projectName={projectName}
              projectDescription={projectDescription}
              projectLabels={projectLabels}
              availableLabels={availableLabels}
              onOpenSettings={navigation.openVisualizationConfig}
              onUpdateProjectDetails={onUpdateProjectDetails}
            />
          </Suspense>
        </PageBoundary>
      </WorkspaceProvider>
    ) : null}
    {navigation.topMenuKey === TOP_MENU_VISUALIZATION && navigation.vizMenuKey === VIZ_MENU_CONFIG ? (
      <PageBoundary title="The settings page failed to render.">
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
      </PageBoundary>
    ) : null}
    {navigation.topMenuKey === TOP_MENU_LIBRARY ? (
      <PageBoundary title="The collections page failed to load.">
        <Suspense fallback={<Card className="surface-card" loading />}>
          <CollectionsPage {...libraryPageProps} />
        </Suspense>
      </PageBoundary>
    ) : null}
  </div>
);
