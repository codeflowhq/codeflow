"""Graphviz view builder shared by nested visualizations."""

from __future__ import annotations

from collections.abc import Callable
from itertools import count
from typing import Any

from ..shared.models import VisualGraph
from ..shared.view_kinds import ViewKind
from .bar_view import build_bar_view_node_columns as _bar_view_node_columns_builder
from .context import ViewBuildContext, ViewResolver
from .graph_view import build_graph_view_entry as _graph_view_builder_entry
from .image_view import build_image_view as _image_view_builder
from .node_views.array_view import (
    build_array_view_node_cells as _array_view_node_cells_builder,
)
from .node_views.hash_table_view import (
    build_hash_table_view_node_heads_chains as _hash_table_view_node_heads_chains_builder,
)
from .node_views.heap_view import (
    build_heap_dual_view_node as _heap_dual_view_node_builder,
)
from .node_views.linked_list_view import (
    build_linked_list_view_nodes as _linked_list_view_nodes_builder,
)
from .node_views.matrix_view import (
    build_matrix_view_node_cells as _matrix_view_node_cells_builder,
)
from .node_views.table_view import (
    build_table_view_node_rows as _table_view_node_rows_builder,
)
from .tree_view import build_tree_view as _tree_view_builder


def build_graph_view(
    value: Any,
    name: str,
    view: ViewKind,
    depth: int,
    *,
    item_limit: int,
    value_coercer: Callable[[Any], Any] | None = None,
    view_resolver: ViewResolver | None = None,
    focus_path: str | None = None,
    show_titles: bool = True,
) -> tuple[str, VisualGraph]:
    runtime = _create_runtime(
        item_limit,
        value_coercer,
        view_resolver,
        focus_path=focus_path,
        show_titles=show_titles,
    )
    coerced_value = runtime.coerce(value)
    root_id = _build_view(runtime, coerced_value, name, view, depth)
    return root_id, runtime.graph


def _create_runtime(
    item_limit: int,
    value_coercer: Callable[[Any], Any] | None,
    view_resolver: ViewResolver | None,
    *,
    focus_path: str | None = None,
    show_titles: bool = True,
) -> ViewBuildContext:
    return ViewBuildContext(
        graph=VisualGraph(),
        item_limit=item_limit,
        coerce=value_coercer or (lambda x: x),
        resolver=view_resolver,
        focus_path=focus_path,
        counter=count(1),
        show_titles=show_titles,
    )


def _build_view(
    runtime: ViewBuildContext, value: Any, name: str, view: ViewKind, depth: int
) -> str:
    builder = _VIEW_BUILDERS.get(view)
    if builder is None:
        raise ValueError(f"Unsupported nested view: {view}")
    return builder(runtime, value, name, depth)


_VIEW_BUILDERS: dict[ViewKind, Callable[[ViewBuildContext, Any, str, int], str]] = {
    ViewKind.ARRAY_CELLS: _array_view_node_cells_builder,
    ViewKind.TABLE: _table_view_node_rows_builder,
    ViewKind.MATRIX: _matrix_view_node_cells_builder,
    ViewKind.HASH_TABLE: _hash_table_view_node_heads_chains_builder,
    ViewKind.LINKED_LIST: _linked_list_view_nodes_builder,
    ViewKind.TREE: _tree_view_builder,
    ViewKind.GRAPH: _graph_view_builder_entry,
    ViewKind.HEAP_DUAL: _heap_dual_view_node_builder,
    ViewKind.BAR: _bar_view_node_columns_builder,
    ViewKind.IMAGE: _image_view_builder,
}
