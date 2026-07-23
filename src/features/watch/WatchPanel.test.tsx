// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import WatchPanel from "./WatchPanel";
import type { WatchState } from "../workspace/workspace-types";

const buildWatchState = (overrides: Partial<WatchState> = {}): WatchState => ({
  advancedSelectionState: { status: "idle", message: "" },
  candidateVariables: ["queue", "visited"],
  selectedVariable: "queue",
  selectionLocked: true,
  setSelectedVariable: vi.fn(),
  setSelectionLocked: vi.fn(),
  advancedSelectionOpen: false,
  setAdvancedSelectionOpen: vi.fn(),
  watchDraft: "",
  setWatchDraft: vi.fn(),
  watchVariables: ["queue"],
  pendingWatchVariables: [],
  removeWatchVariable: vi.fn(),
  handleAddWatchVariable: vi.fn(),
  handleOpenVariableConfig: vi.fn(),
  handleSubmitWatchExpression: vi.fn(),
  ...overrides,
});

afterEach(() => {
  cleanup();
});

describe("WatchPanel", () => {
  it("opens config from a watched variable card", () => {
    const watchState = buildWatchState();
    render(<WatchPanel watchState={watchState} />);

    fireEvent.click(screen.getByRole("button", { name: "Configure queue" }));

    expect(watchState.handleOpenVariableConfig).toHaveBeenCalledWith("queue");
  });

  it("removes a watched variable from its card action", () => {
    const watchState = buildWatchState();
    render(<WatchPanel watchState={watchState} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove queue" }));

    expect(watchState.removeWatchVariable).toHaveBeenCalledWith("queue");
  });

  it("only shows watched cards and no extra variable browser sections", () => {
    const watchState = buildWatchState({
      selectionLocked: true,
    });
    render(<WatchPanel watchState={watchState} />);

    expect(screen.getByText("queue")).toBeTruthy();
    expect(screen.queryByText("Watch list")).toBeNull();
    expect(screen.queryByText("Detected variables")).toBeNull();
  });

  it("shows a guide-only variable settings placeholder when requested", () => {
    const watchState = buildWatchState({
      selectionLocked: false,
      watchVariables: [],
    });
    render(<WatchPanel watchState={watchState} showGuideVariablePlaceholder />);

    expect(screen.getByText("Guide preview")).toBeTruthy();
  });

  it("does not show the guide placeholder during the normal empty state", () => {
    const watchState = buildWatchState({
      selectionLocked: false,
      watchVariables: [],
    });
    render(<WatchPanel watchState={watchState} />);

    expect(screen.queryByText("Guide preview")).toBeNull();
  });
});
