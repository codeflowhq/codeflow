import { describe, expect, it } from "vitest";

import { findLockableIdentifiers } from "./editor-decorations";

describe("findLockableIdentifiers", () => {
  it("returns matching python identifiers with monaco-style columns", () => {
    const identifiers = findLockableIdentifiers("data = value_1 + _temp", () => true);

    expect(identifiers).toEqual([
      { word: "data", startColumn: 1, endColumn: 5 },
      { word: "value_1", startColumn: 8, endColumn: 15 },
      { word: "_temp", startColumn: 18, endColumn: 23 },
    ]);
  });

  it("filters out non-selectable words", () => {
    const identifiers = findLockableIdentifiers("for item in range(data)", (word) => word !== "for" && word !== "in" && word !== "range");

    expect(identifiers).toEqual([
      { word: "item", startColumn: 5, endColumn: 9 },
      { word: "data", startColumn: 19, endColumn: 23 },
    ]);
  });
});
