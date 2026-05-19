from __future__ import annotations

from typing import Any

from .size_estimates import estimate_visual_width


def estimate_table_column_widths(
    items: list[tuple[Any, Any]], max_items: int = 6
) -> tuple[int, int]:
    key_width = 92
    value_width = 92
    for key, val in items:
        key_text = str(key)
        key_width = max(key_width, min(220, 20 + len(key_text) * 9))
        value_width = max(value_width, estimate_visual_width(val, max_items))
    return key_width, min(920, value_width + 48)
