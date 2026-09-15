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
  { key: "plot", title: "Plot", description: "Plot view for numeric sequences.", snippet: `data = [1, 4, 2, 5, 3]\n`, watchVariables: ["data"], variableConfigs: variable("plot", 1), tags: ["array", "plot", "intro"] },
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
    title: "Breadth-First Search (BFS)",
    description: "Breadth-first tree search with an adjacency graph, an expanding search tree, and a FIFO frontier.",
    snippet: `from code_visualizer.structures import Graph, Tree

# Breadth-first search: frontier is a FIFO queue.
graph = Graph({
    "S": ["R", "F"],
    "R": ["S", "P"],
    "F": ["S", "B"],
    "P": ["R", "B"],
    "B": ["F", "P"],
}, labels={
    "S": "Sibiu",
    "R": "Rimnicu Vilcea",
    "F": "Fagaras",
    "P": "Pitesti",
    "B": "Bucharest",
})
search_tree = Tree("S")
frontier = ["S"]
state_nodes = {"S": "t0"}
visited = {"S"}
goal = "B"


while frontier:
    with step():
        current_state = frontier.pop(0)
        current_tree = state_nodes[current_state]
        graph = graph.highlight(current_state)
        search_tree = search_tree.highlight(current_tree)
    if current_state == goal:
        break

    for nxt in graph[current_state]:
        if nxt in visited:
            continue
        visited.add(nxt)
        search_tree, child_id = search_tree.add(current_tree, nxt)
        state_nodes[nxt] = child_id
        frontier.append(nxt)
`,
    watchVariables: ["graph", "search_tree", "frontier"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
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
    title: "Depth-First Search (DFS)",
    description: "Depth-first search with a Graph problem, an expanding Tree, and a LIFO frontier.",
    snippet: `from code_visualizer.structures import Graph, Tree

graph = Graph({
    "S": ["R", "F"],
    "R": ["S", "P"],
    "F": ["S", "B"],
    "P": ["R", "B"],
    "B": ["F", "P"],
}, labels={
    "S": "Sibiu",
    "R": "Rimnicu Vilcea",
    "F": "Fagaras",
    "P": "Pitesti",
    "B": "Bucharest",
})
search_tree = Tree("S")
frontier = ["S"]
state_nodes = {"S": "t0"}
visited = {"S"}
goal = "B"

while frontier:
    with step():
        current_state = frontier.pop()
        current_tree = state_nodes[current_state]
        graph = graph.highlight(current_state)
        search_tree = search_tree.highlight(current_tree)
    if current_state == goal:
        break

    for nxt in reversed(graph[current_state]):
        if nxt in visited:
            continue
        visited.add(nxt)
        search_tree, child_id = search_tree.add(current_tree, nxt)
        state_nodes[nxt] = child_id
        frontier.append(nxt)
`,
    watchVariables: ["graph", "search_tree", "frontier"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "dfs", "stack", "traversal", "curriculum"],
  },
  {
    key: "topological-sort-trace",
    title: "Topological Sort Trace",
    description: "Tracks in-degrees, queue state, and output order for a DAG.",
    snippet: `from code_visualizer.structures import Graph

graph = Graph({
    "A": ["C"],
    "B": ["C", "D"],
    "C": ["E"],
    "D": ["F"],
    "E": ["F"],
    "F": [],
}, directed=True)
in_degree = {"A": 0, "B": 0, "C": 2, "D": 1, "E": 1, "F": 2}
queue = ["A", "B"]
order = []

while queue:
    node = queue.pop(0)
    graph = graph.highlight(node)
    order.append(node)
    for nxt in graph[node]:
        in_degree[nxt] -= 1
        if in_degree[nxt] == 0:
            queue.append(nxt)
`,
    watchVariables: ["graph", "in_degree", "queue", "order"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
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
    snippet: `from code_visualizer.structures import Graph

graph = Graph({
    "A": ["B"],
    "B": ["A", "C"],
    "C": ["B"],
    "D": ["E"],
    "E": ["D"],
    "F": [],
})
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
        graph = graph.highlight(node)
        visited.append(node)
        component.append(node)
        for nxt in reversed(graph[node]):
            if nxt not in visited:
                stack.append(nxt)
    components.append(component)
`,
    watchVariables: ["graph", "visited", "components"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      visited: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      components: { viewKind: "matrix", depth: 2, viewOptions: { color } },
    },
    tags: ["graph", "traversal", "algorithm", "curriculum"],
  },
  {
    key: "a-star-search",
    title: "A* Search",
    description: "A* tree search on the lecture's Romania problem graph, with a priority-queue frontier ordered by f(n) = g(n) + h(n).",
    snippet: `from code_visualizer.structures import Graph, Tree

heuristic = {"S": 3, "R": 2, "F": 2, "P": 1, "B": 0}
graph = Graph({
    "S": {"R": 1, "F": 2},
    "R": {"P": 2, "S": 1},
    "F": {"B": 3, "S": 2},
    "P": {"R": 2, "B": 1},
    "B": {"F": 3, "P": 1},
}, labels={
    "S": "Sibiu (h=3)",
    "R": "Rimnicu Vilcea (h=2)",
    "F": "Fagaras (h=2)",
    "P": "Pitesti (h=1)",
    "B": "Bucharest (h=0)",
})
search_tree = Tree("S")
open_set = [("S", 0)]
frontier = {"S": "g=0, h=3, f=3"}
state_nodes = {"S": "t0"}
best_cost = {"S": 0}
visited = set()
goal = "B"

while open_set:
    open_set.sort(key=lambda item: item[1] + heuristic[item[0]])
    with step():
        current_state, current_cost = open_set.pop(0)
        frontier = {
            state: f"g={cost}, h={heuristic[state]}, f={cost + heuristic[state]}"
            for state, cost in open_set
        }
        current_tree = state_nodes[current_state]
        graph = graph.highlight(current_state)
        search_tree = search_tree.highlight(current_tree)
    if current_state in visited:
        continue
    if current_state == goal:
        break
    visited.add(current_state)
    for nxt, cost in graph[current_state].items():
        next_cost = current_cost + cost
        if nxt in visited or next_cost >= best_cost.get(nxt, float("inf")):
            continue
        best_cost[nxt] = next_cost
        search_tree, child_id = search_tree.add(
            current_tree,
            nxt,
            str(cost),
        )
        state_nodes[nxt] = child_id
        open_set.append((nxt, next_cost))
    frontier = {
        state: f"g={cost}, h={heuristic[state]}, f={cost + heuristic[state]}"
        for state, cost in open_set
    }
`,
    watchVariables: ["graph", "search_tree", "frontier"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "table", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "heuristic", "graph", "algorithm", "curriculum"],
  },
  {
    key: "uniform-cost-search",
    title: "Uniform-Cost Search",
    description: "Uniform-cost tree search on the lecture's Romania problem graph, with a priority-queue frontier ordered by path cost g(n).",
    snippet: `from code_visualizer.structures import Graph, Tree

graph = Graph({
    "S": {"F": 2, "R": 1},
    "R": {"S": 1, "P": 2},
    "F": {"S": 2, "B": 3},
    "P": {"R": 2, "B": 1},
    "B": {"F": 3, "P": 1},
}, labels={
    "S": "Sibiu",
    "R": "Rimnicu Vilcea",
    "F": "Fagaras",
    "P": "Pitesti",
    "B": "Bucharest",
})
search_tree = Tree("S")
frontier = [("S", 0)]
state_nodes = {"S": "t0"}
best_cost = {"S": 0}
goal = "B"

while frontier:
    frontier.sort(key=lambda item: item[1])
    with step():
        current_state, current_cost = frontier.pop(0)
        current_tree = state_nodes[current_state]
        graph = graph.highlight(current_state)
        search_tree = search_tree.highlight(current_tree)
    if current_cost != best_cost[current_state]:
        continue
    if current_state == goal:
        break

    for nxt, cost in graph[current_state].items():
        next_cost = current_cost + cost
        if next_cost >= best_cost.get(nxt, float("inf")):
            continue
        best_cost[nxt] = next_cost
        search_tree, child_id = search_tree.add(current_tree, nxt, str(cost))
        state_nodes[nxt] = child_id
        frontier.append((nxt, next_cost))
`,
    watchVariables: ["graph", "search_tree", "frontier"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "uniform cost", "graph", "algorithm", "curriculum"],
  },
  {
    key: "greedy-best-first-search",
    title: "Greedy Best-First Search",
    description: "Greedy best-first tree search on the lecture's Romania problem graph, ordered by h(n) only.",
    snippet: `from code_visualizer.structures import Graph, Tree

heuristic = {"S": 3, "R": 2, "F": 2, "P": 1, "B": 0}
graph = Graph({
    "S": ["R", "F"],
    "R": ["P", "S"],
    "F": ["B", "S"],
    "P": ["R", "B"],
    "B": ["F", "P"],
}, labels={
    "S": "Sibiu (h=3)",
    "R": "Rimnicu Vilcea (h=2)",
    "F": "Fagaras (h=2)",
    "P": "Pitesti (h=1)",
    "B": "Bucharest (h=0)",
})
search_tree = Tree("S")
frontier = ["S"]
state_nodes = {"S": "t0"}
visited = {"S"}
goal = "B"

while frontier:
    frontier.sort(key=lambda node: heuristic[node])
    with step():
        current_state = frontier.pop(0)
        current_tree = state_nodes[current_state]
        graph = graph.highlight(current_state)
        search_tree = search_tree.highlight(current_tree)
    if current_state == goal:
        break

    for nxt in graph[current_state]:
        if nxt in visited:
            continue
        visited.add(nxt)
        search_tree, child_id = search_tree.add(current_tree, nxt, f"h={heuristic[nxt]}")
        state_nodes[nxt] = child_id
        frontier.append(nxt)
`,
    watchVariables: ["graph", "search_tree", "frontier"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "greedy", "heuristic", "graph", "algorithm", "curriculum"],
  },
  {
    key: "a-star-with-visited-memory",
    title: "A* Search (Graph Search)",
    description: "A* graph search on the lecture's Romania problem graph, using a closed set to avoid re-expanding explored states.",
    snippet: `from code_visualizer.structures import Graph, Tree

heuristic = {"S": 3, "R": 2, "F": 2, "P": 1, "B": 0}
graph = Graph({
    "S": {"R": 1, "F": 2},
    "R": {"P": 2, "S": 1},
    "F": {"B": 3, "S": 2},
    "P": {"R": 2, "B": 1},
    "B": {"F": 3, "P": 1},
}, labels={
    "S": "Sibiu (h=3)",
    "R": "Rimnicu Vilcea (h=2)",
    "F": "Fagaras (h=2)",
    "P": "Pitesti (h=1)",
    "B": "Bucharest (h=0)",
})
search_tree = Tree("S")
open_set = [("S", 0)]
frontier = {"S": "g=0, h=3, f=3"}
state_nodes = {"S": "t0"}
g_score = {"S": 0}
closed_set = []

while open_set:
    open_set.sort(key=lambda item: item[1] + heuristic[item[0]])
    with step():
        current, current_cost = open_set.pop(0)
        frontier = {
            state: f"g={cost}, h={heuristic[state]}, f={cost + heuristic[state]}"
            for state, cost in open_set
        }
        current_tree = state_nodes[current]
        graph = graph.highlight(current)
        search_tree = search_tree.highlight(current_tree)
    if current in closed_set:
        continue
    closed_set.append(current)
    if current == "B":
        break
    for nxt, weight in graph[current].items():
        if nxt in closed_set:
            continue
        next_cost = current_cost + weight
        if nxt not in g_score or next_cost < g_score[nxt]:
            g_score[nxt] = next_cost
            open_set.append((nxt, next_cost))
            search_tree, child_id = search_tree.add(
                current_tree,
                nxt,
                str(weight),
            )
            state_nodes[nxt] = child_id
    frontier = {
        state: f"g={cost}, h={heuristic[state]}, f={cost + heuristic[state]}"
        for state, cost in open_set
    }
`,
    watchVariables: ["graph", "search_tree", "frontier", "closed_set"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "table", depth: 2, viewOptions: { color } },
      g_score: { viewKind: "table", depth: 2, viewOptions: { color } },
      closed_set: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "heuristic", "a*", "graph", "algorithm", "curriculum"],
  },
  {
    key: "depth-limited-search",
    title: "Depth-Limited Search (DLS)",
    description: "Depth-limited tree search on the lecture's Romania problem graph, with depth limit l = 2.",
    snippet: `from code_visualizer.structures import Graph, Tree

graph = Graph({
    "S": ["R", "F"],
    "R": ["P", "S"],
    "F": ["B", "S"],
    "P": ["R", "B"],
    "B": ["F", "P"],
}, labels={
    "S": "Sibiu",
    "R": "Rimnicu Vilcea",
    "F": "Fagaras",
    "P": "Pitesti",
    "B": "Bucharest",
})
search_tree = Tree("S")
frontier = [(["S"], 0)]
state_nodes = {("S",): "t0"}
depth_limit = 2

while frontier:
    with step():
        current_path, depth = frontier.pop()
        current_state = current_path[-1]
        current_tree = state_nodes[tuple(current_path)]
        graph = graph.highlight(current_state)
        search_tree = search_tree.highlight(current_tree)
    if depth == depth_limit:
        continue
    for nxt in graph[current_state]:
        child_path = current_path + [nxt]
        search_tree, child_id = search_tree.add(current_tree, nxt)
        state_nodes[tuple(child_path)] = child_id
        frontier.append((child_path, depth + 1))
`,
    watchVariables: ["graph", "search_tree", "frontier", "depth_limit"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      depth_limit: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["search", "depth-limited", "dfs", "algorithm", "curriculum"],
  },
  {
    key: "iterative-deepening-search",
    title: "Iterative Deepening Search (IDS)",
    description: "Iterative deepening tree search on the lecture's Romania problem graph, trying depth limits 0, 1, and 2.",
    snippet: `from code_visualizer.structures import Graph, Tree

graph = Graph({
    "S": ["R", "F"],
    "R": ["P", "S"],
    "F": ["B", "S"],
    "P": ["R", "B"],
    "B": ["F", "P"],
}, labels={
    "S": "Sibiu",
    "R": "Rimnicu Vilcea",
    "F": "Fagaras",
    "P": "Pitesti",
    "B": "Bucharest",
})
search_tree = Tree("S")
frontier = []
goal = "B"
depth_limit = 0

for depth_limit in range(3):
    frontier = [(["S"], 0)]
    search_tree = Tree("S")
    state_nodes = {("S",): "t0"}
    while frontier:
        with step():
            current_path, depth = frontier.pop()
            current_state = current_path[-1]
            current_tree = state_nodes[tuple(current_path)]
            graph = graph.highlight(current_state)
            search_tree = search_tree.highlight(current_tree)
        if current_state == goal:
            frontier = []
            break
        if depth == depth_limit:
            continue
        for nxt in graph[current_state]:
            child_path = current_path + [nxt]
            search_tree, child_id = search_tree.add(current_tree, nxt)
            state_nodes[tuple(child_path)] = child_id
            frontier.append((child_path, depth + 1))
    if current_state == goal:
        break
`,
    watchVariables: ["graph", "search_tree", "frontier", "depth_limit"],
    variableConfigs: {
      graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      depth_limit: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["search", "iterative deepening", "dfs", "algorithm", "curriculum"],
  },
  {
    key: "hill-climbing-trace",
    title: "Hill Climbing Algorithm",
    description: "Steepest-ascent hill climbing on representative 4-Queens states: choose the highest-eval neighbor and stop at a local maximum.",
    snippet: `from code_visualizer.structures import Graph


def board(positions):
    return [["Q" if positions[column] == row else "." for column in range(4)] for row in range(4)]


states = {
    "A": {"board": board([1, 1, 1, 1]), "eval": 0},
    "B": {"board": board([0, 1, 1, 1]), "eval": 2},
    "C": {"board": board([1, 0, 1, 1]), "eval": 1},
    "D": {"board": board([1, 1, 0, 1]), "eval": 1},
    "E": {"board": board([0, 2, 1, 1]), "eval": 4},
    "F": {"board": board([0, 1, 0, 1]), "eval": 1},
    "K": {"board": board([0, 1, 3, 1]), "eval": 4},
    "G": {"board": board([0, 2, 3, 1]), "eval": 5},
    "H": {"board": board([0, 2, 0, 1]), "eval": 4},
    "L": {"board": board([0, 2, 1, 3]), "eval": 4},
    "I": {"board": board([0, 2, 2, 1]), "eval": 3},
    "J": {"board": board([0, 3, 3, 1]), "eval": 4},
    "M": {"board": board([0, 2, 3, 0]), "eval": 3},
}
neighbors = {
    "A": ["B", "C", "D"], "B": ["E", "F", "K"],
    "E": ["G", "H", "L"], "G": ["I", "J", "M"],
}
visible_states = {
    "A": ["A", "B", "C", "D"],
    "B": ["A", "B", "C", "D", "E", "F", "K"],
    "E": ["A", "B", "C", "D", "E", "F", "K", "G", "H", "L"],
    "G": ["A", "B", "C", "D", "E", "F", "K", "G", "H", "L", "I", "J", "M"],
}
current_state = "A"
decision = "start"


def make_state_space(current, best_successor):
    visible = visible_states[current]
    adjacency = {}
    labels = {}
    for state in visible:
        adjacency[state] = {
            target: "best" if state == current and target == best_successor else ""
            for target in neighbors.get(state, [])
            if target in visible
        }
        labels[state] = {"board": states[state]["board"], "eval": states[state]["eval"]}
    return Graph(adjacency, labels=labels, directed=True).highlight(current)


while True:
    candidates = neighbors[current_state]
    best_successor = max(candidates, key=lambda state: states[state]["eval"])
    current_eval = states[current_state]["eval"]
    best_eval = states[best_successor]["eval"]
    with step():
        state_space = make_state_space(current_state, best_successor)
        decision = f"best neighbor: {current_eval} -> {best_eval}"

    if best_eval <= current_eval:
        with step():
            decision = "stop: no higher-eval successor"
        break

    current_state = best_successor
`,
    watchVariables: ["state_space", "decision"],
    variableConfigs: {
      state_space: { viewKind: "graph", depth: 4, viewOptions: { color } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["local search", "hill climbing", "algorithm", "curriculum"],
  },
  {
    key: "bidirectional-search",
    title: "Bidirectional Search",
    description: "Bidirectional search with two frontiers over a problem graph and a merged search tree.",
    snippet: `graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "E"],
    "D": ["B", "F"],
    "E": ["C", "F"],
    "F": ["D", "E", "G"],
    "G": ["F"],
}
problem_graph = {
    "nodes": list(graph.keys()),
    "edges": [
        {"source": source, "target": target, "label": ""}
        for source, neighbors in graph.items()
        for target in neighbors
        if source < target
    ],
    "directed": False,
}
search_tree = {"nodes": ["A", "G"], "edges": [], "directed": False}
frontier_forward = ["A"]
frontier_backward = ["G"]
parent_start = {"A": None}
parent_goal = {"G": None}
meet = None
current = "A"
current_side = "forward"


def mark():
    forward_nodes = set(frontier_forward)
    backward_nodes = set(frontier_backward)
    problem_graph["nodes"] = [
        {
            "id": node,
            "label": (
                f"[{node}]"
                if node == meet
                else f">{node}"
                if node == current and current_side == "forward"
                else f"<{node}"
                if node == current and current_side == "backward"
                else f"F:{node}"
                if node in forward_nodes and node not in backward_nodes
                else f"B:{node}"
                if node in backward_nodes and node not in forward_nodes
                else node
            ),
        }
        for node in graph
    ]


def grow_tree():
    nodes = []
    for node in sorted(set(parent_start) | set(parent_goal)):
        label = node
        if node == meet:
            label = f"[{node}]"
        elif node in parent_start and node in parent_goal:
            label = f"FB:{node}"
        elif node in parent_start:
            label = f"F:{node}"
        elif node in parent_goal:
            label = f"B:{node}"
        nodes.append({"id": node, "label": label})
    search_tree["nodes"] = nodes
    search_tree["edges"] = [
        {"source": source, "target": node, "color": "#2563eb"}
        for node, source in parent_start.items()
        if source is not None
    ] + [
        {"source": source, "target": node, "color": "#dc2626"}
        for node, source in parent_goal.items()
        if source is not None
    ]


mark()
while frontier_forward and frontier_backward and meet is None:
    current_side = "forward"
    current = frontier_forward.pop(0)
    mark()
    for nxt in graph[current]:
        if nxt not in parent_start:
            parent_start[nxt] = current
            frontier_forward.append(nxt)
            grow_tree()
        if nxt in parent_goal:
            meet = nxt
            mark()
            break
    if meet is not None:
        break

    current_side = "backward"
    current = frontier_backward.pop(0)
    mark()
    for nxt in graph[current]:
        if nxt not in parent_goal:
            parent_goal[nxt] = current
            frontier_backward.append(nxt)
            grow_tree()
        if nxt in parent_start:
            meet = nxt
            mark()
            break
`,
    watchVariables: ["problem_graph", "search_tree", "frontier_forward", "frontier_backward"],
    variableConfigs: {
      problem_graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier_forward: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      frontier_backward: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
    },
    tags: ["search", "bidirectional", "graph", "algorithm", "curriculum"],
  },
  {
    key: "beam-search",
    title: "Beam Search",
    description: "Beam search with a problem graph, an evolving search tree, and a frontier capped by beam width.",
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
problem_graph = {
    "nodes": list(graph.keys()),
    "edges": [
        {"source": source, "target": target, "label": str(heuristic[target])}
        for source, neighbors in graph.items()
        for target in neighbors
    ],
    "directed": True,
}
search_tree = {"nodes": ["S"], "edges": [], "directed": True}
frontier = ["S"]
candidates = []
selected = []
rejected = []
parent = {"S": None}
beam_width = 2
current = "S"
decision = "start"


def mark():
    frontier_nodes = set(frontier)
    candidate_nodes = set(candidates)
    selected_nodes = set(selected)
    rejected_nodes = set(rejected)
    problem_graph["nodes"] = [
        {
            "id": node,
            "label": (
                f"[{node}]"
                if node == current
                else f"K:{node}"
                if node in selected_nodes
                else f"X:{node}"
                if node in rejected_nodes
                else f"F:{node}"
                if node in frontier_nodes
                else f"N:{node}"
                if node in candidate_nodes
                else node
            ),
        }
        for node in graph
    ]


def grow_tree():
    frontier_nodes = set(frontier)
    candidate_nodes = set(candidates)
    selected_nodes = set(selected)
    rejected_nodes = set(rejected)
    search_tree["nodes"] = [
        {
            "id": node,
            "label": (
                f"[{node}]"
                if node == current
                else f"K:{node}"
                if node in selected_nodes
                else f"X:{node}"
                if node in rejected_nodes
                else f"F:{node}"
                if node in frontier_nodes
                else f"N:{node}"
                if node in candidate_nodes
                else node
            ),
        }
        for node in parent
    ]
    search_tree["edges"] = [
        {"source": source, "target": node, "label": str(heuristic[node])}
        for node, source in parent.items()
        if source is not None
    ]


mark()
while frontier:
    if "Goal" in frontier:
        break
    candidates = []
    selected = []
    rejected = []
    for current in frontier:
        mark()
        for nxt in graph[current]:
            if nxt not in candidates:
                if nxt not in parent:
                    parent[nxt] = current
                    grow_tree()
                candidates.append(nxt)
                decision = f"expand {current} -> {nxt} (h={heuristic[nxt]})"
                mark()
    candidates.sort(key=lambda node: heuristic[node])
    selected = candidates[:beam_width]
    rejected = candidates[beam_width:]
    decision = f"keep {selected} drop {rejected}"
    frontier = selected
    grow_tree()
    mark()
`,
    watchVariables: ["problem_graph", "search_tree", "frontier", "decision"],
    variableConfigs: {
      problem_graph: { viewKind: "graph", depth: 3, viewOptions: { color } },
      search_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
      frontier: { viewKind: "array_cells", depth: 2, viewOptions: { color } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["search", "beam search", "heuristic", "graph", "algorithm", "curriculum"],
  },
  {
    key: "simulated-annealing",
    title: "Simulated Annealing",
    description: "Probabilistic local search that accepts worse successors with probability exp(delta / temperature) while cooling.",
    snippet: `import math

size = 4
proposals = [
    [1, 0, 0, 0],
    [1, 3, 0, 0],
    [1, 2, 0, 0],
    [1, 3, 0, 2],
]
random_values = [0.2, 0.8, 0.3, 0.6]
current_state = [0, 0, 0, 0]
current_board = []
candidate_state = [0, 0, 0, 0]
candidate_board = []
temperature = 8
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


def evaluate(state):
    return -conflicts(state)


current_board = make_board(current_state)
candidate_board = make_board(candidate_state)

for index, candidate_state in enumerate(proposals):
    candidate_board = make_board(candidate_state)
    delta = evaluate(candidate_state) - evaluate(current_state)
    probability = 1.0 if delta >= 0 else math.exp(delta / temperature)
    if random_values[index] < probability:
        accept = True
    else:
        accept = False
    decision = f"delta={delta}, p={probability:.2f}: {'accept' if accept else 'reject'}"
    if accept:
        current_state = candidate_state
        current_board = make_board(current_state)
    temperature -= 2
`,
    watchVariables: ["current_board", "candidate_board", "temperature", "decision"],
    variableConfigs: {
      current_board: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      candidate_board: { viewKind: "matrix", depth: 2, viewOptions: { color } },
      temperature: { viewKind: "auto", depth: null, viewOptions: { color } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["local search", "simulated annealing", "heuristic", "algorithm", "curriculum"],
  },
  {
    key: "minimax-tree",
    title: "Minimax",
    description: "Minimax on a near-terminal Tic-Tac-Toe position: X maximizes and O minimizes utility discovered at terminal boards.",
    snippet: `from code_visualizer.structures import Tree

board = [
    [" ", " ", " "],
    ["X", "X", "O"],
    ["X", "O", "O"],
]
MAX_PLAYER = "X"
MIN_PLAYER = "O"
initial_state = (tuple(cell for row in board for cell in row), MAX_PLAYER)
game_tree = Tree(board)
decision = "X is MAX (+1); O is MIN (-1)"


def as_board(cells):
    return [list(cells[0:3]), list(cells[3:6]), list(cells[6:9])]


def winner(cells):
    lines = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6),
             (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
    for left, middle, right in lines:
        if cells[left] != " " and cells[left] == cells[middle] == cells[right]:
            return cells[left]
    return None


def is_terminal(state):
    cells, _ = state
    return winner(cells) is not None or " " not in cells


def utility(state):
    cells, _ = state
    result = winner(cells)
    return 1 if result == MAX_PLAYER else -1 if result == MIN_PLAYER else 0


def expand(state):
    cells, player = state
    next_player = MIN_PLAYER if player == MAX_PLAYER else MAX_PLAYER
    successors = []
    for action, cell in enumerate(cells):
        if cell == " ":
            next_cells = cells[:action] + (player,) + cells[action + 1:]
            successors.append((action + 1, (next_cells, next_player)))
    return successors


def max_value(state, tree_node):
    global decision, game_tree
    if is_terminal(state):
        value = utility(state)
        with step():
            game_tree = game_tree.with_annotation(tree_node, f"utility = {value}").highlight(tree_node)
            decision = f"terminal utility = {value}"
        return None, value

    best_action = None
    v = float("-inf")
    for action, next_state in expand(state):
        with step():
            game_tree, child = game_tree.add(tree_node, as_board(next_state[0]), f"X to {action}")
            game_tree = game_tree.highlight(child)
        _, next_value = min_value(next_state, child)
        if next_value > v:
            v = next_value
            best_action = action
    with step():
        game_tree = game_tree.with_annotation(tree_node, f"value = {v}").highlight(tree_node)
        decision = f"X chooses square {best_action}; backed-up value = {v}"
    return best_action, v


def min_value(state, tree_node):
    global decision, game_tree
    if is_terminal(state):
        value = utility(state)
        with step():
            game_tree = game_tree.with_annotation(tree_node, f"utility = {value}").highlight(tree_node)
            decision = f"terminal utility = {value}"
        return None, value

    best_action = None
    v = float("inf")
    for action, next_state in expand(state):
        with step():
            game_tree, child = game_tree.add(tree_node, as_board(next_state[0]), f"O to {action}")
            game_tree = game_tree.highlight(child)
        _, next_value = max_value(next_state, child)
        if next_value < v:
            v = next_value
            best_action = action
    with step():
        game_tree = game_tree.with_annotation(tree_node, f"value = {v}").highlight(tree_node)
        decision = f"O chooses square {best_action}; backed-up value = {v}"
    return best_action, v


def minimax(state):
    global game_tree
    with step():
        game_tree = game_tree.highlight("t0")
    action, value = max_value(state, "t0")
    return action


best_action = minimax(initial_state)
`,
    watchVariables: ["game_tree", "decision"],
    variableConfigs: {
      game_tree: { viewKind: "graph", depth: 4, viewOptions: { color, graphDirection: "TB" } },
      decision: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["adversarial", "minimax", "tree", "algorithm", "curriculum"],
  },
  {
    key: "alpha-beta-pruning",
    title: "Alpha-Beta Pruning",
    description: "Minimax with alpha-beta pruning, including cut-off events in the trace.",
    snippet: `from code_visualizer.structures import Tree

board = [
    [" ", " ", " "],
    ["X", "X", "O"],
    ["X", "O", "O"],
]
MAX_PLAYER = "X"
MIN_PLAYER = "O"
initial_state = (tuple(cell for row in board for cell in row), MAX_PLAYER)
game_tree = Tree(board)
decision = "X is MAX (+1); O is MIN (-1)"


def as_board(cells):
    return [list(cells[0:3]), list(cells[3:6]), list(cells[6:9])]


def winner(cells):
    lines = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6),
             (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
    for left, middle, right in lines:
        if cells[left] != " " and cells[left] == cells[middle] == cells[right]:
            return cells[left]
    return None


def is_terminal(state):
    cells, _ = state
    return winner(cells) is not None or " " not in cells


def utility(state):
    result = winner(state[0])
    return 1 if result == MAX_PLAYER else -1 if result == MIN_PLAYER else 0


def expand(state):
    cells, player = state
    next_player = MIN_PLAYER if player == MAX_PLAYER else MAX_PLAYER
    return [
        (action + 1, (cells[:action] + (player,) + cells[action + 1:], next_player))
        for action, cell in enumerate(cells) if cell == " "
    ]


def max_value(state, tree_node, alpha, beta):
    global decision, game_tree
    if is_terminal(state):
        value = utility(state)
        with step():
            game_tree = game_tree.with_annotation(tree_node, f"utility = {value}").highlight(tree_node)
            decision = f"terminal utility = {value}"
        return None, value

    best_action = None
    v = float("-inf")
    successors = expand(state)
    for index, (action, next_state) in enumerate(successors):
        with step():
            game_tree, child = game_tree.add(tree_node, as_board(next_state[0]), f"X to {action}")
            game_tree = game_tree.highlight(child)
        _, next_value = min_value(next_state, child, alpha, beta)
        if next_value > v:
            v, best_action = next_value, action
        alpha = max(alpha, v)
        with step():
            game_tree = game_tree.with_annotation(tree_node, f"value = {v}; alpha = {alpha}; beta = {beta}").highlight(tree_node)
            decision = f"X keeps {action}; alpha = {alpha}"
        if alpha >= beta:
            for skipped_action, skipped_state in successors[index + 1:]:
                game_tree, skipped = game_tree.add(tree_node, as_board(skipped_state[0]), f"X to {skipped_action}", annotation="pruned")
            with step():
                game_tree = game_tree.highlight(tree_node)
                decision = f"alpha >= beta: prune remaining moves from X"
            break
    return best_action, v


def min_value(state, tree_node, alpha, beta):
    global decision, game_tree
    if is_terminal(state):
        value = utility(state)
        with step():
            game_tree = game_tree.with_annotation(tree_node, f"utility = {value}").highlight(tree_node)
            decision = f"terminal utility = {value}"
        return None, value

    best_action = None
    v = float("inf")
    successors = expand(state)
    for index, (action, next_state) in enumerate(successors):
        with step():
            game_tree, child = game_tree.add(tree_node, as_board(next_state[0]), f"O to {action}")
            game_tree = game_tree.highlight(child)
        _, next_value = max_value(next_state, child, alpha, beta)
        if next_value < v:
            v, best_action = next_value, action
        beta = min(beta, v)
        with step():
            game_tree = game_tree.with_annotation(tree_node, f"value = {v}; alpha = {alpha}; beta = {beta}").highlight(tree_node)
            decision = f"O keeps {action}; beta = {beta}"
        if alpha >= beta:
            for skipped_action, skipped_state in successors[index + 1:]:
                game_tree, skipped = game_tree.add(tree_node, as_board(skipped_state[0]), f"O to {skipped_action}", annotation="pruned")
            with step():
                game_tree = game_tree.highlight(tree_node)
                decision = f"alpha >= beta: prune remaining moves from O"
            break
    return best_action, v


def alpha_beta(state):
    global game_tree
    with step():
        game_tree = game_tree.highlight("t0")
    return max_value(state, "t0", float("-inf"), float("inf"))


best_action, score = alpha_beta(initial_state)
`,
    watchVariables: ["game_tree", "decision", "score"],
    variableConfigs: {
      game_tree: { viewKind: "graph", depth: 4, viewOptions: { color, graphDirection: "TB" } },
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
    "edges": [
        {"source": source, "target": target, "label": str(weight), "color": "#cbd5e1"}
        for source, target, weight in edges
    ],
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
    chosen.append(f"{source}-{target}:{weight}")
    graph_state["edges"] = [
        {
            "source": edge_source,
            "target": edge_target,
            "label": str(edge_weight),
            "color": "#2563eb" if f"{edge_source}-{edge_target}:{edge_weight}" in chosen else "#cbd5e1",
        }
        for edge_source, edge_target, edge_weight in edges
    ]
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
    "edges": [
        {"source": source, "target": target, "label": str(weight), "color": "#cbd5e1"}
        for source, target, weight in edges
    ],
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
    chosen.append(f"{source}-{target}:{weight}")
    graph_state["edges"] = [
        {
            "source": edge_source,
            "target": edge_target,
            "label": str(edge_weight),
            "color": "#2563eb" if f"{edge_source}-{edge_target}:{edge_weight}" in chosen else "#cbd5e1",
        }
        for edge_source, edge_target, edge_weight in edges
    ]
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
    "edges": [
        {"source": source, "target": target, "label": str(weight), "color": "#cbd5e1"}
        for source, neighbors in graph.items()
        for target, weight in neighbors.items()
    ],
    "directed": True,
}
dist = {node: None for node in graph}
dist["A"] = 0
visited_order = []
unvisited = set(graph)
parent = {"A": None}

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
    "edges": [
        {"source": source, "target": target, "label": "", "color": "#cbd5e1"}
        for source, neighbors in graph.items()
        for target in neighbors
    ],
    "directed": True,
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
    "edges": [
        {"source": source, "target": target, "label": str(weight), "color": "#cbd5e1"}
        for source, target, weight in edges
    ],
    "directed": True,
}
dist = {"A": 0, "B": None, "C": None, "D": None}
rounds = []
parent = {"A": None}

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
    title: "Decision Tree Learning",
    description: "Decision tree learning on the lecture's hiring dataset, choosing splits by information gain.",
    snippet: `from code_visualizer.structures import Tree
import math

rows = [
    {"Experience": "Senior", "Interview": "Good", "Skills": "High", "Hire": "Yes"},
    {"Experience": "Advanced", "Interview": "Bad", "Skills": "High", "Hire": "Yes"},
    {"Experience": "Junior", "Interview": "Good", "Skills": "Mid", "Hire": "Yes"},
    {"Experience": "Junior", "Interview": "Bad", "Skills": "High", "Hire": "No"},
    {"Experience": "Junior", "Interview": "Bad", "Skills": "Mid", "Hire": "No"},
]
attributes = ["Experience", "Interview", "Skills"]
active_rows = {}
split_scores = {}
selected_split = ""

def entropy(subrows):
    yes = sum(row["Hire"] == "Yes" for row in subrows)
    p = yes / len(subrows)
    return -sum(value * math.log2(value) for value in (p, 1 - p) if value)

def score(subrows, attribute):
    groups = {}
    for row in subrows:
        groups.setdefault(row[attribute], []).append(row)
    conditional = sum(
        len(group) / len(subrows) * entropy(group)
        for group in groups.values()
    )
    return conditional, entropy(subrows) - conditional


def as_table(subrows):
    return {
        "Experience": [row["Experience"] for row in subrows],
        "Interview": [row["Interview"] for row in subrows],
        "Skills": [row["Skills"] for row in subrows],
        "Hire?": [row["Hire"] for row in subrows],
    }


def choose_attribute(subrows, remaining, subset):
    global selected_split, split_scores
    scores = []
    for attribute in remaining:
        conditional, gain = score(subrows, attribute)
        scores.append((attribute, conditional, gain))
    base = entropy(subrows)
    selected = max(scores, key=lambda item: item[2])
    with step():
        split_scores = {
            "Subset": [subset] * len(scores),
            "Attribute": [attribute for attribute, _, _ in scores],
            "H(Y)": [f"{base:.3f}"] * len(scores),
            "H(Y|attribute)": [f"{conditional:.3f}" for _, conditional, _ in scores],
            "IG": [
                f"{gain:.3f} (selected)" if attribute == selected[0] else f"{gain:.3f}"
                for attribute, _, gain in scores
            ],
        }
        selected_split = f"Choose {selected[0]}: IG = {selected[2]:.3f} is highest"
    return selected[0]


def dtl(subrows, remaining, parent=None, branch="", subset="all rows"):
    global active_rows, decision_tree, selected_split
    with step():
        active_rows = as_table(subrows)
        if parent is not None:
            decision_tree = decision_tree.highlight(parent)
    labels = {row["Hire"] for row in subrows}
    if len(labels) == 1:
        label = next(iter(labels))
        with step():
            decision_tree, leaf = decision_tree.add(parent, label, branch)
            decision_tree = decision_tree.highlight(leaf)
            selected_split = f"{subset}: every row is {label}; stop"
        return

    attribute = choose_attribute(subrows, remaining, subset)
    if parent is None:
        with step():
            decision_tree = Tree(attribute).with_annotation("t0", f"IG = {score(subrows, attribute)[1]:.3f}").highlight("t0")
        node = "t0"
    else:
        with step():
            decision_tree, node = decision_tree.add(parent, attribute, branch)
            decision_tree = decision_tree.highlight(node)

    next_attributes = [item for item in remaining if item != attribute]
    for value in dict.fromkeys(row[attribute] for row in subrows):
        child_rows = [row for row in subrows if row[attribute] == value]
        child_subset = f"{subset}; {attribute} = {value}"
        dtl(child_rows, next_attributes, node, value, child_subset)

dtl(rows, attributes)
`,
    watchVariables: ["active_rows", "split_scores", "selected_split", "decision_tree"],
    variableConfigs: {
      active_rows: { viewKind: "table", depth: 3, viewOptions: { color } },
      split_scores: { viewKind: "table", depth: 2, viewOptions: { color } },
      selected_split: { viewKind: "auto", depth: null, viewOptions: { color } },
      decision_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
    },
    tags: ["machine learning", "decision tree", "algorithm", "curriculum"],
  },
  {
    key: "decision-tree-pruning-max-depth",
    title: "Decision Tree Pruning: Max Depth Limit",
    description: "Applies a max-depth constraint and stops deeper splits once the limit is reached.",
    snippet: `from code_visualizer.structures import Tree
import math

rows = [
    {"Experience": "Senior", "Interview": "Good", "Skills": "High", "Hire": "Yes"},
    {"Experience": "Advanced", "Interview": "Bad", "Skills": "High", "Hire": "Yes"},
    {"Experience": "Junior", "Interview": "Good", "Skills": "Mid", "Hire": "Yes"},
    {"Experience": "Junior", "Interview": "Bad", "Skills": "High", "Hire": "No"},
    {"Experience": "Junior", "Interview": "Bad", "Skills": "Mid", "Hire": "No"},
]
attributes = ["Experience", "Interview", "Skills"]
max_depth = 1
active_rows = {}
split_scores = {}
selected_split = ""
stop_reason = ""


def entropy(subrows):
    yes = sum(row["Hire"] == "Yes" for row in subrows)
    p = yes / len(subrows)
    return -sum(value * math.log2(value) for value in (p, 1 - p) if value)


def score(subrows, attribute):
    groups = {}
    for row in subrows:
        groups.setdefault(row[attribute], []).append(row)
    conditional = sum(len(group) / len(subrows) * entropy(group) for group in groups.values())
    return entropy(subrows) - conditional


def as_table(subrows):
    return {key: [row[key] for row in subrows] for key in ["Experience", "Interview", "Skills", "Hire"]}


def choose_attribute(subrows, remaining):
    global split_scores, selected_split
    gains = [(attribute, score(subrows, attribute)) for attribute in remaining]
    selected = max(gains, key=lambda item: item[1])
    with step():
        split_scores = {
            "Attribute": [attribute for attribute, _ in gains],
            "Information gain": [f"{gain:.3f} (selected)" if attribute == selected[0] else f"{gain:.3f}" for attribute, gain in gains],
        }
        selected_split = f"Choose {selected[0]}: IG = {selected[1]:.3f}"
    return selected


def majority(subrows):
    return "Yes" if sum(row["Hire"] == "Yes" for row in subrows) * 2 >= len(subrows) else "No"


def dtl(subrows, remaining, parent=None, branch="", depth=0):
    global active_rows, decision_tree, stop_reason
    with step():
        active_rows = as_table(subrows)
        if parent is not None:
            decision_tree = decision_tree.highlight(parent)
    if depth >= max_depth or len({row["Hire"] for row in subrows}) == 1:
        prediction = majority(subrows)
        reason = f"stop: max depth {max_depth}" if depth >= max_depth else "stop: pure subset"
        with step():
            decision_tree, leaf = decision_tree.add(parent, prediction, branch, annotation=reason)
            decision_tree = decision_tree.highlight(leaf)
            stop_reason = reason
        return

    attribute, gain = choose_attribute(subrows, remaining)
    if parent is None:
        with step():
            decision_tree = Tree(attribute).with_annotation("t0", f"IG = {gain:.3f}").highlight("t0")
        node = "t0"
    else:
        decision_tree, node = decision_tree.add(parent, attribute, branch, annotation=f"IG = {gain:.3f}")
    for value in dict.fromkeys(row[attribute] for row in subrows):
        child_rows = [row for row in subrows if row[attribute] == value]
        dtl(child_rows, [item for item in remaining if item != attribute], node, value, depth + 1)


dtl(rows, attributes)
`,
    watchVariables: ["active_rows", "split_scores", "selected_split", "stop_reason", "decision_tree"],
    variableConfigs: {
      active_rows: { viewKind: "table", depth: 3, viewOptions: { color } },
      split_scores: { viewKind: "table", depth: 2, viewOptions: { color } },
      selected_split: { viewKind: "auto", depth: null, viewOptions: { color } },
      stop_reason: { viewKind: "auto", depth: null, viewOptions: { color } },
      decision_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
    },
    tags: ["machine learning", "decision tree", "pruning", "curriculum"],
  },
  {
    key: "decision-tree-pruning-min-sample-leaves",
    title: "Decision Tree Pruning: Min Samples per Leaf",
    description: "Blocks leaves that would end up below a minimum sample threshold.",
    snippet: `from code_visualizer.structures import Tree
import math

rows = [
    {"Experience": "Senior", "Interview": "Good", "Skills": "High", "Hire": "Yes"},
    {"Experience": "Senior", "Interview": "Good", "Skills": "Mid", "Hire": "Yes"},
    {"Experience": "Advanced", "Interview": "Good", "Skills": "High", "Hire": "Yes"},
    {"Experience": "Advanced", "Interview": "Good", "Skills": "Mid", "Hire": "Yes"},
    {"Experience": "Junior", "Interview": "Good", "Skills": "Mid", "Hire": "Yes"},
    {"Experience": "Junior", "Interview": "Bad", "Skills": "High", "Hire": "No"},
    {"Experience": "Junior", "Interview": "Bad", "Skills": "Mid", "Hire": "No"},
]
attributes = ["Experience", "Interview", "Skills"]
min_samples_leaf = 2
active_rows = {}
split_scores = {}
selected_split = ""
stop_reason = ""


def entropy(subrows):
    yes = sum(row["Hire"] == "Yes" for row in subrows)
    p = yes / len(subrows)
    return -sum(value * math.log2(value) for value in (p, 1 - p) if value)


def groups_for(subrows, attribute):
    groups = {}
    for row in subrows:
        groups.setdefault(row[attribute], []).append(row)
    return groups


def score(subrows, attribute):
    groups = groups_for(subrows, attribute)
    conditional = sum(len(group) / len(subrows) * entropy(group) for group in groups.values())
    return entropy(subrows) - conditional, all(len(group) >= min_samples_leaf for group in groups.values())


def as_table(subrows):
    return {key: [row[key] for row in subrows] for key in ["Experience", "Interview", "Skills", "Hire"]}


def choose_attribute(subrows, remaining):
    global split_scores, selected_split
    candidates = [(attribute, *score(subrows, attribute)) for attribute in remaining]
    valid = [item for item in candidates if item[2]]
    with step():
        split_scores = {
            "Attribute": [attribute for attribute, _, _ in candidates],
            "Information gain": [f"{gain:.3f} (selected)" if valid and attribute == max(valid, key=lambda item: item[1])[0] else f"{gain:.3f}" for attribute, gain, _ in candidates],
            "Allowed": ["yes" if allowed else f"no: child < {min_samples_leaf}" for _, _, allowed in candidates],
        }
    if not valid:
        return None
    selected = max(valid, key=lambda item: item[1])
    selected_split = f"Choose {selected[0]}: IG = {selected[1]:.3f}"
    return selected


def majority(subrows):
    return "Yes" if sum(row["Hire"] == "Yes" for row in subrows) * 2 >= len(subrows) else "No"


def dtl(subrows, remaining, parent=None, branch=""):
    global active_rows, decision_tree, stop_reason
    with step():
        active_rows = as_table(subrows)
        if parent is not None:
            decision_tree = decision_tree.highlight(parent)
    if len({row["Hire"] for row in subrows}) == 1:
        prediction, reason = majority(subrows), "stop: pure subset"
    else:
        selected = choose_attribute(subrows, remaining)
        if selected is None:
            prediction, reason = majority(subrows), f"stop: every split makes a child smaller than {min_samples_leaf}"
        else:
            attribute, gain, _ = selected
            if parent is None:
                with step():
                    decision_tree = Tree(attribute).with_annotation("t0", f"IG = {gain:.3f}").highlight("t0")
                node = "t0"
            else:
                decision_tree, node = decision_tree.add(parent, attribute, branch, annotation=f"IG = {gain:.3f}")
            for value, child_rows in groups_for(subrows, attribute).items():
                dtl(child_rows, [item for item in remaining if item != attribute], node, value)
            return
    with step():
        decision_tree, leaf = decision_tree.add(parent, prediction, branch, annotation=reason)
        decision_tree = decision_tree.highlight(leaf)
        stop_reason = reason


dtl(rows, attributes)
`,
    watchVariables: ["active_rows", "split_scores", "selected_split", "stop_reason", "decision_tree"],
    variableConfigs: {
      active_rows: { viewKind: "table", depth: 3, viewOptions: { color } },
      split_scores: { viewKind: "table", depth: 2, viewOptions: { color } },
      selected_split: { viewKind: "auto", depth: null, viewOptions: { color } },
      stop_reason: { viewKind: "auto", depth: null, viewOptions: { color } },
      decision_tree: { viewKind: "graph", depth: 3, viewOptions: { color, graphDirection: "TB" } },
    },
    tags: ["machine learning", "decision tree", "pruning", "curriculum"],
  },
  {
    key: "linear-regression-gradient-descent",
    title: "Linear Regression",
    description: "Fits a line to fixed training points with gradient descent.",
    snippet: `points = [[1, 2], [2, 3], [3, 5], [4, 4]]
m = 0.0
b = 0.0
learning_rate = 0.1
fit_points = [[0.5, m * 0.5 + b], [4.5, m * 4.5 + b]]
fit = Plot(x_domain=[0.5, 4.5], y_domain=[0, 9]).scatter(points, color="#475569").line(fit_points, color="#dc2626")
loss = sum((m * x + b - y) ** 2 for x, y in points) / len(points)

for _ in range(4):
    predictions = [m * x + b for x, _ in points]
    errors = [prediction - y for prediction, (_, y) in zip(predictions, points)]
    grad_m = sum(2 * error * x for error, (x, _) in zip(errors, points)) / len(points)
    grad_b = sum(2 * error for error in errors) / len(points)
    m = round(m - learning_rate * grad_m, 3)
    b = round(b - learning_rate * grad_b, 3)
    fit_points = [[0.5, m * 0.5 + b], [4.5, m * 4.5 + b]]
    fit = Plot(x_domain=[0.5, 4.5], y_domain=[0, 9]).scatter(points, color="#475569").line(fit_points, color="#dc2626")
    loss = round(sum((m * x + b - y) ** 2 for x, y in points) / len(points), 3)
`,
    watchVariables: ["fit", "loss"],
    variableConfigs: {
      fit: { viewKind: "plot", depth: 1, viewOptions: { color } },
      loss: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["machine learning", "linear regression", "regression", "algorithm", "curriculum"],
  },
  {
    key: "logistic-regression-gradient-descent",
    title: "Binary Logistic Regression: Engine Failure",
    description: "Lecture 6's Engine Failure data, fitted with a sigmoid and binary cross-entropy gradient descent.",
    snippet: `from math import log

# Lecture 6: Engine Failure Prediction
temperatures = [20, 50, 95, 120, 190]
labels = [0, 0, 0, 1, 1]  # 0 = no failure, 1 = failure

# Scale x_1 only to make gradient descent numerically stable.
features = [temperature / 100 for temperature in temperatures]
w0 = 0.0
w1 = 0.0
learning_rate = 1.0
safe_points = [[temperature, 0] for temperature, label in zip(temperatures, labels) if label == 0]
failure_points = [[temperature, 1] for temperature, label in zip(temperatures, labels) if label == 1]
curve_x = [index * 5 for index in range(41)]

def sigmoid(score):
    return 1 / (1 + 2.71828 ** -score)

curve_points = [[temperature, sigmoid(w0 + w1 * temperature / 100)] for temperature in curve_x]
fit = Plot(
    x_domain=[0, 200],
    y_domain=[0, 1],
    x_label="temperature (x1)",
    y_label="failure probability",
).scatter(safe_points, color="#65a30d").scatter(failure_points, color="#dc2626").line(curve_points, color="#2563eb")
loss = round(-sum(label * log(probability) + (1 - label) * log(1 - probability) for label, probability in zip(labels, [sigmoid(w0 + w1 * x) for x in features])) / len(labels), 3)

for epoch in range(5):
    # Six updates per displayed step make the sigmoid visibly S-shaped.
    for _ in range(6):
        probabilities = [sigmoid(w0 + w1 * x) for x in features]
        errors = [probability - label for probability, label in zip(probabilities, labels)]
        grad_w0 = sum(errors) / len(labels)
        grad_w1 = sum(error * x for error, x in zip(errors, features)) / len(labels)
        w0 = round(w0 - learning_rate * grad_w0, 3)
        w1 = round(w1 - learning_rate * grad_w1, 3)
    curve_points = [[temperature, sigmoid(w0 + w1 * temperature / 100)] for temperature in curve_x]
    fit = Plot(
        x_domain=[0, 200],
        y_domain=[0, 1],
        x_label="temperature (x1)",
        y_label="failure probability",
    ).scatter(safe_points, color="#65a30d").scatter(failure_points, color="#dc2626").line(curve_points, color="#2563eb")
    loss = round(-sum(label * log(probability) + (1 - label) * log(1 - probability) for label, probability in zip(labels, [sigmoid(w0 + w1 * x) for x in features])) / len(labels), 3)
`,
    watchVariables: ["fit", "loss"],
    variableConfigs: {
      fit: { viewKind: "plot", depth: 1, viewOptions: { color } },
      loss: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["machine learning", "logistic regression", "binary classification", "gradient descent", "curriculum"],
  },
  {
    key: "logistic-regression-animal-features",
    title: "Logistic Regression: Animal Prediction",
    description: "Learns one logistic decision boundary that separates rabbits from the cat and dog examples.",
    snippet: `from math import log

# Lecture 6: Animal Prediction
# x1 = weight, x2 = height
# Blue = cat, green = dog, red = rabbit (the positive class).
cats = [[2.0, 4.4], [2.5, 3.1], [3.0, 5.3], [3.4, 4.0], [3.8, 2.4]]
dogs = [[5.8, 5.9], [6.5, 6.8], [7.1, 5.2], [7.8, 7.9], [8.4, 6.0]]
rabbits = [[5.2, 1.8], [5.8, 2.8], [6.3, 1.2], [6.8, 3.1], [7.4, 2.0], [8.0, 3.4]]
candidate = [6.7, 2.1]
points = cats + dogs + rabbits
labels = [0] * (len(cats) + len(dogs)) + [1] * len(rabbits)

# Scale both features before gradient descent.
features = [[(x1 - 5) / 4, (x2 - 4.75) / 4.25] for x1, x2 in points]
w0 = w1 = w2 = 0.0
learning_rate = 0.8


def sigmoid(score):
    return 1 / (1 + 2.71828 ** -score)


def draw_boundary(w0, w1, w2):
    return [
        [weight, 4.75 - 4.25 / w2 * (w0 + w1 * (weight - 5) / 4)]
        for weight in [1, 9]
    ]


gradients = {}
loss = 0.0
for epoch in range(5):
    # Twelve updates per displayed step keep the trace short.
    for _ in range(12):
        probabilities = [sigmoid(w0 + w1 * x1 + w2 * x2) for x1, x2 in features]
        errors = [probability - label for probability, label in zip(probabilities, labels)]
        grad_w0 = sum(errors) / len(labels)
        grad_w1 = sum(error * x1 for error, (x1, _) in zip(errors, features)) / len(labels)
        grad_w2 = sum(error * x2 for error, (_, x2) in zip(errors, features)) / len(labels)
        w0 = w0 - learning_rate * grad_w0
        w1 = w1 - learning_rate * grad_w1
        w2 = w2 - learning_rate * grad_w2

    probabilities = [sigmoid(w0 + w1 * x1 + w2 * x2) for x1, x2 in features]
    loss = round(-sum(label * log(probability) + (1 - label) * log(1 - probability) for label, probability in zip(labels, probabilities)) / len(labels), 3)
    gradients = {"dL/dw0": round(grad_w0, 3), "dL/dw1": round(grad_w1, 3), "dL/dw2": round(grad_w2, 3)}
    boundary = draw_boundary(w0, w1, w2)
    feature_space = Plot(
        x_domain=[1, 9],
        y_domain=[0.5, 9],
        x_label="weight (x1)",
        y_label="height (x2)",
    ).line(boundary, color="#0f172a").scatter(cats, color="#2563eb").scatter(dogs, color="#16a34a").scatter(rabbits, color="#dc2626").scatter([candidate], color="#f59e0b")

candidate_x1 = (candidate[0] - 5) / 4
candidate_x2 = (candidate[1] - 4.75) / 4.25
rabbit_probability = round(sigmoid(w0 + w1 * candidate_x1 + w2 * candidate_x2), 3)
prediction = "Rabbit" if rabbit_probability >= 0.5 else "Not rabbit"

`,
    watchVariables: ["feature_space", "loss", "gradients", "rabbit_probability", "prediction"],
    variableConfigs: {
      feature_space: { viewKind: "plot", depth: 1, viewOptions: { color } },
      loss: { viewKind: "auto", depth: null, viewOptions: { color } },
      gradients: { viewKind: "table", depth: 2, viewOptions: { color } },
      rabbit_probability: { viewKind: "auto", depth: null, viewOptions: { color } },
      prediction: { viewKind: "auto", depth: null, viewOptions: { color } },
    },
    tags: ["machine learning", "logistic regression", "binary classification", "gradient descent", "curriculum"],
  },
  { key: "image", title: "Image", description: "Image view requires a browser-accessible asset path; this example is a placeholder.", snippet: `data = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80'><rect width='120' height='80' fill='%23e0f2fe'/><text x='18' y='46' font-size='20' fill='%230f172a'>CodeFlow</text></svg>"\n`, watchVariables: ["data"], variableConfigs: variable("image", 1), tags: ["image", "asset required", "special"] },
];
