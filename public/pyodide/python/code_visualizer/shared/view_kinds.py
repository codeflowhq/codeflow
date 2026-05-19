"""Core view kind definitions and helper types."""

from __future__ import annotations

from collections.abc import Mapping
from enum import StrEnum
from typing import Any


class ViewKind(StrEnum):
    """All supported visualization views."""

    AUTO = "auto"
    NODE_LINK = "node_link"
    ARRAY_CELLS = "array_cells"
    MATRIX = "matrix"
    IMAGE = "image"
    BAR = "bar"
    TABLE = "table"
    TREE = "tree"
    GRAPH = "graph"
    HEAP_DUAL = "heap_dual"
    LINKED_LIST = "linked_list"
    HASH_TABLE = "hash_table"

    def __str__(self) -> str:  # pragma: no cover - Enum convenience
        return self.value


LEGACY_VIEW_KIND_ALIASES: dict[str, ViewKind] = {
    "array_cells_node": ViewKind.ARRAY_CELLS,
    "matrix_node": ViewKind.MATRIX,
    "bar_node": ViewKind.BAR,
    "table_node": ViewKind.TABLE,
    "heap_dual_node": ViewKind.HEAP_DUAL,
    "linked_list_node": ViewKind.LINKED_LIST,
    "hash_table_node": ViewKind.HASH_TABLE,
}


def ensure_view_kind(value: str | ViewKind) -> ViewKind:
    """Normalize arbitrary ViewKind literals into the Enum."""

    if isinstance(value, ViewKind):
        return value
    legacy = LEGACY_VIEW_KIND_ALIASES.get(value)
    if legacy is not None:
        return legacy
    return ViewKind(value)


ViewOverrideMap = Mapping[str | type[Any], ViewKind]


__all__ = [
    "LEGACY_VIEW_KIND_ALIASES",
    "ViewKind",
    "ViewOverrideMap",
    "ensure_view_kind",
]
