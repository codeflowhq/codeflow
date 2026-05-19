from __future__ import annotations

from typing import Any


def build_heap_tree_payload(heap: list[Any], item_limit: int) -> Any | None:
    if not heap:
        return None
    limit = min(len(heap), item_limit)

    def build(idx: int) -> Any | None:
        if idx >= limit or idx >= len(heap):
            return None
        left = build(2 * idx + 1)
        right = build(2 * idx + 2)
        children = [child for child in (left, right) if child is not None]
        return {"label": heap[idx], "children": children}

    return build(0)
