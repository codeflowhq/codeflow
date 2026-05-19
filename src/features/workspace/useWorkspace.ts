import { useContext } from "react";

import { WorkspaceContext, type WorkspaceValue } from "./workspace-types";

export const useWorkspace = (): WorkspaceValue => {
  const value = useContext(WorkspaceContext);
  if (value === null) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider.");
  }
  return value;
};
