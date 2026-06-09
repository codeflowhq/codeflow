import { Component } from "react";
import type { ReactNode } from "react";

import { normalizeUnexpectedAppError } from "../../runtime/runtime-errors";
import ErrorState from "./ErrorState";

type FeatureBoundaryProps = {
  children: ReactNode;
  title: string;
  fallbackTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  onError?: (title: string, content: string) => void;
};

type FeatureBoundaryState = {
  message: string | null;
};

class FeatureBoundary extends Component<FeatureBoundaryProps, FeatureBoundaryState> {
  state: FeatureBoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): FeatureBoundaryState {
    return { message: normalizeUnexpectedAppError(error) };
  }

  componentDidCatch(error: unknown): void {
    const message = normalizeUnexpectedAppError(error);
    this.props.onError?.(this.props.title, message);
  }

  private handleRetry = () => {
    this.setState({ message: null });
    this.props.onAction?.();
  };

  render() {
    if (this.state.message) {
      return (
        <ErrorState
          title={this.props.fallbackTitle ?? this.props.title}
          message={this.state.message}
          actionLabel={this.props.actionLabel}
          onAction={this.props.onAction ? this.handleRetry : undefined}
        />
      );
    }
    return this.props.children;
  }
}

export default FeatureBoundary;
