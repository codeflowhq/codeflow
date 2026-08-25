// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import VariableConfigDrawer from "./VariableConfigDrawer";
import { defaultVariableConfig } from "../../../configDefaults";

afterEach(() => {
  cleanup();
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("VariableConfigDrawer", () => {
  it("explains when a variable only supports automatic scalar display", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      writable: true,
      value: ResizeObserverMock,
    });

    render(
      <VariableConfigDrawer
        open
        variableName="count"
        availableVariables={["count"]}
        variableConfig={defaultVariableConfig}
        defaultVariableConfig={defaultVariableConfig}
        defaultDepthValue={3}
        viewKindOptionsByVariable={{ count: ["auto"] }}
        onClose={vi.fn()}
        onApply={vi.fn()}
        pendingWatchVariables={[]}
        onSelectVariable={vi.fn()}
      />,
    );

    expect(await screen.findByText("Automatic display only")).toBeTruthy();
    expect(
      screen.getByText("This variable currently behaves like a simple scalar or text value, so only automatic display is available."),
    ).toBeTruthy();
  });

  it("falls back to auto when the saved view is no longer compatible with the refreshed manifest", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      writable: true,
      value: ResizeObserverMock,
    });

    render(
      <VariableConfigDrawer
        open
        variableName="data"
        availableVariables={["data"]}
        variableConfig={{ viewKind: "array_cells", depth: 2, viewOptions: { color: "#64748b" } }}
        defaultVariableConfig={defaultVariableConfig}
        defaultDepthValue={3}
        viewKindOptionsByVariable={{ data: ["auto", "table", "hash_table"] }}
        onClose={vi.fn()}
        onApply={vi.fn()}
        pendingWatchVariables={[]}
        onSelectVariable={vi.fn()}
      />,
    );

    const combobox = await screen.findByRole("combobox");
    fireEvent.mouseDown(combobox);

    expect(await screen.findByRole("option", { name: "auto" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "table" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "array_cells" })).toBeNull();
  });
});
