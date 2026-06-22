import type { ExampleRecord, VariableConfig, ViewKind } from "../shared/types/visualization";

export const defaultSnippet = `data = [7, 3, 1]
for i in range(len(data)):
    for j in range(len(data) - i - 1):
        if data[j] > data[j + 1]:
            data[j], data[j + 1] = data[j + 1], data[j]
`;

const arrayCellsSnippet = `data = [4, 1, 7, 2]
data[1] = 9
data.append(5)
data.pop(0)
`;

const color = "#64748b";
const variable = (viewKind: ViewKind, depth: number | null): Record<string, VariableConfig> => ({
  data: { viewKind, depth, viewOptions: { color } },
});

export const EXAMPLE_LIBRARY: ExampleRecord[] = [
  {
    key: "bubble-sort-steps",
    title: "Bubble Sort Trace",
    description: "Classic bubble sort trace over an array view.",
    snippet: defaultSnippet,
    watchVariables: ["data", "i", "j"],
    variableConfigs: variable("array_cells", 2),
    tags: ["algorithm", "sorting", "array"],
  },
  {
    key: "bfs-queue",
    title: "BFS Queue",
    description: "Queue evolution for breadth-first search.",
    snippet: `from collections import deque
graph = {"A": ["B", "C"], "B": ["D"], "C": ["E"], "D": [], "E": []}
queue = deque(["A"])
visited = []
while queue:
    node = queue.popleft()
    visited.append(node)
    for nxt in graph[node]:
        queue.append(nxt)
`,
    watchVariables: ["queue", "visited", "node"],
    variableConfigs: {
      queue: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      node: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["algorithm", "graph", "queue"],
  },
  {
    key: "nested-dict-list",
    title: "Nested Dict / List",
    description: "Deeply nested payload to exercise recursive outer-node rendering.",
    snippet: `data = {
  "users": [
    {"id": 1, "tags": ["a", "b"]},
    {"id": 2, "tags": ["c", "d"]},
  ],
  "meta": {"page": 1, "total": 2},
}
data["users"][1]["tags"][0] = "z"
`,
    watchVariables: ["data"],
    variableConfigs: variable("table", 3),
    tags: ["nested", "dict", "list"],
  },
  {
    key: "nested-graph-structure",
    title: "Nested Graph Mapping",
    description: "Graph mapping with nested node payloads and labeled edges.",
    snippet: `data = {
  "nodes": [
    {"id": "A", "label": {"name": "Alpha", "weight": 3}},
    {"id": "B", "label": {"name": "Beta", "weight": 5}},
    {"id": "C", "label": {"name": "Gamma", "weight": 8}},
  ],
  "edges": [
    {"source": "A", "target": "B", "label": "ab"},
    {"source": "B", "target": "C", "label": "bc"},
  ],
  "directed": True,
}
`,
    watchVariables: ["data"],
    variableConfigs: variable("graph", 3),
    tags: ["graph", "nested"],
  },
  { key: "array-cells", title: "Array Cells", description: "Array view with simple indexed updates.", snippet: arrayCellsSnippet, watchVariables: ["data"], variableConfigs: variable("array_cells", 2), tags: ["array"] },
  { key: "bar", title: "Bar", description: "Bar view for numeric sequences.", snippet: `data = [7, 3, 5, 1, 9]\n`, watchVariables: ["data"], variableConfigs: variable("bar", 1), tags: ["bar"] },
  { key: "matrix", title: "Matrix", description: "Matrix view with aligned cells.", snippet: `data = [[2, 5, 6], [9, 0, 2], [7, 3, 1]]\nfor i in range(3):\n    data[i][i] = i + 1\n`, watchVariables: ["data"], variableConfigs: variable("matrix", 2), tags: ["matrix"] },
  { key: "table", title: "Table", description: "Table view for dict values.", snippet: `data = {\n    "name": "Alice",\n    "score": 80,\n    "passed": False,\n    "meta": {"level": 1, "track": "math"},\n}\n\ndata["score"] = 92\ndata["passed"] = True\ndata["meta"]["level"] = 2\ndata["rank"] = 3\n`, watchVariables: ["data"], variableConfigs: variable("table", 2), tags: ["table"] },
  { key: "hash-table", title: "Hash Table", description: "Hash table view with bucket chains.", snippet: `data = [[1, 2], [], [{"id": 1, "value": "a"}, {"id": 2, "value": "b"}]]\n`, watchVariables: ["data"], variableConfigs: variable("hash_table", 2), tags: ["hash table"] },
  { key: "linked-list", title: "Linked List", description: "Linked list view with insert/delete example.", snippet: `class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\ndef insert_after(node, value):\n    node.next = Node(value, node.next)\n\ndef delete_after(node):\n    if node.next is not None:\n        node.next = node.next.next\n\ndata = Node(1, Node(2, Node(3)))\ninsert_after(data, 9)\ndelete_after(data.next)\n`, watchVariables: ["data"], variableConfigs: variable("linked_list", 2), tags: ["linked list"] },
  { key: "heap-dual", title: "Heap Dual", description: "Dual heap view with array + tree.", snippet: `data = [9, 7, 6, 3, 1]\n`, watchVariables: ["data"], variableConfigs: variable("heap_dual", 2), tags: ["heap"] },
  { key: "tree", title: "Tree", description: "Tree view using nested children.", snippet: `data = {"label": "A", "children": [{"label": "B", "children": []}, {"label": "C", "children": [{"label": "D", "children": []}]}]}\n`, watchVariables: ["data"], variableConfigs: variable("tree", 3), tags: ["tree"] },
  { key: "graph", title: "Graph", description: "Graph view using node/edge mapping.", snippet: `data = {\n  "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}],\n  "edges": [{"source": "A", "target": "B", "label": "ab"}, {"source": "B", "target": "C", "label": "bc"}],\n  "directed": True,\n}\n`, watchVariables: ["data"], variableConfigs: variable("graph", 2), tags: ["graph"] },
  { key: "image", title: "Image", description: "Image view requires a browser-accessible asset path; this example is a placeholder.", snippet: `data = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'><rect width='120' height='80' fill='%23e0f2fe'/><text x='18' y='46' font-size='20' fill='%230f172a'>CodeFlow</text></svg>"\n`, watchVariables: ["data"], variableConfigs: variable("image", 1), tags: ["image", "asset required"] },
];
