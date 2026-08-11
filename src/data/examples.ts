import type { ExampleRecord, VariableConfig, ViewKind } from "../shared/types/visualization";
import { PREGENERATED_EXAMPLE_MANIFESTS } from "./exampleSavedManifests";

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
  // Sorting and arrays
  {
    key: "bubble-sort-steps",
    title: "Bubble Sort Trace",
    description: "Classic bubble sort trace over an array view.",
    snippet: defaultSnippet,
    watchVariables: ["data", "i", "j"],
    savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["bubble-sort-steps"],
    variableConfigs: variable("bar", 1),
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "selection-sort-trace",
    title: "Selection Sort Trace",
    description: "Selection sort over an array with the active indices exposed.",
    snippet: `data = [29, 10, 14, 37, 13]

for i in range(len(data)):
    min_idx = i
    for j in range(i + 1, len(data)):
        if data[j] < data[min_idx]:
            min_idx = j
    data[i], data[min_idx] = data[min_idx], data[i]
`,
    watchVariables: ["data", "i", "j", "min_idx"],
    variableConfigs: variable("bar", 1),
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "insertion-sort-trace",
    title: "Insertion Sort Trace",
    description: "Insertion sort with the current key and index movements.",
    snippet: `data = [12, 11, 13, 5, 6]

for i in range(1, len(data)):
    key = data[i]
    j = i - 1
    while j >= 0 and data[j] > key:
        data[j + 1] = data[j]
        j -= 1
    data[j + 1] = key
`,
    watchVariables: ["data", "i", "j", "key"],
    variableConfigs: variable("bar", 1),
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "merge-sort-trace",
    title: "Merge Sort Trace",
    description: "Merge sort with intermediate merges captured as array updates.",
    snippet: `data = [38, 27, 43, 3, 9, 82, 10]
segments = []


def merge_sort(start, end):
    if end - start <= 1:
        return
    mid = (start + end) // 2
    merge_sort(start, mid)
    merge_sort(mid, end)

    left = data[start:mid]
    right = data[mid:end]
    i = 0
    j = 0
    k = start

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            data[k] = left[i]
            i += 1
        else:
            data[k] = right[j]
            j += 1
        k += 1

    while i < len(left):
        data[k] = left[i]
        i += 1
        k += 1

    while j < len(right):
        data[k] = right[j]
        j += 1
        k += 1

    segments.append(data[start:end])


merge_sort(0, len(data))
`,
    watchVariables: ["data", "segments"],
    variableConfigs: {
      data: { viewKind: "bar", depth: 1, viewOptions: { color } },
      segments: { viewKind: "matrix", depth: 2, viewOptions: { color } },
    },
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "quick-sort-trace",
    title: "Quick Sort Trace",
    description: "In-place quick sort with the active partition bounds exposed.",
    snippet: `data = [33, 10, 55, 26, 64, 18]
low = 0
high = len(data) - 1
pivot = None
i = None
j = None


def partition(left, right):
    global pivot, i, j
    pivot = data[right]
    i = left - 1
    for j in range(left, right):
        if data[j] <= pivot:
            i += 1
            data[i], data[j] = data[j], data[i]
    data[i + 1], data[right] = data[right], data[i + 1]
    return i + 1


def quick_sort(left, right):
    global low, high
    if left >= right:
        return
    low = left
    high = right
    pivot_index = partition(left, right)
    quick_sort(left, pivot_index - 1)
    quick_sort(pivot_index + 1, right)


quick_sort(0, len(data) - 1)
`,
    watchVariables: ["data", "low", "high", "pivot", "i", "j"],
    variableConfigs: {
      data: { viewKind: "bar", depth: 1, viewOptions: { color } },
      low: { viewKind: "auto", depth: null, viewOptions: { color } },
      high: { viewKind: "auto", depth: null, viewOptions: { color } },
      pivot: { viewKind: "auto", depth: null, viewOptions: { color } },
      i: { viewKind: "auto", depth: null, viewOptions: { color } },
      j: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "counting-sort-trace",
    title: "Counting Sort Trace",
    description: "Counting sort with explicit count and output arrays.",
    snippet: `data = [4, 2, 2, 8, 3, 3, 1]
count = [0] * 9
output = [0] * len(data)

for value in data:
    count[value] += 1

for index in range(1, len(count)):
    count[index] += count[index - 1]

for value in reversed(data):
    position = count[value] - 1
    output[position] = value
    count[value] -= 1

data = output
`,
    watchVariables: ["data", "count", "output"],
    variableConfigs: {
      data: { viewKind: "bar", depth: 1, viewOptions: { color } },
      count: { viewKind: "bar", depth: 1, viewOptions: { color } },
      output: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "radix-sort-trace",
    title: "Radix Sort Trace",
    description: "Least-significant-digit radix sort over a small integer array.",
    snippet: `data = [170, 45, 75, 90, 802, 24, 2, 66]
digit_place = 1
count = [0] * 10
output = [0] * len(data)

while digit_place <= 100:
    count = [0] * 10
    output = [0] * len(data)
    for value in data:
        digit = (value // digit_place) % 10
        count[digit] += 1
    for index in range(1, 10):
        count[index] += count[index - 1]
    for value in reversed(data):
        digit = (value // digit_place) % 10
        output[count[digit] - 1] = value
        count[digit] -= 1
    data = output[:]
    digit_place *= 10
`,
    watchVariables: ["data", "digit_place", "count", "output"],
    variableConfigs: {
      data: { viewKind: "bar", depth: 1, viewOptions: { color } },
      digit_place: { viewKind: "auto", depth: null, viewOptions: { color } },
      count: { viewKind: "bar", depth: 1, viewOptions: { color } },
      output: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "binary-search-trace",
    title: "Binary Search Trace",
    description: "Classic binary search over a sorted array with moving bounds.",
    snippet: `data = [3, 7, 11, 18, 24, 31, 42]
target = 24
low = 0
high = len(data) - 1
mid = None
found_index = None

while low <= high:
    mid = (low + high) // 2
    if data[mid] == target:
        found_index = mid
        break
    if data[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
`,
    watchVariables: ["data", "target", "low", "mid", "high", "found_index"],
    variableConfigs: {
      data: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      target: { viewKind: "auto", depth: null, viewOptions: { color } },
      low: { viewKind: "auto", depth: null, viewOptions: { color } },
      mid: { viewKind: "auto", depth: null, viewOptions: { color } },
      high: { viewKind: "auto", depth: null, viewOptions: { color } },
      found_index: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["algorithm", "search", "array", "curriculum"],
  },
  {
    key: "array-operations-trace",
    title: "Array Operations Trace",
    description: "Basic array insert, update, delete, and search-style operations.",
    snippet: `data = [12, 18, 24, 30]
log = []
target = 24
found_index = None

data.insert(1, 15)
log.append("insert 15 at index 1")

data[3] = 21
log.append("update index 3 to 21")

if target in data:
    found_index = data.index(target)
    log.append(f"found {target} at index {found_index}")

removed = data.pop(0)
log.append(f"remove front value {removed}")
`,
    watchVariables: ["data", "log", "target", "found_index"],
    variableConfigs: {
      data: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      log: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      target: { viewKind: "auto", depth: null, viewOptions: { color } },
      found_index: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["array", "data structure", "curriculum"],
  },
  { key: "array-cells", title: "Array Cells", description: "Array view with simple indexed updates.", snippet: arrayCellsSnippet, watchVariables: ["data"], variableConfigs: variable("array_cells", 2), tags: ["array", "data structure", "intro"] },
  { key: "bar", title: "Bar", description: "Bar view for numeric sequences.", snippet: `data = [7, 3, 5, 1, 9]\n`, watchVariables: ["data"], variableConfigs: variable("bar", 1), tags: ["array", "bar", "intro"] },
  { key: "matrix", title: "Matrix", description: "Matrix view with aligned cells.", snippet: `data = [[2, 5, 6], [9, 0, 2], [7, 3, 1]]\nfor i in range(3):\n    data[i][i] = i + 1\n`, watchVariables: ["data"], variableConfigs: variable("matrix", 2), tags: ["matrix", "array", "intro"] },

  // Linear structures and maps
  { key: "linked-list", title: "Linked List", description: "Linked list view with insert/delete example.", snippet: `class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\ndef insert_after(node, value):\n    node.next = Node(value, node.next)\n\ndef delete_after(node):\n    if node.next is not None:\n        node.next = node.next.next\n\ndata = Node(1, Node(2, Node(3)))\ninsert_after(data, 9)\ndelete_after(data.next)\n`, watchVariables: ["data"], savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["linked-list"], variableConfigs: variable("linked_list", 2), tags: ["linked list", "linear structure", "data structure", "curriculum"] },
  { key: "hash-table", title: "Hash Table", description: "Hash table view with bucket chains.", snippet: `data = [[("ab", 1), ("ba", 3)], [], [("cab", 2)]]\ndata[2].append(("dab", 4))\n`, watchVariables: ["data"], savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["hash-table"], variableConfigs: variable("hash_table", 2), tags: ["hash table", "map", "data structure", "curriculum"] },
  {
    key: "linear-probing-hash-table",
    title: "Linear Probing Hash Table",
    description: "Open-addressing insertion trace with a compact probe log.",
    snippet: `table = [None] * 7
probes = []


def insert(key):
    index = key % len(table)
    start = index
    while table[index] is not None:
        probes.append(f"{key}->{index}")
        index = (index + 1) % len(table)
        if index == start:
            return
    probes.append(f"{key}->{index}")
    table[index] = key


for key in [10, 17, 24, 31]:
    insert(key)
`,
    watchVariables: ["table", "probes"],
    variableConfigs: {
      table: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      probes: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["hash table", "map", "array", "curriculum"],
  },
  {
    key: "quadratic-probing-hash-table",
    title: "Quadratic Probing Hash Table",
    description: "Open-addressing insertion with a quadratic probe sequence.",
    snippet: `table = [None] * 11
probes = []


def insert(key):
    home = key % len(table)
    step = 0
    while step < len(table):
        index = (home + step * step) % len(table)
        probes.append(f"{key}->{index}")
        if table[index] is None:
            table[index] = key
            return
        step += 1


for key in [22, 1, 13, 11, 24, 33]:
    insert(key)
`,
    watchVariables: ["table", "probes"],
    variableConfigs: {
      table: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      probes: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["hash table", "map", "array", "curriculum"],
  },
  { key: "table", title: "Table", description: "Table view for dict values.", snippet: `data = {\n    "name": "Alice",\n    "score": 80,\n    "passed": False,\n    "meta": {"level": 1, "track": "math"},\n}\n\ndata["score"] = 92\ndata["passed"] = True\ndata["meta"]["level"] = 2\ndata["rank"] = 3\n`, watchVariables: ["data"], variableConfigs: variable("table", 2), tags: ["table", "dict", "map", "intro"] },
  {
    key: "bfs-queue",
    title: "BFS Queue",
    description: "Queue evolution for breadth-first search.",
    snippet: `graph = {"A": ["B", "C"], "B": ["D"], "C": ["E"], "D": [], "E": []}
queue = ["A"]
visited = []
while queue:
    node = queue.pop(0)
    visited.append(node)
    for nxt in graph[node]:
        queue.append(nxt)
`,
    watchVariables: ["queue", "visited", "node"],
    savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["bfs-queue"],
    variableConfigs: {
      queue: { viewKind: "auto", depth: null, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      node: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["algorithm", "graph", "queue", "traversal", "curriculum"],
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
    savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["nested-dict-list"],
    variableConfigs: variable("table", 3),
    tags: ["nested", "dict", "list", "intro"],
  },

  // Trees and range structures
  { key: "heap-dual", title: "Heap Dual", description: "Dual heap view with array + tree.", snippet: `data = [9, 7, 6, 3, 1]\n`, watchVariables: ["data"], variableConfigs: variable("heap_dual", 2), tags: ["heap"] },
  {
    key: "heap-insert-trace",
    title: "Heap Insert Trace",
    description: "Shows a max-heap growing as new values bubble upward.",
    snippet: `data = [40, 18, 33, 12, 9]
inserted = []


def push(value):
    data.append(value)
    inserted.append(value)
    index = len(data) - 1
    while index > 0:
        parent = (index - 1) // 2
        if data[parent] >= data[index]:
            break
        data[parent], data[index] = data[index], data[parent]
        index = parent


for value in [27, 45]:
    push(value)
`,
    watchVariables: ["data", "inserted"],
    variableConfigs: {
      data: { viewKind: "heap_dual", depth: 2, viewOptions: { color } },
      inserted: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["heap", "tree", "data structure", "curriculum"],
  },
  {
    key: "heap-extract-trace",
    title: "Heap Extract Trace",
    description: "Shows repeated max extraction from a binary heap.",
    snippet: `data = [50, 32, 41, 18, 12, 27]
removed = []


def pop_max():
    if not data:
        return
    removed.append(data[0])
    last = data.pop()
    if not data:
        return
    data[0] = last
    index = 0
    while True:
        left = index * 2 + 1
        right = index * 2 + 2
        largest = index
        if left < len(data) and data[left] > data[largest]:
            largest = left
        if right < len(data) and data[right] > data[largest]:
            largest = right
        if largest == index:
            break
        data[index], data[largest] = data[largest], data[index]
        index = largest


pop_max()
pop_max()
`,
    watchVariables: ["data", "removed"],
    variableConfigs: {
      data: { viewKind: "heap_dual", depth: 2, viewOptions: { color } },
      removed: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["heap", "tree", "data structure", "curriculum"],
  },
  { key: "tree", title: "Tree", description: "Tree view using nested children.", snippet: `data = {"label": "A", "children": [{"label": "B", "children": []}, {"label": "C", "children": [{"label": "D", "children": []}]}]}\n`, watchVariables: ["data"], savedManifest: PREGENERATED_EXAMPLE_MANIFESTS.tree, variableConfigs: variable("tree", 3), tags: ["tree", "data structure", "intro"] },
  {
    key: "bitmask-builder",
    title: "Bitmask Builder",
    description: "Builds a bitmask step by step and records the selected positions.",
    snippet: `mask = 0
data = {"mask": 0, "selected": []}

for bit in [0, 2, 4]:
    mask |= 1 << bit
    data["mask"] = mask
    data["selected"] = [index for index in range(5) if (mask >> index) & 1]
`,
    watchVariables: ["data"],
    variableConfigs: variable("table", 2),
    tags: ["algorithm", "bitmask", "table", "curriculum"],
  },
  {
    key: "bst-insert-trace",
    title: "BST Insert Trace",
    description: "Shows a binary search tree growing through successive insert-style states.",
    snippet: `steps = [
    {"label": "7", "children": []},
    {"label": "7", "children": [{"label": "3", "children": []}]},
    {"label": "7", "children": [{"label": "3", "children": []}, {"label": "9", "children": []}]},
    {
        "label": "7",
        "children": [
            {"label": "3", "children": [{"label": "1", "children": []}]},
            {"label": "9", "children": []},
        ],
    },
    {
        "label": "7",
        "children": [
            {"label": "3", "children": [{"label": "1", "children": []}, {"label": "5", "children": []}]},
            {"label": "9", "children": []},
        ],
    },
    {
        "label": "7",
        "children": [
            {"label": "3", "children": [{"label": "1", "children": []}, {"label": "5", "children": []}]},
            {"label": "9", "children": [{"label": "8", "children": []}]},
        ],
    },
    {
        "label": "7",
        "children": [
            {"label": "3", "children": [{"label": "1", "children": []}, {"label": "5", "children": []}]},
            {"label": "9", "children": [{"label": "8", "children": []}, {"label": "10", "children": []}]},
        ],
    },
]

for data in steps:
    pass
`,
    watchVariables: ["data"],
    variableConfigs: variable("tree", 3),
    tags: ["tree", "bst", "data structure", "curriculum"],
  },
  {
    key: "bst-search-trace",
    title: "BST Search Trace",
    description: "Walks a binary search tree while recording the visited path.",
    snippet: `states = [
    {
        "data": {
            "label": "8",
            "children": [
                {"label": "3", "children": [{"label": "1", "children": []}, {"label": "6", "children": [{"label": "4", "children": []}, {"label": "7", "children": []}]}]},
                {"label": "10", "children": [{"label": "9", "children": []}, {"label": "14", "children": [{"label": "13", "children": []}]}]},
            ],
        },
        "path": ["8"],
    },
    {
        "data": {
            "label": "8",
            "children": [
                {"label": "3", "children": [{"label": "1", "children": []}, {"label": "6", "children": [{"label": "4", "children": []}, {"label": "7", "children": []}]}]},
                {"label": "10", "children": [{"label": "9", "children": []}, {"label": "14", "children": [{"label": "13", "children": []}]}]},
            ],
        },
        "path": ["8", "10"],
    },
    {
        "data": {
            "label": "8",
            "children": [
                {"label": "3", "children": [{"label": "1", "children": []}, {"label": "6", "children": [{"label": "4", "children": []}, {"label": "7", "children": []}]}]},
                {"label": "10", "children": [{"label": "9", "children": []}, {"label": "14", "children": [{"label": "13", "children": []}]}]},
            ],
        },
        "path": ["8", "10", "14"],
    },
    {
        "data": {
            "label": "8",
            "children": [
                {"label": "3", "children": [{"label": "1", "children": []}, {"label": "6", "children": [{"label": "4", "children": []}, {"label": "7", "children": []}]}]},
                {"label": "10", "children": [{"label": "9", "children": []}, {"label": "14", "children": [{"label": "13", "children": []}]}]},
            ],
        },
        "path": ["8", "10", "14", "13"],
    },
]
target = 13

for state in states:
    data = state["data"]
    path = state["path"]
`,
    watchVariables: ["data", "target", "path"],
    variableConfigs: {
      data: { viewKind: "tree", depth: 4, viewOptions: { color } },
      target: { viewKind: "auto", depth: null, viewOptions: { color } },
      path: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["tree", "bst", "search", "curriculum"],
  },
  {
    key: "bst-delete-trace",
    title: "BST Delete Trace",
    description: "Shows a binary search tree before and after deleting a node with two children.",
    snippet: `states = [
    {
        "data": {
            "label": "8",
            "children": [
                {"label": "3", "children": [{"label": "1", "children": []}, {"label": "6", "children": [{"label": "4", "children": []}, {"label": "7", "children": []}]}]},
                {"label": "10", "children": [{"label": "9", "children": []}, {"label": "14", "children": [{"label": "13", "children": []}]}]},
            ],
        },
        "focus": ["3"],
    },
    {
        "data": {
            "label": "8",
            "children": [
                {"label": "4", "children": [{"label": "1", "children": []}, {"label": "6", "children": [{"label": "7", "children": []}]}]},
                {"label": "10", "children": [{"label": "9", "children": []}, {"label": "14", "children": [{"label": "13", "children": []}]}]},
            ],
        },
        "focus": ["4"],
    },
]
deleted = 3

for state in states:
    data = state["data"]
    focus = state["focus"]
`,
    watchVariables: ["data", "deleted", "focus"],
    variableConfigs: {
      data: { viewKind: "tree", depth: 4, viewOptions: { color } },
      deleted: { viewKind: "auto", depth: null, viewOptions: { color } },
      focus: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["tree", "bst", "delete", "curriculum"],
  },
  {
    key: "avl-rotation-trace",
    title: "AVL Rotation Trace",
    description: "Shows AVL balancing states, including a rotation-driven rebalance.",
    snippet: `steps = [
    {"label": "30 (1)", "children": []},
    {"label": "30 (2)", "children": [{"label": "20 (1)", "children": []}]},
    {
        "label": "20 (2)",
        "children": [
            {"label": "10 (1)", "children": []},
            {"label": "30 (1)", "children": []},
        ],
    },
    {
        "label": "20 (3)",
        "children": [
            {"label": "10 (1)", "children": []},
            {"label": "30 (2)", "children": [{"label": "25 (1)", "children": []}]},
        ],
    },
    {
        "label": "25 (3)",
        "children": [
            {"label": "20 (2)", "children": [{"label": "10 (1)", "children": []}]},
            {"label": "30 (2)", "children": [{"label": "28 (1)", "children": []}]},
        ],
    },
]

for data in steps:
    pass
`,
    watchVariables: ["data"],
    variableConfigs: variable("tree", 4),
    tags: ["tree", "avl", "rotation", "curriculum"],
  },
  {
    key: "union-find-trace",
    title: "Union-Find Trace",
    description: "Shows parent and rank updates across a few union operations.",
    snippet: `states = [
    {"parent": [0, 1, 2, 3, 4, 5], "rank": [0, 0, 0, 0, 0, 0], "groups": [0, 1, 2, 3, 4, 5]},
    {"parent": [0, 0, 2, 3, 4, 5], "rank": [1, 0, 0, 0, 0, 0], "groups": [0, 0, 2, 3, 4, 5]},
    {"parent": [0, 0, 0, 3, 4, 5], "rank": [1, 0, 0, 0, 0, 0], "groups": [0, 0, 0, 3, 4, 5]},
    {"parent": [0, 0, 0, 3, 3, 5], "rank": [1, 0, 0, 1, 0, 0], "groups": [0, 0, 0, 3, 3, 5]},
    {"parent": [0, 0, 0, 0, 3, 5], "rank": [2, 0, 0, 1, 0, 0], "groups": [0, 0, 0, 0, 0, 5]},
]

for state in states:
    parent = state["parent"]
    rank = state["rank"]
    groups = state["groups"]
`,
    watchVariables: ["parent", "rank", "groups"],
    variableConfigs: {
      parent: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      rank: { viewKind: "bar", depth: 1, viewOptions: { color } },
      groups: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["union-find", "graph", "data structure", "curriculum"],
  },
  {
    key: "fenwick-tree-trace",
    title: "Fenwick Tree Trace",
    description: "Builds a Fenwick tree and records a few prefix sums.",
    snippet: `values = [3, 2, -1, 6, 5, 4, -3, 3]
tree = [0] * (len(values) + 1)
prefix_sums = []


def add(index, delta):
    while index < len(tree):
        tree[index] += delta
        index += index & -index


def prefix_sum(index):
    total = 0
    while index > 0:
        total += tree[index]
        index -= index & -index
    return total


for index, value in enumerate(values, start=1):
    add(index, value)

for index in [1, 3, 5, 8]:
    prefix_sums.append(prefix_sum(index))
`,
    watchVariables: ["values", "tree", "prefix_sums"],
    savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["fenwick-tree-trace"],
    variableConfigs: {
      values: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      tree: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      prefix_sums: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["fenwick", "range query", "tree", "curriculum"],
  },
  {
    key: "segment-tree-trace",
    title: "Segment Tree Trace",
    description: "Builds a segment tree and then applies point updates.",
    snippet: `values = [2, 1, 5, 3, 4]
tree = [0] * (4 * len(values))


def build(node, left, right):
    if left == right:
        tree[node] = values[left]
        return
    mid = (left + right) // 2
    build(node * 2, left, mid)
    build(node * 2 + 1, mid + 1, right)
    tree[node] = max(tree[node * 2], tree[node * 2 + 1])


def update(node, left, right, index, value):
    if left == right:
        tree[node] = value
        return
    mid = (left + right) // 2
    if index <= mid:
        update(node * 2, left, mid, index, value)
    else:
        update(node * 2 + 1, mid + 1, right, index, value)
    tree[node] = max(tree[node * 2], tree[node * 2 + 1])


build(1, 0, len(values) - 1)
update(1, 0, len(values) - 1, 2, 6)
values[2] = 6
update(1, 0, len(values) - 1, 4, 7)
values[4] = 7
`,
    watchVariables: ["values", "tree"],
    savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["segment-tree-trace"],
    variableConfigs: {
      values: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      tree: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["segment tree", "range query", "tree", "curriculum"],
  },

  // Graph algorithms and traversal
  { key: "graph", title: "Graph", description: "Graph view using node/edge mapping.", snippet: `data = {\n  "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}],\n  "edges": [{"source": "A", "target": "B", "label": "ab"}, {"source": "B", "target": "C", "label": "bc"}],\n  "directed": True,\n}\n`, watchVariables: ["data"], savedManifest: PREGENERATED_EXAMPLE_MANIFESTS.graph, variableConfigs: variable("graph", 2), tags: ["graph", "data structure", "intro"] },
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
    tags: ["graph", "nested", "data structure"],
  },
  {
    key: "recursion-call-log",
    title: "Recursion Call Log",
    description: "Simple recursive Fibonacci with an explicit call/return log.",
    snippet: `call_log = []


def fib(n):
    call_log.append(f"call {n}")
    if n <= 1:
        call_log.append(f"return {n}")
        return n
    value = fib(n - 1) + fib(n - 2)
    call_log.append(f"return {n}={value}")
    return value


result = fib(4)
`,
    watchVariables: ["call_log", "result"],
    variableConfigs: {
      call_log: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      result: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["recursion", "call trace", "algorithm", "curriculum"],
  },
  {
    key: "coin-change-dp",
    title: "Coin Change DP",
    description: "Bottom-up dynamic programming trace for the minimum coin-change problem.",
    snippet: `coins = [1, 3, 4]
amount = 6
dp = [0] + [amount + 1] * amount
choices = []

for value in range(1, amount + 1):
    for coin in coins:
        if coin <= value and dp[value - coin] + 1 < dp[value]:
            dp[value] = dp[value - coin] + 1
            choices.append(f"{value}<-{coin}")
`,
    watchVariables: ["coins", "dp", "choices", "amount"],
    variableConfigs: {
      coins: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      dp: { viewKind: "bar", depth: 1, viewOptions: { color } },
      choices: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      amount: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["recursion", "dynamic programming", "algorithm", "curriculum"],
  },
  {
    key: "dfs-stack",
    title: "DFS Stack",
    description: "Depth-first search with the evolving stack and visit order.",
    snippet: `graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": [],
    "E": [],
    "F": [],
}
stack = ["A"]
visited = []
order = []

while stack:
    node = stack.pop()
    if node in visited:
        continue
    visited.append(node)
    order.append(node)
    for nxt in reversed(graph[node]):
        stack.append(nxt)
`,
    watchVariables: ["stack", "visited", "order"],
    variableConfigs: {
      stack: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      order: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "dfs", "stack", "traversal", "curriculum"],
  },
  {
    key: "topological-sort-trace",
    title: "Topological Sort Trace",
    description: "Tracks in-degrees, queue state, and output order for a DAG.",
    snippet: `graph = {
    "A": ["C"],
    "B": ["C", "D"],
    "C": ["E"],
    "D": ["F"],
    "E": ["F"],
    "F": [],
}
in_degree = {"A": 0, "B": 0, "C": 2, "D": 1, "E": 1, "F": 2}
queue = ["A", "B"]
order = []

while queue:
    node = queue.pop(0)
    order.append(node)
    for nxt in graph[node]:
        in_degree[nxt] -= 1
        if in_degree[nxt] == 0:
            queue.append(nxt)
`,
    watchVariables: ["in_degree", "queue", "order"],
    variableConfigs: {
      in_degree: { viewKind: "table", depth: 2, viewOptions: { color } },
      queue: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      order: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "traversal", "algorithm", "curriculum"],
  },
  {
    key: "connected-components-trace",
    title: "Connected Components Trace",
    description: "Builds connected components while tracking the visited set.",
    snippet: `graph = {
    "A": ["B"],
    "B": ["A", "C"],
    "C": ["B"],
    "D": ["E"],
    "E": ["D"],
    "F": [],
}
visited = []
components = []

for start in graph:
    if start in visited:
        continue
    stack = [start]
    component = []
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.append(node)
        component.append(node)
        for nxt in reversed(graph[node]):
            if nxt not in visited:
                stack.append(nxt)
    components.append(component)
`,
    watchVariables: ["visited", "components"],
    variableConfigs: {
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      components: { viewKind: "matrix", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "traversal", "algorithm", "curriculum"],
  },
  {
    key: "kruskal-mst",
    title: "Kruskal MST",
    description: "Minimum spanning tree growth over a small undirected graph.",
    snippet: `states = [
    {
        "graph_state": {"nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}], "edges": [], "directed": False},
        "chosen": [],
    },
    {
        "graph_state": {"nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}], "edges": [{"source": "A", "target": "B", "label": "1"}], "directed": False},
        "chosen": ["A-B:1"],
    },
    {
        "graph_state": {"nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}], "edges": [{"source": "A", "target": "B", "label": "1"}, {"source": "B", "target": "C", "label": "2"}], "directed": False},
        "chosen": ["A-B:1", "B-C:2"],
    },
    {
        "graph_state": {"nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}], "edges": [{"source": "A", "target": "B", "label": "1"}, {"source": "B", "target": "C", "label": "2"}, {"source": "C", "target": "D", "label": "3"}], "directed": False},
        "chosen": ["A-B:1", "B-C:2", "C-D:3"],
    },
]

for state in states:
    graph_state = state["graph_state"]
    chosen = state["chosen"]
`,
    watchVariables: ["graph_state", "chosen"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      chosen: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "mst", "kruskal", "curriculum"],
  },
  {
    key: "prim-mst",
    title: "Prim MST",
    description: "Minimum spanning tree growth from a start node using the best frontier edge.",
    snippet: `nodes = ["A", "B", "C", "D"]
edges = [
    ("A", "B", 1),
    ("A", "C", 4),
    ("B", "C", 2),
    ("B", "D", 5),
    ("C", "D", 3),
]
graph_state = {
    "nodes": [{"id": node} for node in nodes],
    "edges": [],
    "directed": False,
}
visited = {"A"}
chosen = []

while len(visited) < len(nodes):
    candidate = None
    for source, target, weight in edges:
        crosses = (source in visited) ^ (target in visited)
        if not crosses:
            continue
        if candidate is None or weight < candidate[2]:
            candidate = (source, target, weight)
    if candidate is None:
        break
    source, target, weight = candidate
    graph_state["edges"].append({"source": source, "target": target, "label": str(weight)})
    chosen.append(f"{source}-{target}:{weight}")
    visited.add(source)
    visited.add(target)
`,
    watchVariables: ["graph_state", "chosen"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      chosen: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "mst", "prim", "curriculum"],
  },
  {
    key: "dijkstra-distances",
    title: "Dijkstra Distances",
    description: "Single-source shortest paths with distance-table updates.",
    snippet: `graph = {
    "A": {"B": 4, "C": 1},
    "B": {"D": 1},
    "C": {"B": 2, "D": 5},
    "D": {},
}
dist = {node: None for node in graph}
dist["A"] = 0
visited_order = []
unvisited = set(graph)

while unvisited:
    reachable = [node for node in unvisited if dist[node] is not None]
    if not reachable:
        break
    current = min(reachable, key=lambda node: dist[node])
    unvisited.remove(current)
    visited_order.append(current)
    for nxt, weight in graph[current].items():
        next_distance = dist[current] + weight
        if dist[nxt] is None or next_distance < dist[nxt]:
            dist[nxt] = next_distance
`,
    watchVariables: ["dist", "visited_order"],
    variableConfigs: {
      dist: { viewKind: "table", depth: 2, viewOptions: { color } },
      visited_order: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "shortest path", "dijkstra", "curriculum"],
  },
  {
    key: "unweighted-shortest-path",
    title: "Unweighted Shortest Path",
    description: "Breadth-first shortest-path distances and parent reconstruction on an unweighted graph.",
    snippet: `graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D", "E"],
    "D": ["F"],
    "E": ["F"],
    "F": [],
}
queue = ["A"]
dist = {"A": 0, "B": None, "C": None, "D": None, "E": None, "F": None}
parent = {"A": None, "B": None, "C": None, "D": None, "E": None, "F": None}

while queue:
    node = queue.pop(0)
    for nxt in graph[node]:
        if dist[nxt] is not None:
            continue
        dist[nxt] = dist[node] + 1
        parent[nxt] = node
        queue.append(nxt)
`,
    watchVariables: ["queue", "dist", "parent"],
    variableConfigs: {
      queue: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      dist: { viewKind: "table", depth: 2, viewOptions: { color } },
      parent: { viewKind: "table", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "shortest path", "traversal", "curriculum"],
  },
  {
    key: "bellman-ford-relaxation",
    title: "Bellman-Ford Relaxation",
    description: "Shortest-path relaxation rounds over a weighted directed graph.",
    snippet: `edges = [
    ("A", "B", 4),
    ("A", "C", 5),
    ("B", "C", -2),
    ("B", "D", 6),
    ("C", "D", 3),
]
dist = {"A": 0, "B": None, "C": None, "D": None}
rounds = []

for _ in range(3):
    for source, target, weight in edges:
        if dist[source] is None:
            continue
        next_distance = dist[source] + weight
        if dist[target] is None or next_distance < dist[target]:
            dist[target] = next_distance
    rounds.append(dict(dist))
`,
    watchVariables: ["dist", "rounds"],
    variableConfigs: {
      dist: { viewKind: "table", depth: 2, viewOptions: { color } },
      rounds: { viewKind: "array_cells", depth: 3, viewOptions: { color } },
    },
    tags: ["graph", "shortest path", "bellman-ford", "curriculum"],
  },
  {
    key: "negative-cycle-detection",
    title: "Negative Cycle Detection",
    description: "Bellman-Ford style relaxation that exposes a final negative-cycle check.",
    snippet: `edges = [
    ("A", "B", 1),
    ("B", "C", -2),
    ("C", "A", -2),
    ("C", "D", 2),
]
dist = {"A": 0, "B": None, "C": None, "D": None}
rounds = []
cycle_edges = []

for _ in range(len(dist) - 1):
    for source, target, weight in edges:
        if dist[source] is None:
            continue
        next_distance = dist[source] + weight
        if dist[target] is None or next_distance < dist[target]:
            dist[target] = next_distance
    rounds.append(dict(dist))

for source, target, weight in edges:
    if dist[source] is None:
        continue
    next_distance = dist[source] + weight
    if dist[target] is None or next_distance < dist[target]:
        cycle_edges.append(f"{source}->{target}")
`,
    watchVariables: ["dist", "rounds", "cycle_edges"],
    variableConfigs: {
      dist: { viewKind: "table", depth: 2, viewOptions: { color } },
      rounds: { viewKind: "array_cells", depth: 3, viewOptions: { color } },
      cycle_edges: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "shortest path", "bellman-ford", "curriculum"],
  },
  {
    key: "floyd-cycle-pointers",
    title: "Floyd Cycle Pointers",
    description: "Tortoise and hare pointer movement through a linked cycle.",
    snippet: `next_idx = [1, 2, 3, 4, 2]
tortoise = next_idx[0]
hare = next_idx[next_idx[0]]
positions = {"tortoise": tortoise, "hare": hare}
history = []

while tortoise != hare:
    history.append(f"T:{tortoise} H:{hare}")
    tortoise = next_idx[tortoise]
    hare = next_idx[next_idx[hare]]
    positions["tortoise"] = tortoise
    positions["hare"] = hare

history.append(f"T:{tortoise} H:{hare}")
`,
    watchVariables: ["next_idx", "positions", "history"],
    variableConfigs: {
      next_idx: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      positions: { viewKind: "table", depth: 2, viewOptions: { color } },
      history: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["cycle", "pointer", "algorithm", "curriculum"],
  },

  // Strings and special-purpose examples
  {
    key: "suffix-array-basics",
    title: "Suffix Array Basics",
    description: "Builds and sorts suffixes for a compact string example.",
    snippet: `text = "banana"
suffixes = []
sorted_suffixes = []
order = []

for index in range(len(text)):
    suffixes.append(f"{index}:{text[index:]}")

pairs = [(index, text[index:]) for index in range(len(text))]
pairs.sort(key=lambda item: item[1])
sorted_suffixes = [f"{index}:{suffix}" for index, suffix in pairs]
order = [index for index, _suffix in pairs]
`,
    watchVariables: ["suffixes", "sorted_suffixes", "order"],
    savedManifest: PREGENERATED_EXAMPLE_MANIFESTS["suffix-array-basics"],
    variableConfigs: {
      suffixes: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      sorted_suffixes: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      order: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["string", "suffix array", "algorithm", "curriculum"],
  },
  {
    key: "suffix-array-lcp",
    title: "Suffix Array LCP",
    description: "Computes adjacent longest-common-prefix values after suffix-array ordering.",
    snippet: `text = "BANANA$"
suffixes = []
sorted_suffixes = []
lcp = [0]

for index in range(len(text)):
    suffixes.append(f"{index}:{text[index:]}")

pairs = [(index, text[index:]) for index in range(len(text))]
pairs.sort(key=lambda item: item[1])
sorted_suffixes = [f"{index}:{suffix}" for index, suffix in pairs]

for idx in range(1, len(pairs)):
    left = pairs[idx - 1][1]
    right = pairs[idx][1]
    count = 0
    while count < len(left) and count < len(right) and left[count] == right[count]:
        count += 1
    lcp.append(count)
`,
    watchVariables: ["suffixes", "sorted_suffixes", "lcp"],
    variableConfigs: {
      suffixes: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      sorted_suffixes: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      lcp: { viewKind: "bar", depth: 1, viewOptions: { color } },
    },
    tags: ["string", "suffix array", "algorithm", "curriculum"],
  },
  {
    key: "kmp-prefix-table",
    title: "KMP Prefix Table",
    description: "Builds the prefix-function table used by Knuth-Morris-Pratt string matching.",
    snippet: `pattern = "ABABACA"
lps = [0] * len(pattern)
length = 0
i = 1
trace = []

while i < len(pattern):
    if pattern[i] == pattern[length]:
        length += 1
        lps[i] = length
        trace.append(f"match@{i}->{length}")
        i += 1
    elif length != 0:
        length = lps[length - 1]
        trace.append(f"fallback->{length}")
    else:
        lps[i] = 0
        trace.append(f"zero@{i}")
        i += 1
`,
    watchVariables: ["pattern", "lps", "length", "i", "trace"],
    variableConfigs: {
      pattern: { viewKind: "auto", depth: null, viewOptions: { color } },
      lps: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      length: { viewKind: "auto", depth: null, viewOptions: { color } },
      i: { viewKind: "auto", depth: null, viewOptions: { color } },
      trace: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["string", "algorithm", "curriculum"],
  },
  {
    key: "lcs-dp-table",
    title: "LCS DP Table",
    description: "Builds the dynamic-programming table for longest common subsequence.",
    snippet: `text_a = "ABCBDAB"
text_b = "BDCABA"
dp = [[0] * (len(text_b) + 1) for _ in range(len(text_a) + 1)]
decision_log = []

for i in range(1, len(text_a) + 1):
    for j in range(1, len(text_b) + 1):
        if text_a[i - 1] == text_b[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
            decision_log.append(f"match {text_a[i - 1]} at ({i},{j})")
        else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            decision_log.append(f"max at ({i},{j})")
`,
    watchVariables: ["text_a", "text_b", "dp", "decision_log"],
    variableConfigs: {
      text_a: { viewKind: "auto", depth: null, viewOptions: { color } },
      text_b: { viewKind: "auto", depth: null, viewOptions: { color } },
      dp: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      decision_log: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["string", "dynamic programming", "algorithm", "curriculum"],
  },
  {
    key: "trie-insert-search",
    title: "Trie Insert Search",
    description: "Trie growth and a simple search path summary for inserted words.",
    snippet: `states = [
    {
        "root": {"label": "*", "children": [{"label": "c", "children": [{"label": "a", "children": [{"label": "t*", "children": []}]}]}]},
        "path": ["c", "a", "t"],
        "words": ["cat"],
    },
    {
        "root": {"label": "*", "children": [{"label": "c", "children": [{"label": "a", "children": [{"label": "t*", "children": []}, {"label": "r*", "children": []}]}]}]},
        "path": ["c", "a", "r"],
        "words": ["cat", "car"],
    },
    {
        "root": {"label": "*", "children": [{"label": "c", "children": [{"label": "a", "children": [{"label": "t*", "children": []}, {"label": "r*", "children": []}]}]}, {"label": "d", "children": [{"label": "o", "children": [{"label": "g*", "children": []}]}]}]},
        "path": ["d", "o", "g"],
        "words": ["cat", "car", "dog"],
    },
]
target = "car"

for state in states:
    root = state["root"]
    path = state["path"]
    words = state["words"]
`,
    watchVariables: ["root", "path", "words", "target"],
    variableConfigs: {
      root: { viewKind: "tree", depth: 4, viewOptions: { color } },
      path: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      words: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      target: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["string", "tree", "algorithm", "curriculum"],
  },
  { key: "image", title: "Image", description: "Image view requires a browser-accessible asset path; this example is a placeholder.", snippet: `data = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'><rect width='120' height='80' fill='%23e0f2fe'/><text x='18' y='46' font-size='20' fill='%230f172a'>CodeFlow</text></svg>"\n`, watchVariables: ["data"], variableConfigs: variable("image", 1), tags: ["image", "asset required", "special"] },
];
