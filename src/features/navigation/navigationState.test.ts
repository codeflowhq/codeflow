import { describe, expect, it } from "vitest";

import { TOP_MENU_LIBRARY, TOP_MENU_VISUALIZATION, VIZ_MENU_CONFIG, VIZ_MENU_MAIN } from "./navigationState";

describe("navigation state constants", () => {
  it("keeps the expected top-level keys", () => {
    expect(TOP_MENU_LIBRARY).toBe("library");
    expect(TOP_MENU_VISUALIZATION).toBe("visualization");
  });

  it("keeps the expected visualization page keys", () => {
    expect(VIZ_MENU_MAIN).toBe("main");
    expect(VIZ_MENU_CONFIG).toBe("config");
  });
});
