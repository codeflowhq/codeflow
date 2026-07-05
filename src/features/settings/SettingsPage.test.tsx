// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import SettingsPage from "./SettingsPage";
import { defaultGlobalConfig, defaultVariableConfig } from "../../configDefaults";
import type { GlobalConfig } from "../../shared/types/visualization";

const SettingsPageHarness = ({ initialConfig = defaultGlobalConfig }: { initialConfig?: GlobalConfig }) => {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(initialConfig);

  return (
    <SettingsPage
      globalConfig={globalConfig}
      setGlobalConfig={setGlobalConfig}
      variableConfigRows={[{ variable: "data", ...defaultVariableConfig }]}
      configTableColumns={[]}
      runtimeWheelFileNames={[]}
      onRuntimeWheelUpload={vi.fn()}
      onClearRuntimeWheels={vi.fn()}
    />
  );
};

describe("SettingsPage depth settings", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders the simplified depth settings", () => {
    render(<SettingsPageHarness />);

    expect(screen.getAllByText("Structure expansion depth").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Variable root").length).toBeGreaterThan(0);
    expect(screen.getByText("Example: variable -> item -> value")).toBeTruthy();
    expect(screen.getByText("data")).toBeTruthy();
    expect(screen.queryByText("Default open depth")).toBeNull();
  });

  it("updates nested structure depth independently", () => {
    render(<SettingsPageHarness />);

    const nestedDepthInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(nestedDepthInputs[2], { target: { value: "6" } });

    const values = screen.getAllByRole("spinbutton").map((input) => (input as HTMLInputElement).value);
    expect(values).toEqual(expect.arrayContaining(["6"]));
    expect(values.filter((value) => value === "6").length).toBe(1);
  });

  it("keeps imported depth values visible without preset mapping", () => {
    render(
      <SettingsPageHarness
        initialConfig={{
          ...defaultGlobalConfig,
          maxDepth: 4,
          recursionDepthDefault: 2,
        }}
      />,
    );

    expect(screen.getByDisplayValue("4")).toBeTruthy();
    expect(screen.queryByDisplayValue("2")).toBeNull();
  });
});
