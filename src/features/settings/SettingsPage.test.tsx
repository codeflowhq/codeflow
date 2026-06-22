// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import SettingsPage from "./SettingsPage";
import { defaultGlobalConfig, VIEW_KIND_OPTIONS, defaultVariableConfig } from "../../configDefaults";
import type { GlobalConfig } from "../../shared/types/visualization";

const SettingsPageHarness = ({ initialConfig = defaultGlobalConfig }: { initialConfig?: GlobalConfig }) => {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(initialConfig);

  return (
    <SettingsPage
      globalConfig={globalConfig}
      setGlobalConfig={setGlobalConfig}
      variableConfigRows={[{ variable: "data", ...defaultVariableConfig }]}
      configTableColumns={[]}
      viewKindOptions={VIEW_KIND_OPTIONS}
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

  it("renders two independent depth cards", () => {
    render(<SettingsPageHarness />);

    expect(screen.getAllByText("Structure expansion depth").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Default open depth").length).toBeGreaterThan(0);
    expect(screen.getByText("Example: variable -> item -> value")).toBeTruthy();
    expect(screen.getByText("data")).toBeTruthy();
    expect(screen.queryByText("Auto view depth limit")).toBeNull();
  });

  it("updates nested structure depth independently", () => {
    render(<SettingsPageHarness />);

    const nestedDepthInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(nestedDepthInputs[3], { target: { value: "6" } });

    const values = screen.getAllByRole("spinbutton").map((input) => (input as HTMLInputElement).value);
    expect(values).toEqual(expect.arrayContaining(["6", "-1"]));
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
    expect(screen.getByDisplayValue("2")).toBeTruthy();
  });
});
