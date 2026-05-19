from __future__ import annotations

from collections.abc import Mapping
from typing import Any


def _tree_children(value: Any) -> tuple[Any, list[Any]] | None:
    if hasattr(value, "left") or hasattr(value, "right"):
        return _binary_tree_children(value)
    if hasattr(value, "children"):
        return _children_attr_tree(value)
    if isinstance(value, Mapping) and "children" in value:
        return _mapping_tree(value)
    return None


def _binary_tree_children(value: Any) -> tuple[Any, list[Any]]:
    label = _tree_label(value)
    children: list[Any] = []
    left_child = getattr(value, "left", None)
    right_child = getattr(value, "right", None)
    if left_child is not None:
        children.append(left_child)
    if right_child is not None:
        children.append(right_child)
    return label, children


def _children_attr_tree(value: Any) -> tuple[Any, list[Any]]:
    try:
        children = list(value.children)
    except Exception:
        children = []
    return _tree_label(value), children


def _mapping_tree(value: Mapping[str, Any]) -> tuple[Any, list[Any]]:
    try:
        children = list(value.get("children") or [])
    except Exception:
        children = []
    label = (
        value.get("label")
        or value.get("name")
        or value.get("val")
        or value.get("value")
        or value.get("board")
        or value.get("data")
    )
    if label is None:
        remainder = {key: item for key, item in value.items() if key != "children"}
        label = remainder if remainder else type(value).__name__
    return label, children


def _tree_label(value: Any) -> Any:
    return (
        getattr(value, "val", None)
        or getattr(value, "value", None)
        or type(value).__name__
    )
