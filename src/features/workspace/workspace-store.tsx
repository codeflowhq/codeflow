import type { ReactNode } from "react";

import { WorkspaceContext, type WorkspaceValue } from "./workspace-types";

type WorkspaceProviderProps = {
  value: WorkspaceValue;
  children: ReactNode;
};

export const WorkspaceProvider = ({ value, children }: WorkspaceProviderProps) => (
  <WorkspaceContext.Provider value={value}>
    {children}
  </WorkspaceContext.Provider>
);
