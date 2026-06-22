import { describe, expect, it } from "vitest";

import {
  extractCandidateVariables,
  getWatchExpressionRoot,
  isPythonIdentifier,
  isWatchExpression,
  parseWatchInput,
  serializeWatchVariables,
} from "./watch-expressions";

describe("parseWatchInput", () => {
  it("trims entries and keeps only valid watch expressions", () => {
    expect(parseWatchInput(" data, queue.next, 1bad, print, data[0], ")).toEqual([
      "data",
      "queue.next",
      "data[0]",
    ]);
  });
});

describe("serializeWatchVariables", () => {
  it("joins variables with a stable separator", () => {
    expect(serializeWatchVariables(["data", "queue.next", "data[0]"])).toBe("data, queue.next, data[0]");
  });
});

describe("isPythonIdentifier", () => {
  it("accepts valid identifiers and rejects keywords and builtins", () => {
    expect(isPythonIdentifier("node_1")).toBe(true);
    expect(isPythonIdentifier("for")).toBe(false);
    expect(isPythonIdentifier("print")).toBe(false);
    expect(isPythonIdentifier("1node")).toBe(false);
  });
});

describe("getWatchExpressionRoot", () => {
  it("extracts the root identifier from plain and nested expressions", () => {
    expect(getWatchExpressionRoot("data")).toBe("data");
    expect(getWatchExpressionRoot(" queue.next[0] ")).toBe("queue");
    expect(getWatchExpressionRoot("1bad")).toBeNull();
  });
});

describe("isWatchExpression", () => {
  it("accepts plain variables, attribute access, and indexed access", () => {
    expect(isWatchExpression("data")).toBe(true);
    expect(isWatchExpression("queue.next.value")).toBe(true);
    expect(isWatchExpression("data[0]")).toBe(true);
    expect(isWatchExpression("records['name']")).toBe(true);
  });

  it("rejects empty, malformed, and invalid-root expressions", () => {
    expect(isWatchExpression("")).toBe(false);
    expect(isWatchExpression("data[0")).toBe(false);
    expect(isWatchExpression("data..next")).toBe(false);
    expect(isWatchExpression("print.items")).toBe(false);
    expect(isWatchExpression("1data")).toBe(false);
  });
});

describe("extractCandidateVariables", () => {
  it("extracts identifiers from assignments, loops, with bindings, and mutations", () => {
    const source = `
message = "queue should stay inside strings"
# ignored = 1
data = []
queue = []
for item, idx in enumerate(data):
    queue.append(item)
with open("demo.txt") as handle:
    visited = set()
`;

    expect(extractCandidateVariables(source)).toEqual([
      "data",
      "message",
      "queue",
      "visited",
      "handle",
      "item",
      "idx",
    ]);
  });

  it("ignores identifiers that only appear inside strings or comments", () => {
    const source = `
text = "alpha beta"
"""
ghost = 1
"""
# hidden = 2
result = text
`;

    expect(extractCandidateVariables(source)).toEqual(["result", "text"]);
  });

  it("caps extracted candidates at fifty names", () => {
    const source = Array.from({ length: 60 }, (_, index) => `value_${index} = ${index}`).join("\n");

    const variables = extractCandidateVariables(source);

    expect(variables).toHaveLength(50);
    expect(new Set(variables).size).toBe(50);
    expect(variables).toContain("value_0");
    expect(variables).toContain("value_10");
    expect(variables).not.toContain("missing_value");
  });
});
