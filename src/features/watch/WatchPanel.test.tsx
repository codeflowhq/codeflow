// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import WatchPanel from "./WatchPanel";
import type { WatchState } from "../workspace/workspace-types";

const buildWatchState = (overrides: Partial<WatchState> = {}): WatchState => ({
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
  it("selects a watched variable card on keyboard activation", () => {
    const watchState = buildWatchState();
    render(<WatchPanel watchState={watchState} />);

    const tag = screen.getByLabelText("Select watched variable queue");
    fireEvent.keyDown(tag, { key: "Enter" });

    expect(watchState.setSelectedVariable).toHaveBeenCalledWith("queue");
  });

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

  it("does not show detected variables detail when picking mode is on", () => {
    const watchState = buildWatchState({
      selectionLocked: true,
    });
    render(<WatchPanel watchState={watchState} />);

    expect(screen.getByText("Watch list")).toBeTruthy();
    expect(screen.queryByText("Detected variables")).toBeNull();
  });
});
