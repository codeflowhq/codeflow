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
  // Sorting and arrays
  {
    key: "bubble-sort-steps",
    title: "Bubble Sort Trace",
    description: "Classic bubble sort trace over an array view.",
    snippet: defaultSnippet,
    watchVariables: ["data", "i", "j"],
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
    description: "Merge sort with the current recursive range, merge snapshots, and call stack exposed.",
    snippet: `data = [38, 27, 43, 3, 9, 82, 10]
segments = []
active_range = []
call_stack = []


def merge_sort(start, end):
    global active_range
    if end - start <= 1:
        return
    active_range = [start, end - 1]
    call_stack.append(f"{start}:{end - 1}")
    mid = (start + end) // 2
    merge_sort(start, mid)
    active_range = [start, end - 1]
    merge_sort(mid, end)
    active_range = [start, end - 1]

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
    active_range = [start, end - 1]
    call_stack.pop()


merge_sort(0, len(data))
`,
    watchVariables: ["data", "active_range", "segments", "call_stack"],
    variableConfigs: {
      data: { viewKind: "bar", depth: 1, viewOptions: { color } },
      active_range: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      segments: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      call_stack: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["algorithm", "sorting", "array", "curriculum"],
  },
  {
    key: "quick-sort-trace",
    title: "Quick Sort Trace",
    description: "In-place quick sort with the current recursive range, pivot, and call stack exposed.",
    snippet: `data = [33, 10, 55, 26, 64, 18]
active_range = []
pivot = None
call_stack = []


def partition(left, right):
    global pivot
    pivot = data[right]
    i = left - 1
    for j in range(left, right):
        if data[j] <= pivot:
            i += 1
            data[i], data[j] = data[j], data[i]
    data[i + 1], data[right] = data[right], data[i + 1]
    return i + 1


def quick_sort(left, right):
    global active_range
    if left >= right:
        return
    active_range = [left, right]
    call_stack.append(f"{left}:{right}")
    pivot_index = partition(left, right)
    quick_sort(left, pivot_index - 1)
    active_range = [left, right]
    quick_sort(pivot_index + 1, right)
    active_range = [left, right]
    call_stack.pop()


quick_sort(0, len(data) - 1)
`,
    watchVariables: ["data", "active_range", "pivot", "call_stack"],
    variableConfigs: {
      data: { viewKind: "bar", depth: 1, viewOptions: { color } },
      active_range: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      pivot: { viewKind: "auto", depth: null, viewOptions: { color } },
      call_stack: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
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
  { key: "linked-list", title: "Linked List", description: "Linked list view with insert/delete example.", snippet: `class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\ndef insert_after(node, value):\n    node.next = Node(value, node.next)\n\ndef delete_after(node):\n    if node.next is not None:\n        node.next = node.next.next\n\ndata = Node(1, Node(2, Node(3)))\ninsert_after(data, 9)\ndelete_after(data.next)\n`, watchVariables: ["data"], variableConfigs: variable("linked_list", 2), tags: ["linked list", "linear structure", "data structure", "curriculum"] },
  { key: "hash-table", title: "Hash Table", description: "Hash table view with bucket chains.", snippet: `data = [[("ab", 1), ("ba", 3)], [], [("cab", 2)]]\ndata[2].append(("dab", 4))\n`, watchVariables: ["data"], variableConfigs: variable("hash_table", 2), tags: ["hash table", "map", "data structure", "curriculum"] },
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
      table: { viewKind: "hash_table", depth: 2, viewOptions: { color } },
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
      table: { viewKind: "hash_table", depth: 2, viewOptions: { color } },
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
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
queue = ["A"]
visited = []
seen = {"A"}
parent = {"A": None}
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": "",
            "color": "#cbd5e1",
        })

while queue:
    node = queue.pop(0)
    current_node = node
    refresh_nodes()
    visited.append(node)
    for nxt in graph[node]:
        if nxt in seen:
            continue
        seen.add(nxt)
        parent[nxt] = node
        queue.append(nxt)
        graph_state["edges"] = [
            {
                "source": source,
                "target": target,
                "label": "",
                "color": "#2563eb" if parent.get(target) == source else "#cbd5e1",
            }
            for source, neighbors in graph.items()
            for target in neighbors
        ]
`,
    watchVariables: ["graph_state", "queue", "visited", "node"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
    variableConfigs: variable("table", 3),
    tags: ["nested", "dict", "list", "intro"],
  },

  // Trees and range structures
  { key: "heap-dual", title: "Heap Dual", description: "Dual heap view with array + tree.", snippet: `data = [9, 7, 6, 3, 1]\n`, watchVariables: ["data"], variableConfigs: variable("heap_dual", 2), tags: ["heap"] },
  {
    key: "heap-insert-trace",
    title: "Heap Insert Trace",
    description: "Shows a max-heap growing as new values bubble upward, with the active node and parent exposed.",
    snippet: `data = [40, 18, 33, 12, 9]
inserted = []
active_index = None
parent_index = None
swap_path = []


def push(value):
    global active_index, parent_index, swap_path
    data.append(value)
    inserted.append(value)
    index = len(data) - 1
    active_index = index
    parent_index = None
    swap_path = [index]
    while index > 0:
        parent = (index - 1) // 2
        parent_index = parent
        if data[parent] >= data[index]:
            break
        data[parent], data[index] = data[index], data[parent]
        index = parent
        active_index = index
        swap_path.append(index)
    active_index = index


for value in [27, 45]:
    push(value)
`,
    watchVariables: ["data", "inserted", "active_index", "parent_index", "swap_path"],
    variableConfigs: {
      data: { viewKind: "heap_dual", depth: 2, viewOptions: { color } },
      inserted: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      active_index: { viewKind: "auto", depth: null, viewOptions: { color } },
      parent_index: { viewKind: "auto", depth: null, viewOptions: { color } },
      swap_path: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
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
  { key: "tree", title: "Tree", description: "Tree view using nested children.", snippet: `data = {"label": "A", "children": [{"label": "B", "children": []}, {"label": "C", "children": [{"label": "D", "children": []}]}]}\n`, watchVariables: ["data"], variableConfigs: variable("tree", 3), tags: ["tree", "data structure", "intro"] },
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
    description: "Builds a binary search tree through real insert operations.",
    snippet: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def insert(node, value):
    if node is None:
        return Node(value)
    if value < node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    return node


def snapshot(node):
    if node is None:
        return {"label": "∅", "children": []}
    children = []
    if node.left is not None:
        children.append(snapshot(node.left))
    if node.right is not None:
        children.append(snapshot(node.right))
    return {"label": str(node.value), "children": children}


root = None
data = {"label": "∅", "children": []}

for value in [7, 3, 9, 1, 5, 8, 10]:
    root = insert(root, value)
    data = snapshot(root)
`,
    watchVariables: ["data"],
    variableConfigs: variable("tree", 3),
    tags: ["tree", "bst", "data structure", "curriculum"],
  },
  {
    key: "bst-search-trace",
    title: "BST Search Trace",
    description: "Walks a binary search tree while recording the visited path.",
    snippet: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def insert(node, value):
    if node is None:
        return Node(value)
    if value < node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    return node


def snapshot(node, current=None):
    if node is None:
        return {"label": "∅", "children": []}
    label = str(node.value)
    if current is node:
        label = f"[{label}]"
    children = []
    if node.left is not None:
        children.append(snapshot(node.left, current))
    if node.right is not None:
        children.append(snapshot(node.right, current))
    return {"label": label, "children": children}


root = None
for value in [8, 3, 10, 1, 6, 9, 14, 4, 7, 13]:
    root = insert(root, value)

target = 13
path = []
current = root
data = snapshot(root, current)

while current is not None:
    path.append(str(current.value))
    data = snapshot(root, current)
    if current.value == target:
        break
    if target < current.value:
        current = current.left
    else:
        current = current.right

data = snapshot(root, current)
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
    description: "Deletes a BST node with two children and keeps a focus trace.",
    snippet: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def insert(node, value):
    if node is None:
        return Node(value)
    if value < node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    return node


def snapshot(node, focus_values=()):
    if node is None:
        return {"label": "∅", "children": []}
    label = str(node.value)
    if str(node.value) in focus_values:
        label = f"[{label}]"
    children = []
    if node.left is not None:
        children.append(snapshot(node.left, focus_values))
    if node.right is not None:
        children.append(snapshot(node.right, focus_values))
    return {"label": label, "children": children}


def leftmost(node):
    while node.left is not None:
        node = node.left
    return node


def delete(node, value):
    global data, focus
    if node is None:
        return None
    focus = focus + [str(node.value)]
    data = snapshot(root, focus)
    if value < node.value:
        node.left = delete(node.left, value)
        return node
    if value > node.value:
        node.right = delete(node.right, value)
        return node
    if node.left is None:
        return node.right
    if node.right is None:
        return node.left
    successor = leftmost(node.right)
    node.value = successor.value
    data = snapshot(root, focus + [str(successor.value)])
    node.right = delete(node.right, successor.value)
    return node


root = None
for value in [8, 3, 10, 1, 6, 9, 14, 4, 7, 13]:
    root = insert(root, value)

deleted = 3
focus = []
data = snapshot(root)
root = delete(root, deleted)
data = snapshot(root, focus)
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
    description: "Shows AVL balancing through real insertions and rotations.",
    snippet: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 1


def height(node):
    return 0 if node is None else node.height


def update(node):
    node.height = max(height(node.left), height(node.right)) + 1


def rotate_left(node):
    pivot = node.right
    node.right = pivot.left
    pivot.left = node
    update(node)
    update(pivot)
    return pivot


def rotate_right(node):
    pivot = node.left
    node.left = pivot.right
    pivot.right = node
    update(node)
    update(pivot)
    return pivot


def balance(node):
    if node is None:
        return None
    update(node)
    factor = height(node.left) - height(node.right)
    if factor > 1:
        if height(node.left.left) < height(node.left.right):
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if factor < -1:
        if height(node.right.right) < height(node.right.left):
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


def insert(node, value):
    if node is None:
        return Node(value)
    if value < node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    return balance(node)


def snapshot(node):
    if node is None:
        return {"label": "∅", "children": []}
    children = []
    if node.left is not None:
        children.append(snapshot(node.left))
    if node.right is not None:
        children.append(snapshot(node.right))
    return {"label": f"{node.value} ({node.height})", "children": children}


root = None
data = {"label": "∅", "children": []}

for value in [30, 20, 10, 25, 28]:
    root = insert(root, value)
    data = snapshot(root)
`,
    watchVariables: ["data"],
    variableConfigs: variable("tree", 4),
    tags: ["tree", "avl", "rotation", "curriculum"],
  },
  {
    key: "union-find-trace",
    title: "Union-Find Trace",
    description: "Shows parent and rank updates across real union operations.",
    snippet: `parent = list(range(6))
rank = [0] * 6
groups = parent[:]
operations = []


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


def union(a, b):
    root_a = find(a)
    root_b = find(b)
    if root_a == root_b:
        operations.append(f"skip {a}-{b}")
        return
    if rank[root_a] < rank[root_b]:
        parent[root_a] = root_b
    elif rank[root_a] > rank[root_b]:
        parent[root_b] = root_a
    else:
        parent[root_b] = root_a
        rank[root_a] += 1
    operations.append(f"union {a}-{b}")


def snapshot_groups():
    return [find(index) for index in range(len(parent))]


for a, b in [(0, 1), (1, 2), (3, 4), (2, 3)]:
    union(a, b)
    groups = snapshot_groups()
`,
    watchVariables: ["parent", "rank", "groups", "operations"],
    variableConfigs: {
      parent: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      rank: { viewKind: "bar", depth: 1, viewOptions: { color } },
      groups: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      operations: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
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
    variableConfigs: {
      values: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      tree: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["segment tree", "range query", "tree", "curriculum"],
  },

  // Graph algorithms and traversal
  {
    key: "graph",
    title: "Graph",
    description: "Graph view built incrementally from node and edge updates.",
    snippet: `data = {
  "nodes": [],
  "edges": [],
  "directed": True,
}

for node in ["A", "B", "C", "D"]:
    data["nodes"].append({"id": node})

for source, target, label in [("A", "B", "ab"), ("B", "C", "bc"), ("A", "D", "ad")]:
    data["edges"].append({"source": source, "target": target, "label": label})
`,
    watchVariables: ["data"],
    variableConfigs: variable("graph", 2),
    tags: ["graph", "data structure", "intro"],
  },
  {
    key: "nested-graph-structure",
    title: "Nested Graph Mapping",
    description: "Graph mapping with nested node payloads added over a real build sequence.",
    snippet: `node_specs = [
  ("A", {"name": "Alpha", "weight": 3}),
  ("B", {"name": "Beta", "weight": 5}),
  ("C", {"name": "Gamma", "weight": 8}),
]
edge_specs = [("A", "B", "ab"), ("B", "C", "bc")]
data = {
  "nodes": [],
  "edges": [],
  "directed": True,
}

for node_id, payload in node_specs:
    data["nodes"].append({"id": node_id, "label": payload})

for source, target, label in edge_specs:
    data["edges"].append({"source": source, "target": target, "label": label})
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
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
stack = ["A"]
visited = []
order = []
parent = {"A": None}
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": "",
            "color": "#cbd5e1",
        })

while stack:
    node = stack.pop()
    current_node = node
    refresh_nodes()
    if node in visited:
        continue
    visited.append(node)
    order.append(node)
    for nxt in reversed(graph[node]):
        if nxt not in parent:
            parent[nxt] = node
        stack.append(nxt)
        graph_state["edges"] = [
            {
                "source": source,
                "target": target,
                "label": "",
                "color": "#2563eb" if parent.get(target) == source else "#cbd5e1",
            }
            for source, neighbors in graph.items()
            for target in neighbors
        ]
`,
    watchVariables: ["graph_state", "stack", "visited", "order"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
in_degree = {"A": 0, "B": 0, "C": 2, "D": 1, "E": 1, "F": 2}
queue = ["A", "B"]
order = []

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": "",
            "color": "#cbd5e1",
        })

while queue:
    node = queue.pop(0)
    order.append(node)
    for nxt in graph[node]:
        in_degree[nxt] -= 1
        if in_degree[nxt] == 0:
            queue.append(nxt)
        graph_state["edges"] = [
            {
                "source": source,
                "target": target,
                "label": "",
                "color": "#2563eb" if target in order or target in queue else "#cbd5e1",
            }
            for source, neighbors in graph.items()
            for target in neighbors
        ]
`,
    watchVariables: ["graph_state", "in_degree", "queue", "order"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": False,
}
visited = []
components = []
component_index = {}

for source, neighbors in graph.items():
    for target in neighbors:
        if source < target:
            graph_state["edges"].append({
                "source": source,
                "target": target,
                "label": "",
                "color": "#cbd5e1",
            })

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
        component_index[node] = len(components)
        for nxt in reversed(graph[node]):
            if nxt not in visited:
                stack.append(nxt)
        graph_state["edges"] = [
            {
                "source": source,
                "target": target,
                "label": "",
                "color": "#2563eb" if (
                    component_index.get(source) is not None
                    and component_index.get(source) == component_index.get(target)
                ) else "#cbd5e1",
            }
            for source, neighbors in graph.items()
            for target in neighbors
            if source < target
        ]
    components.append(component)
`,
    watchVariables: ["graph_state", "visited", "components"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      components: { viewKind: "matrix", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "traversal", "algorithm", "curriculum"],
  },
  {
    key: "a-star-search",
    title: "A* Search",
    description: "Heuristic graph search with evolving frontier scores and a discovered path tree.",
    snippet: `graph = {
    "S": {"A": 1, "B": 4},
    "A": {"C": 2, "D": 5},
    "B": {"D": 1},
    "C": {"G": 5},
    "D": {"G": 3},
    "G": {},
}
heuristic = {"S": 6, "A": 4, "B": 4, "C": 3, "D": 2, "G": 0}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
open_set = [("S", 0)]
g_score = {"S": 0}
parent = {"S": None}
expanded = []
goal = "G"
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]


def rebuild_tree():
    graph_state["edges"] = [
        {"source": source, "target": node, "label": str(g_score[node])}
        for node, source in parent.items()
        if source is not None
    ]


while open_set:
    open_set.sort(key=lambda item: item[1] + heuristic[item[0]])
    node, current_cost = open_set.pop(0)
    current_node = node
    refresh_nodes()
    if node in expanded:
        continue
    expanded.append(node)
    if node == goal:
        break
    for nxt, weight in graph[node].items():
        next_cost = current_cost + weight
        if nxt not in g_score or next_cost < g_score[nxt]:
            g_score[nxt] = next_cost
            parent[nxt] = node
            open_set.append((nxt, next_cost))
            rebuild_tree()
`,
    watchVariables: ["graph_state", "open_set", "g_score", "expanded"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      open_set: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      g_score: { viewKind: "table", depth: 2, viewOptions: { color } },
      expanded: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "heuristic", "graph", "algorithm", "curriculum"],
  },
  {
    key: "uniform-cost-search",
    title: "Uniform Cost Search",
    description: "Best-first expansion by path cost only, with frontier and parent updates.",
    snippet: `graph = {
    "S": {"A": 1, "B": 4},
    "A": {"C": 2, "D": 5},
    "B": {"D": 1},
    "C": {"G": 5},
    "D": {"G": 2},
    "G": {},
}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
frontier = [("S", 0)]
dist = {"S": 0}
parent = {"S": None}
expanded = []
goal = "G"
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]


def rebuild_tree():
    graph_state["edges"] = [
        {"source": source, "target": node, "label": str(dist[node])}
        for node, source in parent.items()
        if source is not None
    ]


while frontier:
    frontier.sort(key=lambda item: item[1])
    node, current_cost = frontier.pop(0)
    current_node = node
    refresh_nodes()
    if node in expanded:
        continue
    expanded.append(node)
    if node == goal:
        break
    for nxt, weight in graph[node].items():
        next_cost = current_cost + weight
        if nxt not in dist or next_cost < dist[nxt]:
            dist[nxt] = next_cost
            parent[nxt] = node
            frontier.append((nxt, next_cost))
            rebuild_tree()
`,
    watchVariables: ["graph_state", "frontier", "dist", "expanded"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      dist: { viewKind: "table", depth: 2, viewOptions: { color } },
      expanded: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "uniform cost", "graph", "algorithm", "curriculum"],
  },
  {
    key: "greedy-best-first-search",
    title: "Greedy Best-First Search",
    description: "Heuristic-only frontier ordering with the explored tree updated step by step.",
    snippet: `graph = {
    "S": {"A": 1, "B": 1},
    "A": {"C": 1, "D": 1},
    "B": {"E": 1},
    "C": {"G": 1},
    "D": {},
    "E": {"G": 1},
    "G": {},
}
heuristic = {"S": 5, "A": 3, "B": 2, "C": 1, "D": 4, "E": 1, "G": 0}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
frontier = ["S"]
parent = {"S": None}
expanded = []
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]


def rebuild_tree():
    graph_state["edges"] = [
        {"source": source, "target": node, "label": str(heuristic[node])}
        for node, source in parent.items()
        if source is not None
    ]


while frontier:
    frontier.sort(key=lambda node: heuristic[node])
    node = frontier.pop(0)
    current_node = node
    refresh_nodes()
    if node in expanded:
        continue
    expanded.append(node)
    if node == "G":
        break
    for nxt in graph[node]:
        if nxt in expanded or nxt in frontier:
            continue
        if nxt not in parent:
            parent[nxt] = node
        frontier.append(nxt)
        rebuild_tree()
`,
    watchVariables: ["graph_state", "frontier", "expanded"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      expanded: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "greedy", "heuristic", "graph", "algorithm", "curriculum"],
  },
  {
    key: "a-star-with-visited-memory",
    title: "A* with Visited Memory",
    description: "A* graph search with an explicit closed set to avoid re-expanding visited states.",
    snippet: `graph = {
    "S": {"A": 1, "B": 4},
    "A": {"C": 2, "D": 5},
    "B": {"D": 1},
    "C": {"G": 5},
    "D": {"G": 3},
    "G": {},
}
heuristic = {"S": 6, "A": 4, "B": 4, "C": 3, "D": 2, "G": 0}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
frontier = [("S", 0)]
g_score = {"S": 0}
parent = {"S": None}
closed_set = []
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]


def rebuild_tree():
    graph_state["edges"] = [
        {"source": source, "target": node, "label": str(g_score[node])}
        for node, source in parent.items()
        if source is not None
    ]


while frontier:
    frontier.sort(key=lambda item: item[1] + heuristic[item[0]])
    node, current_cost = frontier.pop(0)
    current_node = node
    refresh_nodes()
    if node in closed_set:
        continue
    closed_set.append(node)
    if node == "G":
        break
    for nxt, weight in graph[node].items():
        if nxt in closed_set:
            continue
        next_cost = current_cost + weight
        if nxt not in g_score or next_cost < g_score[nxt]:
            g_score[nxt] = next_cost
            parent[nxt] = node
            frontier.append((nxt, next_cost))
            rebuild_tree()
`,
    watchVariables: ["graph_state", "frontier", "g_score", "closed_set"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      g_score: { viewKind: "table", depth: 2, viewOptions: { color } },
      closed_set: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "heuristic", "a*", "graph", "algorithm", "curriculum"],
  },
  {
    key: "depth-limited-search",
    title: "Depth-Limited Search",
    description: "Depth-first search with a hard depth bound that stops deeper expansion.",
    snippet: `graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": ["G"],
    "E": [],
    "F": [],
    "G": [],
}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
stack = [("A", 0)]
limit = 2
visited = []
cutoff = []
current_node = None
current_depth = 0


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": "",
            "color": "#cbd5e1",
        })

while stack:
    node, depth = stack.pop()
    current_node = node
    current_depth = depth
    refresh_nodes()
    visited.append(f"{node}@{depth}")
    if depth == limit:
        if graph[node]:
            cutoff.append(node)
            graph_state["edges"] = [
                {
                    "source": source,
                    "target": target,
                    "label": "",
                    "color": "#f59e0b" if source == node else "#cbd5e1",
                }
                for source, neighbors in graph.items()
                for target in neighbors
            ]
        continue
    for nxt in reversed(graph[node]):
        stack.append((nxt, depth + 1))
    graph_state["edges"] = [
        {
            "source": source,
            "target": target,
            "label": "",
            "color": "#2563eb" if source == node else "#cbd5e1",
        }
        for source, neighbors in graph.items()
        for target in neighbors
    ]
`,
    watchVariables: ["graph_state", "current_node", "current_depth", "stack", "visited", "cutoff", "limit"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      current_node: { viewKind: "auto", depth: null, viewOptions: { color } },
      current_depth: { viewKind: "auto", depth: null, viewOptions: { color } },
      stack: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      cutoff: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      limit: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["search", "depth-limited", "dfs", "algorithm", "curriculum"],
  },
  {
    key: "iterative-deepening-search",
    title: "Iterative Deepening Search",
    description: "Repeated depth-limited searches with increasing limits until the goal is reached.",
    snippet: `graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": ["G"],
    "E": [],
    "F": [],
    "G": [],
}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
limits = []
layers = []
found = None
goal = "G"
current_limit = 0
visited_this_round = []
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": "",
            "color": "#cbd5e1",
        })

for limit in range(4):
    current_limit = limit
    limits.append(limit)
    stack = [("A", 0)]
    order = []
    visited_this_round = []
    while stack:
        node, depth = stack.pop()
        current_node = node
        refresh_nodes()
        order.append(f"{node}@{depth}")
        visited_this_round.append(node)
        if node == goal:
            found = node
            break
        if depth == limit:
            continue
        for nxt in reversed(graph[node]):
            stack.append((nxt, depth + 1))
        graph_state["edges"] = [
            {
                "source": source,
                "target": target,
                "label": "",
                "color": "#2563eb" if source in visited_this_round else "#cbd5e1",
            }
            for source, neighbors in graph.items()
            for target in neighbors
        ]
    layers.append(order)
    if found is not None:
        break
`,
    watchVariables: ["graph_state", "current_limit", "visited_this_round", "limits", "layers", "found"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      current_limit: { viewKind: "auto", depth: null, viewOptions: { color } },
      visited_this_round: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      limits: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      layers: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      found: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["search", "iterative deepening", "dfs", "algorithm", "curriculum"],
  },
  {
    key: "hill-climbing-trace",
    title: "Hill Climbing Trace",
    description: "Steepest-ascent hill climbing on a 4-Queens board, showing the current state and chosen move.",
    snippet: `size = 4
state = [0, 0, 0, 0]
board = []
current_conflicts = 0
best_move = "start"
decision = "start"


def make_board(positions):
    rows = []
    for row in range(size):
        cells = []
        for column in range(size):
            cells.append("Q" if positions[column] == row else ".")
        rows.append(cells)
    return rows


def conflicts(positions):
    total = 0
    for left in range(size):
        for right in range(left + 1, size):
            same_row = positions[left] == positions[right]
            same_diag = abs(positions[left] - positions[right]) == abs(left - right)
            if same_row or same_diag:
                total += 1
    return total


board = make_board(state)
current_conflicts = conflicts(state)

while True:
    best_state = list(state)
    best_score = current_conflicts
    best_move = "stay"

    for column in range(size):
        original_row = state[column]
        for row in range(size):
            if row == original_row:
                continue
            candidate = list(state)
            candidate[column] = row
            candidate_score = conflicts(candidate)
            if candidate_score < best_score:
                best_state = candidate
                best_score = candidate_score
                best_move = f"col {column}: {original_row}->{row}"

    if best_score >= current_conflicts:
        decision = "stop at local optimum"
        break

    state = best_state
    current_conflicts = best_score
    board = make_board(state)
    decision = f"{best_move}, conflicts={current_conflicts}"
`,
    watchVariables: ["board", "state", "current_conflicts", "decision"],
    variableConfigs: {
      board: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      state: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      current_conflicts: { viewKind: "auto", depth: null, viewOptions: { color } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["local search", "hill climbing", "algorithm", "curriculum"],
  },
  {
    key: "bidirectional-search",
    title: "Bidirectional Search",
    description: "Two-frontier search that grows from both start and goal until the waves meet.",
    snippet: `graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "E"],
    "D": ["B", "F"],
    "E": ["C", "F"],
    "F": ["D", "E", "G"],
    "G": ["F"],
}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": False,
}
forward_queue = ["A"]
backward_queue = ["G"]
forward_seen = ["A"]
backward_seen = ["G"]
meet = None
forward_node = None
backward_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {
            "id": node,
            "label": (
                f"[{node}]"
                if node == meet
                else f"[{node}]"
                if node == forward_node or node == backward_node
                else node
            ),
        }
        if node == meet or node == forward_node or node == backward_node
        else node
        for node in graph
    ]

for source, neighbors in graph.items():
    for target in neighbors:
        if source < target:
            graph_state["edges"].append({
                "source": source,
                "target": target,
                "label": "",
                "color": "#cbd5e1",
            })

while forward_queue and backward_queue and meet is None:
    forward_node = forward_queue.pop(0)
    refresh_nodes()
    for nxt in graph[forward_node]:
        if nxt not in forward_seen:
            forward_seen.append(nxt)
            forward_queue.append(nxt)
        if nxt in backward_seen:
            meet = nxt
            refresh_nodes()
            break
    graph_state["edges"] = [
        {
            "source": source,
            "target": target,
            "label": "",
            "color": "#7c3aed" if meet is not None and (source == meet or target == meet) else (
                "#2563eb" if source in forward_seen and target in forward_seen else (
                    "#dc2626" if source in backward_seen and target in backward_seen else "#cbd5e1"
                )
            ),
        }
        for source, neighbors in graph.items()
        for target in neighbors
        if source < target
    ]
    if meet is not None:
        break

    backward_node = backward_queue.pop(0)
    refresh_nodes()
    for nxt in graph[backward_node]:
        if nxt not in backward_seen:
            backward_seen.append(nxt)
            backward_queue.append(nxt)
        if nxt in forward_seen:
            meet = nxt
            refresh_nodes()
            break
    graph_state["edges"] = [
        {
            "source": source,
            "target": target,
            "label": "",
            "color": "#7c3aed" if meet is not None and (source == meet or target == meet) else (
                "#2563eb" if source in forward_seen and target in forward_seen else (
                    "#dc2626" if source in backward_seen and target in backward_seen else "#cbd5e1"
                )
            ),
        }
        for source, neighbors in graph.items()
        for target in neighbors
        if source < target
    ]
`,
    watchVariables: ["graph_state", "forward_node", "backward_node", "forward_queue", "backward_queue", "forward_seen", "backward_seen", "meet"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      forward_node: { viewKind: "auto", depth: null, viewOptions: { color } },
      backward_node: { viewKind: "auto", depth: null, viewOptions: { color } },
      forward_queue: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      backward_queue: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      forward_seen: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      backward_seen: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      meet: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["search", "bidirectional", "graph", "algorithm", "curriculum"],
  },
  {
    key: "beam-search",
    title: "Beam Search",
    description: "Width-limited heuristic search that keeps only the best frontier candidates at each layer.",
    snippet: `graph = {
    "S": ["A", "B", "C"],
    "A": ["D", "E"],
    "B": ["F", "G"],
    "C": ["H"],
    "D": [],
    "E": ["G"],
    "F": [],
    "G": ["Goal"],
    "H": [],
    "Goal": [],
}
heuristic = {"S": 6, "A": 4, "B": 3, "C": 5, "D": 6, "E": 2, "F": 5, "G": 1, "H": 4, "Goal": 0}
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
beam = ["S"]
visited = []
layers = [list(beam)]
beam_width = 2
candidates = []
dropped = []
current_node = None


def refresh_nodes():
    graph_state["nodes"] = [
        {"id": node, "label": f"[{node}]"} if node == current_node else node
        for node in graph
    ]

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": str(heuristic[target]),
            "color": "#cbd5e1",
        })

while beam:
    if "Goal" in beam:
        break
    candidates = []
    for node in beam:
        current_node = node
        refresh_nodes()
        if node not in visited:
            visited.append(node)
        for nxt in graph[node]:
            if nxt not in visited and nxt not in candidates:
                candidates.append(nxt)
    candidates.sort(key=lambda node: heuristic[node])
    dropped = candidates[beam_width:]
    beam = candidates[:beam_width]
    graph_state["edges"] = [
        {
            "source": source,
            "target": target,
            "label": str(heuristic[target]),
            "color": "#2563eb" if target in beam else ("#f59e0b" if target in dropped else "#cbd5e1"),
        }
        for source, neighbors in graph.items()
        for target in neighbors
    ]
    if beam:
        layers.append(list(beam))
`,
    watchVariables: ["graph_state", "beam_width", "candidates", "beam", "dropped", "visited", "layers"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      beam_width: { viewKind: "auto", depth: null, viewOptions: { color } },
      candidates: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      beam: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      dropped: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      layers: { viewKind: "matrix", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "beam search", "heuristic", "graph", "algorithm", "curriculum"],
  },
  {
    key: "simulated-annealing",
    title: "Simulated Annealing",
    description: "Probabilistic local search that sometimes accepts worse states while the temperature cools.",
    snippet: `states = [2, 8, 5, 9, 6, 7, 4]
current_index = 0
temperature = 10
path = [current_index]
accepted_scores = [states[current_index]]
decisions = []
candidate_index = None
delta = 0
acceptance_probability = 1.0
accepted = True

while temperature > 1 and current_index + 1 < len(states):
    candidate_index = current_index + 1
    delta = states[candidate_index] - states[current_index]
    threshold = temperature / 2
    acceptance_probability = round(min(1.0, threshold / max(1, abs(delta))), 3)

    if delta >= 0:
        accept = True
        accepted = True
        decisions.append(f"better->{candidate_index}")
    else:
        accept = abs(delta) <= threshold
        accepted = accept
        decisions.append(f"worse->{candidate_index}:{'accept' if accept else 'reject'}")

    if accept:
        current_index = candidate_index
        path.append(current_index)
        accepted_scores.append(states[current_index])

    temperature -= 2
`,
    watchVariables: ["states", "current_index", "candidate_index", "temperature", "delta", "acceptance_probability", "accepted", "path", "accepted_scores", "decisions"],
    variableConfigs: {
      states: { viewKind: "bar", depth: 1, viewOptions: { color } },
      current_index: { viewKind: "auto", depth: null, viewOptions: { color } },
      candidate_index: { viewKind: "auto", depth: null, viewOptions: { color } },
      temperature: { viewKind: "auto", depth: null, viewOptions: { color } },
      delta: { viewKind: "auto", depth: null, viewOptions: { color } },
      acceptance_probability: { viewKind: "auto", depth: null, viewOptions: { color } },
      accepted: { viewKind: "auto", depth: null, viewOptions: { color } },
      path: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      accepted_scores: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      decisions: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["local search", "simulated annealing", "heuristic", "algorithm", "curriculum"],
  },
  {
    key: "minimax-tree",
    title: "Minimax Tree",
    description: "Adversarial game-tree evaluation with recursive minimax updates.",
    snippet: `data = {
    "name": "A",
    "role": "MAX",
    "value": None,
    "children": [
        {
            "name": "B",
            "role": "MIN",
            "value": None,
            "children": [
                {"name": "L1", "value": 3, "children": []},
                {"name": "L2", "value": 5, "children": []},
            ],
        },
        {
            "name": "C",
            "role": "MIN",
            "value": None,
            "children": [
                {"name": "L3", "value": 2, "children": []},
                {"name": "L4", "value": 9, "children": []},
            ],
        },
    ],
}
view = {"label": "loading", "children": []}
decision = "start"


def build_view(node, active=None):
    if not node["children"]:
        label = str(node["value"])
        if node is active:
            label = f"[{label}]"
        return {"label": label, "children": []}
    value_text = "?" if node["value"] is None else str(node["value"])
    label = f"{node['role']} {node['name']}={value_text}"
    if node is active:
        label = f"[{label}]"
    return {
        "label": label,
        "children": [build_view(child, active) for child in node["children"]],
    }


def minimax(node, maximizing):
    global view, decision
    role = "MAX" if maximizing else "MIN"
    decision = f"visit {role} node {node['name']}"
    view = build_view(data, node)
    if not node["children"]:
        value = node["value"]
        decision = f"return leaf {value}"
        return value
    scores = []
    for child in node["children"]:
        scores.append(minimax(child, not maximizing))
    value = max(scores) if maximizing else min(scores)
    node["value"] = value
    decision = f"{role} node {node['name']} chooses {value} from {scores}"
    view = build_view(data, node)
    return value


score = minimax(data, True)
`,
    watchVariables: ["view", "decision", "score"],
    variableConfigs: {
      view: { viewKind: "tree", depth: 4, viewOptions: { color } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
      score: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["adversarial", "minimax", "tree", "algorithm", "curriculum"],
  },
  {
    key: "alpha-beta-pruning",
    title: "Alpha-Beta Pruning",
    description: "Minimax with alpha-beta pruning, including cut-off events in the trace.",
    snippet: `data = {
    "name": "A",
    "role": "MAX",
    "value": None,
    "alpha": None,
    "beta": None,
    "pruned": False,
    "children": [
        {
            "name": "B",
            "role": "MIN",
            "value": None,
            "alpha": None,
            "beta": None,
            "pruned": False,
            "children": [
                {"name": "L1", "value": 3, "alpha": None, "beta": None, "pruned": False, "children": []},
                {"name": "L2", "value": 5, "alpha": None, "beta": None, "pruned": False, "children": []},
                {"name": "L3", "value": 6, "alpha": None, "beta": None, "pruned": False, "children": []},
            ],
        },
        {
            "name": "C",
            "role": "MIN",
            "value": None,
            "alpha": None,
            "beta": None,
            "pruned": False,
            "children": [
                {"name": "L4", "value": 2, "alpha": None, "beta": None, "pruned": False, "children": []},
                {"name": "L5", "value": 9, "alpha": None, "beta": None, "pruned": False, "children": []},
                {"name": "L6", "value": 1, "alpha": None, "beta": None, "pruned": False, "children": []},
            ],
        },
    ],
}
view = {"label": "loading", "children": []}
decision = "start"


def build_view(node, active=None):
    if not node["children"]:
        label = str(node["value"])
        if node["pruned"]:
            label = f"x {label}"
        if node is active:
            label = f"[{label}]"
        return {"label": label, "children": []}
    value_text = "?" if node["value"] is None else str(node["value"])
    alpha_text = "-" if node["alpha"] is None else str(node["alpha"])
    beta_text = "-" if node["beta"] is None else str(node["beta"])
    label = f"{node['role']} {node['name']}={value_text} a={alpha_text} b={beta_text}"
    if node["pruned"]:
        label = f"x {label}"
    if node is active:
        label = f"[{label}]"
    return {
        "label": label,
        "children": [build_view(child, active) for child in node["children"]],
    }


def alpha_beta(node, alpha, beta, maximizing):
    global view, decision
    role = "MAX" if maximizing else "MIN"
    node["alpha"] = alpha
    node["beta"] = beta
    decision = f"visit {role} node {node['name']}"
    view = build_view(data, node)
    if not node["children"]:
        value = node["value"]
        decision = f"return leaf {value}"
        return value

    if maximizing:
        value = -999
        for index, child in enumerate(node["children"]):
            child_value = alpha_beta(child, alpha, beta, False)
            value = max(value, child_value)
            alpha = max(alpha, value)
            node["alpha"] = alpha
            node["beta"] = beta
            if alpha >= beta:
                for skipped in node["children"][index + 1:]:
                    skipped["pruned"] = True
                decision = f"prune remaining children of {node['name']}"
                view = build_view(data, node)
                break
    else:
        value = 999
        for index, child in enumerate(node["children"]):
            child_value = alpha_beta(child, alpha, beta, True)
            value = min(value, child_value)
            beta = min(beta, value)
            node["alpha"] = alpha
            node["beta"] = beta
            if alpha >= beta:
                for skipped in node["children"][index + 1:]:
                    skipped["pruned"] = True
                decision = f"prune remaining children of {node['name']}"
                view = build_view(data, node)
                break

    node["value"] = value
    node["alpha"] = alpha
    node["beta"] = beta
    decision = f"{role} node {node['name']} keeps {value}"
    view = build_view(data, node)
    return value


score = alpha_beta(data, -999, 999, True)
`,
    watchVariables: ["view", "decision", "score"],
    variableConfigs: {
      view: { viewKind: "tree", depth: 4, viewOptions: { color } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
      score: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["adversarial", "alpha-beta", "minimax", "tree", "algorithm", "curriculum"],
  },
  {
    key: "kruskal-mst",
    title: "Kruskal MST",
    description: "Minimum spanning tree growth over a small undirected graph.",
    snippet: `nodes = ["A", "B", "C", "D"]
edges = [
    ("A", "B", 1),
    ("B", "C", 2),
    ("C", "D", 3),
    ("A", "C", 4),
    ("B", "D", 5),
]
graph_state = {
    "nodes": list(nodes),
    "edges": [],
    "directed": False,
}
chosen = []
parent = {node: node for node in nodes}
rank = {node: 0 for node in nodes}


def find(node):
    while parent[node] != node:
        parent[node] = parent[parent[node]]
        node = parent[node]
    return node


def union(left, right):
    root_left = find(left)
    root_right = find(right)
    if root_left == root_right:
        return False
    if rank[root_left] < rank[root_right]:
        parent[root_left] = root_right
    elif rank[root_left] > rank[root_right]:
        parent[root_right] = root_left
    else:
        parent[root_right] = root_left
        rank[root_left] += 1
    return True


for source, target, weight in sorted(edges, key=lambda item: item[2]):
    if not union(source, target):
        continue
    graph_state["edges"].append({"source": source, "target": target, "label": str(weight)})
    chosen.append(f"{source}-{target}:{weight}")
`,
    watchVariables: ["graph_state", "chosen", "parent"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
      chosen: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      parent: { viewKind: "table", depth: 2, viewOptions: { color } },
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
    "nodes": list(nodes),
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
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
dist = {node: None for node in graph}
dist["A"] = 0
visited_order = []
unvisited = set(graph)
parent = {"A": None}

for source, neighbors in graph.items():
    for target, weight in neighbors.items():
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": str(weight),
            "color": "#cbd5e1",
        })

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
            parent[nxt] = current
            graph_state["edges"] = [
                {
                    "source": source,
                    "target": target,
                    "label": str(edge_weight),
                    "color": "#2563eb" if parent.get(target) == source else "#cbd5e1",
                }
                for source, neighbors in graph.items()
                for target, edge_weight in neighbors.items()
            ]
`,
    watchVariables: ["graph_state", "dist", "visited_order"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
graph_state = {
    "nodes": list(graph.keys()),
    "edges": [],
    "directed": True,
}
queue = ["A"]
dist = {"A": 0, "B": None, "C": None, "D": None, "E": None, "F": None}
parent = {"A": None, "B": None, "C": None, "D": None, "E": None, "F": None}

for source, neighbors in graph.items():
    for target in neighbors:
        graph_state["edges"].append({
            "source": source,
            "target": target,
            "label": "",
            "color": "#cbd5e1",
        })

while queue:
    node = queue.pop(0)
    for nxt in graph[node]:
        if dist[nxt] is not None:
            continue
        dist[nxt] = dist[node] + 1
        parent[nxt] = node
        queue.append(nxt)
        graph_state["edges"] = [
            {
                "source": source,
                "target": target,
                "label": "",
                "color": "#2563eb" if parent.get(target) == source else "#cbd5e1",
            }
            for source, neighbors in graph.items()
            for target in neighbors
        ]
`,
    watchVariables: ["graph_state", "queue", "dist", "parent"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
graph_state = {
    "nodes": ["A", "B", "C", "D"],
    "edges": [],
    "directed": True,
}
dist = {"A": 0, "B": None, "C": None, "D": None}
rounds = []
parent = {"A": None}

for source, target, weight in edges:
    graph_state["edges"].append({
        "source": source,
        "target": target,
        "label": str(weight),
        "color": "#cbd5e1",
    })

for _ in range(3):
    for source, target, weight in edges:
        if dist[source] is None:
            continue
        next_distance = dist[source] + weight
        if dist[target] is None or next_distance < dist[target]:
            dist[target] = next_distance
            parent[target] = source
            graph_state["edges"] = [
                {
                    "source": edge_source,
                    "target": edge_target,
                    "label": str(edge_weight),
                    "color": "#2563eb" if parent.get(edge_target) == edge_source else "#cbd5e1",
                }
                for edge_source, edge_target, edge_weight in edges
            ]
    rounds.append(dict(dist))
`,
    watchVariables: ["graph_state", "dist", "rounds"],
    variableConfigs: {
      graph_state: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
    snippet: `trie = {}
root = {"label": "*", "children": []}
path = []
words = []


def insert(word):
    node = trie
    for char in word:
        node = node.setdefault(char, {})
    node["$"] = {}


def snapshot(node, label="*"):
    children = []
    for char in sorted(key for key in node if key != "$"):
        child_label = char
        if "$" in node[char]:
            child_label += "*"
        children.append(snapshot(node[char], child_label))
    return {"label": label, "children": children}


for word in ["cat", "car", "dog"]:
    insert(word)
    words.append(word)
    root = snapshot(trie)

target = "car"
node = trie
path = []
for char in target:
    if char not in node:
        break
    path.append(char)
    node = node[char]
    root = snapshot(trie)
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
  {
    key: "decision-tree-learning",
    title: "Decision Tree Learning: Information Gain",
    description: "Computes information gain for a toy dataset and builds a one-split decision tree.",
    snippet: `import math

samples = [
    {"outlook": "sunny", "windy": False, "play": "no"},
    {"outlook": "sunny", "windy": True, "play": "no"},
    {"outlook": "overcast", "windy": False, "play": "yes"},
    {"outlook": "rain", "windy": False, "play": "yes"},
    {"outlook": "rain", "windy": True, "play": "no"},
]
dataset_rows = [[row["outlook"], row["windy"], row["play"]] for row in samples]
features = ["outlook", "windy"]
gains = {}
conditional_entropy = {}
partitions = {}
model = {"label": "?", "children": []}
split_summary = []
leaf_counts = {}


def entropy(rows):
    counts = {}
    for row in rows:
        label = row["play"]
        counts[label] = counts.get(label, 0) + 1
    total = len(rows)
    value = 0.0
    for count in counts.values():
        probability = count / total
        value -= probability * math.log2(probability)
    return round(value, 3)


base_entropy = entropy(samples)
for feature in features:
    groups = {}
    for row in samples:
        groups.setdefault(str(row[feature]), []).append(row)
    conditional = 0.0
    for rows in groups.values():
        conditional += len(rows) / len(samples) * entropy(rows)
    gains[feature] = round(base_entropy - conditional, 3)
    partitions[feature] = groups

best_feature = max(gains, key=gains.get)
conditional_entropy = {
    feature: round(base_entropy - gain, 3)
    for feature, gain in gains.items()
}
model = {"label": f"{best_feature} gain={gains[best_feature]}", "children": []}
for feature_value, rows in sorted(partitions[best_feature].items()):
    positive = sum(1 for row in rows if row["play"] == "yes")
    negative = len(rows) - positive
    prediction = "yes" if positive >= negative else "no"
    leaf_counts[feature_value] = len(rows)
    split_summary.append(f"{feature_value}: {positive} yes / {negative} no")
    model["children"].append({"label": f"{feature_value} ({len(rows)}) -> {prediction}", "children": []})
`,
    watchVariables: ["dataset_rows", "gains", "best_feature", "split_summary", "model"],
    variableConfigs: {
      dataset_rows: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      gains: { viewKind: "table", depth: 2, viewOptions: { color } },
      best_feature: { viewKind: "auto", depth: null, viewOptions: { color } },
      split_summary: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      model: { viewKind: "tree", depth: 3, viewOptions: { color } },
    },
    tags: ["machine learning", "decision tree", "algorithm", "curriculum"],
  },
  {
    key: "decision-tree-pruning-max-depth",
    title: "Decision Tree Pruning: Max Depth Limit",
    description: "Applies a max-depth constraint and stops deeper splits once the limit is reached.",
    snippet: `samples = [
    {"experience": "senior", "interview": "good", "skills": "high", "hire": "yes"},
    {"experience": "advanced", "interview": "bad", "skills": "high", "hire": "yes"},
    {"experience": "junior", "interview": "good", "skills": "mid", "hire": "yes"},
    {"experience": "junior", "interview": "bad", "skills": "high", "hire": "no"},
    {"experience": "junior", "interview": "bad", "skills": "mid", "hire": "no"},
]
dataset_rows = [[row["experience"], row["interview"], row["skills"], row["hire"]] for row in samples]
max_depth = 1
active_depth = 0
stops = []
model = {"label": "experience", "children": []}

groups = {}
for row in samples:
    groups.setdefault(row["experience"], []).append(row)

for value, rows in sorted(groups.items()):
    active_depth = 1
    labels = [row["hire"] for row in rows]
    if active_depth >= max_depth:
        yes_count = labels.count("yes")
        no_count = labels.count("no")
        prediction = "yes" if yes_count >= no_count else "no"
        stops.append(f"{value}: stop at depth {active_depth}")
        model["children"].append({"label": f"{value}->{prediction}", "children": []})
    else:
        model["children"].append({"label": value, "children": []})
`,
    watchVariables: ["dataset_rows", "max_depth", "active_depth", "stops", "model"],
    variableConfigs: {
      dataset_rows: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      max_depth: { viewKind: "auto", depth: null, viewOptions: { color } },
      active_depth: { viewKind: "auto", depth: null, viewOptions: { color } },
      stops: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      model: { viewKind: "tree", depth: 3, viewOptions: { color } },
    },
    tags: ["machine learning", "decision tree", "pruning", "curriculum"],
  },
  {
    key: "decision-tree-pruning-min-sample-leaves",
    title: "Decision Tree Pruning: Min Samples per Leaf",
    description: "Blocks leaves that would end up below a minimum sample threshold.",
    snippet: `samples = [
    {"experience": "senior", "interview": "good", "skills": "high", "hire": "yes"},
    {"experience": "senior", "interview": "good", "skills": "mid", "hire": "yes"},
    {"experience": "advanced", "interview": "good", "skills": "high", "hire": "yes"},
    {"experience": "advanced", "interview": "good", "skills": "mid", "hire": "yes"},
    {"experience": "junior", "interview": "good", "skills": "mid", "hire": "yes"},
    {"experience": "junior", "interview": "bad", "skills": "high", "hire": "no"},
    {"experience": "junior", "interview": "bad", "skills": "mid", "hire": "no"},
]
dataset_rows = [[row["experience"], row["interview"], row["skills"], row["hire"]] for row in samples]
min_samples_leaf = 2
leaf_sizes = {}
stops = []
model = {"label": "experience", "children": []}

groups = {}
for row in samples:
    groups.setdefault(row["experience"], []).append(row)

for value, rows in sorted(groups.items()):
    leaf_sizes[value] = len(rows)
    if len(rows) < min_samples_leaf:
        stops.append(f"{value}: prune leaf of size {len(rows)}")
        continue
    yes_count = sum(1 for row in rows if row["hire"] == "yes")
    no_count = len(rows) - yes_count
    prediction = "yes" if yes_count >= no_count else "no"
    model["children"].append({"label": f"{value}->{prediction}", "children": []})
`,
    watchVariables: ["dataset_rows", "min_samples_leaf", "leaf_sizes", "stops", "model"],
    variableConfigs: {
      dataset_rows: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      min_samples_leaf: { viewKind: "auto", depth: null, viewOptions: { color } },
      leaf_sizes: { viewKind: "table", depth: 2, viewOptions: { color } },
      stops: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      model: { viewKind: "tree", depth: 3, viewOptions: { color } },
    },
    tags: ["machine learning", "decision tree", "pruning", "curriculum"],
  },
  {
    key: "linear-regression-gradient-descent",
    title: "Linear Regression Gradient Descent",
    description: "Fits a simple linear model while tracking predictions and loss.",
    snippet: `points = [[1, 2], [2, 3], [3, 5], [4, 4]]
weights = {"m": 0.0, "b": 0.0}
predictions = []
loss_history = []
learning_rate = 0.1
residuals = []
gradient = {"m": 0.0, "b": 0.0}
iteration = 0
line_equation = "y = 0.0x + 0.0"

for iteration in range(1, 5):
    predictions = [round(weights["m"] * x + weights["b"], 3) for x, _y in points]
    errors = [prediction - y for prediction, (_x, y) in zip(predictions, points)]
    residuals = [round(error, 3) for error in errors]
    loss = sum(error * error for error in errors) / len(points)
    loss_history.append(round(loss, 3))
    grad_m = sum(2 * error * x for error, (x, _y) in zip(errors, points)) / len(points)
    grad_b = sum(2 * error for error in errors) / len(points)
    gradient = {"m": round(grad_m, 3), "b": round(grad_b, 3)}
    line_equation = f"y = {weights['m']}x + {weights['b']}"
    weights["m"] = round(weights["m"] - learning_rate * grad_m, 3)
    weights["b"] = round(weights["b"] - learning_rate * grad_b, 3)
`,
    watchVariables: ["points", "iteration", "line_equation", "weights", "gradient", "loss_history"],
    variableConfigs: {
      points: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      iteration: { viewKind: "auto", depth: null, viewOptions: { color } },
      line_equation: { viewKind: "auto", depth: null, viewOptions: { color } },
      weights: { viewKind: "table", depth: 2, viewOptions: { color } },
      gradient: { viewKind: "table", depth: 2, viewOptions: { color } },
      loss_history: { viewKind: "bar", depth: 1, viewOptions: { color } },
    },
    tags: ["machine learning", "linear regression", "regression", "algorithm", "curriculum"],
  },
  { key: "image", title: "Image", description: "Image view requires a browser-accessible asset path; this example is a placeholder.", snippet: `data = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'><rect width='120' height='80' fill='%23e0f2fe'/><text x='18' y='46' font-size='20' fill='%230f172a'>CodeFlow</text></svg>"\n`, watchVariables: ["data"], variableConfigs: variable("image", 1), tags: ["image", "asset required", "special"] },
];
