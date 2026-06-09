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

describe("SettingsPage detail level", () => {
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

  it("applies depth presets from the detail level cards", () => {
    render(<SettingsPageHarness />);

    fireEvent.click(screen.getByRole("button", { name: /Simple.*Keep nested data shallow and compact\./ }));
    expect(screen.getByText("Controls how much nested data is expanded by default.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Deep.*Expand nested data more aggressively\./ }));
    expect(
      screen.getByRole("button", { name: /Deep.*Expand nested data more aggressively\./ }).className.includes("is-active"),
    ).toBe(true);
  });

  it("explains when imported settings do not match a preset", () => {
    render(
      <SettingsPageHarness
        initialConfig={{
          ...defaultGlobalConfig,
          maxDepth: 4,
          recursionDepthDefault: 2,
          autoRecursionDepthCap: 7,
        }}
      />,
    );

    expect(screen.getByLabelText("Custom detail level")).toBeTruthy();
    expect(screen.getByText("Advanced depth values were imported or adjusted manually.")).toBeTruthy();
  });
});
