from __future__ import annotations

from typing import Any


def estimate_visual_width(
    value: Any, max_items: int = 6, *, max_width: int = 920
) -> int:
    """Estimate Graphviz HTML label width so sibling rows can share one width."""
    if isinstance(value, (str, int, float, bool)) or value is None:
        text = str(value)
        return min(max_width, max(54, 24 + len(text) * 9))

    if isinstance(value, dict):
        from .table_sizes import estimate_table_column_widths

        key_width, value_width = estimate_table_column_widths(
            list(value.items())[:max_items], max_items
        )
        return min(max_width, key_width + value_width + 56)

    if isinstance(value, (list, tuple)):
        visible = list(value)[:max_items]
        if not visible:
            return 64
        width = sum(
            estimate_visual_width(item, max_items, max_width=max_width)
            for item in visible
        )
        width += max(0, len(visible) - 1) * 18 + 24
        if len(value) > len(visible):
            width += 42
        return min(max_width, max(64, width))

    if isinstance(value, (set, frozenset)):
        visible = sorted(value, key=lambda item: str(item))[:max_items]
        if not visible:
            return 64
        width = sum(
            estimate_visual_width(item, max_items, max_width=max_width)
            for item in visible
        )
        width += max(0, len(visible) - 1) * 18 + 24
        if len(value) > len(visible):
            width += 42
        return min(max_width, max(64, width))

    return max(72, min(max_width, 24 + len(type(value).__name__) * 9))


def estimate_visual_height(
    value: Any, max_items: int = 6, *, max_height: int = 420
) -> int:
    """Estimate Graphviz HTML label height for equal-sized sibling cells."""
    if isinstance(value, (str, int, float, bool)) or value is None:
        return 30

    if isinstance(value, dict):
        visible = list(value.items())[:max_items]
        row_count = max(1, len(visible))
        nested_extra = max(
            (
                estimate_visual_height(item, max_items, max_height=max_height) - 30
                for _, item in visible
            ),
            default=0,
        )
        return min(max_height, 34 + row_count * 28 + nested_extra)

    if isinstance(value, (list, tuple, set, frozenset)):
        visible = (
            list(value)[:max_items]
            if not isinstance(value, (set, frozenset))
            else sorted(value, key=lambda item: str(item))[:max_items]
        )
        if not visible:
            return 34
        child_height = max(
            estimate_visual_height(item, max_items, max_height=max_height)
            for item in visible
        )
        return min(max_height, child_height + 34)

    return 34
