import { Component } from "react";
import type { ReactNode } from "react";

import { normalizeUnexpectedAppError } from "../runtime/runtime-errors";
import ErrorState from "../shared/ui/ErrorState";

type AppErrorBoundaryProps = {
  children: ReactNode;
  onError?: (title: string, content: string) => void;
};

type AppErrorBoundaryState = {
  message: string | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return { message: normalizeUnexpectedAppError(error) };
  }

  componentDidCatch(error: unknown): void {
    const message = normalizeUnexpectedAppError(error);
    this.props.onError?.("Application error", message);
  }

  render() {
    if (this.state.message) {
      return <ErrorState title="Application error" message={this.state.message} actionLabel="Reload page" onAction={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
