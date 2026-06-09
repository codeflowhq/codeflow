import type { ReactNode } from "react";

import FeatureBoundary from "../shared/ui/FeatureBoundary";

type PageBoundaryProps = {
  children: ReactNode;
  title: string;
};

const PageBoundary = ({ children, title }: PageBoundaryProps) => (
  <FeatureBoundary title={title} fallbackTitle={title} actionLabel="Reload page" onAction={() => window.location.reload()}>
    {children}
  </FeatureBoundary>
);

export default PageBoundary;
