// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import VariableConfigDrawer from "./VariableConfigDrawer";
import { defaultVariableConfig } from "../../../configDefaults";

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
});
