from __future__ import annotations

from typing import Any

from .type_patterns.matching import _is_number


def _is_list_numbers(value: Any) -> bool:
    return isinstance(value, list) and all(_is_number(item) for item in value)


def _is_dict(value: Any) -> bool:
    return isinstance(value, dict)


def _is_scalar_value(value: Any) -> bool:
    return isinstance(value, (str, int, float, bool)) or value is None


def _is_matrix_value(value: Any) -> bool:
    return (
        isinstance(value, (list, tuple))
        and len(value) > 0
        and all(isinstance(row, (list, tuple)) for row in value)
    )


def _auto_nested_depth(value: Any, cap: int) -> int:
    capped = max(0, cap)

    def helper(obj: Any, depth: int) -> int:
        if depth >= capped:
            return capped
        if isinstance(obj, dict):
            if not obj:
                return depth
            return max(helper(item, depth + 1) for item in obj.values())
        if isinstance(obj, (list, tuple, set, frozenset)):
            if not obj:
                return depth
            return max(helper(item, depth + 1) for item in obj)
        return depth

    return helper(value, 0)
