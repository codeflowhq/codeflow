from __future__ import annotations

from pathlib import Path
import sys

WORKSPACE_ROOT = Path(__file__).resolve().parents[3]
PYTHON_REPO_ROOT = WORKSPACE_ROOT / "code-visualizer"
PYTHON_SRC_ROOT = PYTHON_REPO_ROOT / "src"

if str(PYTHON_SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(PYTHON_SRC_ROOT))

from code_visualizer import visualize_algorithm


def _build_cases() -> dict[str, dict[str, object]]:
    return {
        "bfs-queue": {
            "watch": ["queue", "visited", "node"],
            "snippet": """from collections import deque
graph = {"A": ["B", "C"], "B": ["D"], "C": ["E"], "D": [], "E": []}
queue = deque(["A"])
visited = []
while queue:
    node = queue.popleft()
    visited.append(node)
    for nxt in graph[node]:
        queue.append(nxt)
""",
        },
        "dfs-stack": {
            "watch": ["stack", "visited", "order"],
            "snippet": """graph = {
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
""",
        },
        "fenwick-tree-trace": {
            "watch": ["values", "tree", "prefix_sums"],
            "snippet": """values = [3, 2, -1, 6, 5, 4, -3, 3]
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
""",
        },
        "segment-tree-trace": {
            "watch": ["values", "tree"],
            "snippet": """values = [2, 1, 5, 3, 4]
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
""",
        },
        "bst-insert-trace": {
            "watch": ["data"],
            "snippet": """steps = [
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
]
for data in steps:
    pass
""",
        },
        "avl-rotation-trace": {
            "watch": ["data"],
            "snippet": """steps = [
    {"label": "30 (1)", "children": []},
    {"label": "30 (2)", "children": [{"label": "20 (1)", "children": []}]},
    {
        "label": "20 (2)",
        "children": [
            {"label": "10 (1)", "children": []},
            {"label": "30 (1)", "children": []},
        ],
    },
]
for data in steps:
    pass
""",
        },
        "kruskal-mst": {
            "watch": ["graph_state", "chosen"],
            "snippet": """states = [
    {
        "graph_state": {"nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}], "edges": [], "directed": False},
        "chosen": [],
    },
    {
        "graph_state": {"nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}], "edges": [{"source": "A", "target": "B", "label": "1"}], "directed": False},
        "chosen": ["A-B:1"],
    },
]
for state in states:
    graph_state = state["graph_state"]
    chosen = state["chosen"]
""",
        },
        "dijkstra-distances": {
            "watch": ["dist", "visited_order"],
            "snippet": """graph = {
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
""",
        },
    }


def main() -> int:
    failures: list[str] = []
    cases = _build_cases()

    for name, case in cases.items():
        try:
            result = visualize_algorithm(
                case["snippet"],
                watch_variables=case["watch"],
                output="manifest",
                payload=True,
                max_steps=128,
            )
        except Exception as exc:  # pragma: no cover - explicit smoke failure path
            failures.append(f"{name}: ERROR {type(exc).__name__}: {exc}")
            continue

        manifest = result.get("manifest", []) if isinstance(result, dict) else []
        if not manifest:
            failures.append(f"{name}: returned an empty manifest")
            continue

        counts = {entry["variable"]: len(entry.get("steps", [])) for entry in manifest}
        print(f"{name}: ok {counts}")

    if failures:
        print("\nExample smoke check failed:")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    print("\nExample smoke check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
