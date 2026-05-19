from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..renderers.graphviz.renderer import render_graphviz_node_link
from ..shared.view_kinds import ViewKind
from ..utils.detection.graph import (
    _looks_like_graph_mapping,
    _try_networkx_edges_nodes,
)
from ..utils.detection.linked import (
    _collect_linked_list_labels,
    _looks_like_hash_table,
)
from ..utils.detection.tree import (
    _tree_children,
)
from ..utils.image_sources import (
    _detect_image_source,
    _image_html,
    _render_dot_to_image,
)
from ..utils.value_shapes import _is_matrix_value
from .context import ViewBuildContext, ViewResolver

STRUCTURED_VIEW_KINDS: set[ViewKind] = {
    ViewKind.ARRAY_CELLS,
    ViewKind.TABLE,
    ViewKind.MATRIX,
    ViewKind.HASH_TABLE,
    ViewKind.LINKED_LIST,
    ViewKind.TREE,
    ViewKind.GRAPH,
    ViewKind.HEAP_DUAL,
    ViewKind.BAR,
    ViewKind.IMAGE,
}
RECURSIVE_VIEW_KINDS: set[ViewKind] = {
    ViewKind.ARRAY_CELLS,
    ViewKind.TREE,
    ViewKind.LINKED_LIST,
    ViewKind.GRAPH,
    ViewKind.HASH_TABLE,
    ViewKind.HEAP_DUAL,
}


def select_nested_view(
    runtime: ViewBuildContext,
    slot_name: str,
    original_value: Any,
    coerced_value: Any,
    depth_remaining: int,
) -> ViewKind | None:
    if depth_remaining <= 0:
        return None

    resolver = runtime.resolver
    if resolver is not None:
        resolved_view, configured = resolver(slot_name, original_value, coerced_value)
        if configured and resolved_view in STRUCTURED_VIEW_KINDS:
            return resolved_view
        if resolved_view in RECURSIVE_VIEW_KINDS:
            return resolved_view

    legacy_view = legacy_nested_view(runtime, coerced_value)
    if legacy_view in RECURSIVE_VIEW_KINDS:
        return legacy_view
    return None


def legacy_nested_view(runtime: ViewBuildContext, value: Any) -> ViewKind | None:
    if value is None:
        return None
    if _tree_children(value) is not None:
        return ViewKind.TREE
    if _collect_linked_list_labels(value, min(8, runtime.item_limit)) is not None:
        return ViewKind.LINKED_LIST
    if isinstance(value, list) and _looks_like_hash_table(value):
        return ViewKind.HASH_TABLE
    if _try_networkx_edges_nodes(value) is not None or _looks_like_graph_mapping(value):
        return ViewKind.GRAPH
    if _is_matrix_value(value):
        return ViewKind.MATRIX
    if isinstance(value, dict):
        return ViewKind.TABLE
    if _detect_image_source(value) is not None:
        return ViewKind.IMAGE
    if isinstance(value, (list, tuple, set, frozenset)):
        return ViewKind.ARRAY_CELLS
    return None


def experimental_array_nested_resolver(
    runtime: ViewBuildContext,
    original_resolver: ViewResolver | None,
) -> ViewResolver:
    def _resolver(
        slot_name: str, original_value: Any, coerced_value: Any
    ) -> tuple[ViewKind, bool]:
        if original_resolver is not None:
            resolved_view, configured = original_resolver(
                slot_name, original_value, coerced_value
            )
            if configured:
                return resolved_view, True
            if (
                resolved_view in RECURSIVE_VIEW_KINDS
                and resolved_view != ViewKind.ARRAY_CELLS
            ):
                return resolved_view, False
        legacy_view = legacy_nested_view(runtime, coerced_value)
        if legacy_view == ViewKind.ARRAY_CELLS:
            return ViewKind.ARRAY_CELLS, False
        if legacy_view in RECURSIVE_VIEW_KINDS:
            return legacy_view, False
        return ViewKind.NODE_LINK, False

    return _resolver


def make_nested_renderer(
    runtime: ViewBuildContext,
    parent_id: str,
    port_name: str,
    slot_name: str,
) -> Callable[[Any, str, int], str | None]:
    from .dispatcher import _build_view
    from .graph_layout import add_edge

    def _renderer(child_value: Any, _: str, depth_remaining: int) -> str | None:
        coerce = runtime.coerce
        coerced = coerce(child_value)
        next_view = select_nested_view(
            runtime, slot_name, child_value, coerced, depth_remaining
        )
        if next_view is None:
            return None
        inline_html = render_inline_child_view(
            runtime, coerced, slot_name, next_view, max(0, depth_remaining)
        )
        if inline_html is not None:
            return inline_html
        child_id = _build_view(
            runtime, coerced, slot_name, next_view, max(0, depth_remaining)
        )
        add_edge(runtime, parent_id, child_id, tailport=port_name)
        return ""

    return _renderer


def render_inline_child_view(
    runtime: ViewBuildContext,
    coerced_value: Any,
    slot_name: str,
    view: ViewKind,
    depth_remaining: int,
) -> str | None:
    from .dispatcher import build_graph_view

    try:
        child_root_id, child_graph = build_graph_view(
            coerced_value,
            slot_name,
            view,
            depth_remaining,
            item_limit=runtime.item_limit,
            value_coercer=runtime.coerce,
            view_resolver=runtime.resolver,
            focus_path=runtime.focus_path,
        )
    except Exception:
        return None

    root_node = child_graph.nodes.get(child_root_id)
    if (
        root_node is not None
        and not child_graph.edges
        and len(child_graph.nodes) == 1
        and root_node.meta.get("html_label")
    ):
        return root_node.label

    direction = "TD" if view in {ViewKind.TREE, ViewKind.HASH_TABLE} else "LR"
    dot_source = render_graphviz_node_link(
        child_graph, direction="LR" if direction == "LR" else "TD"
    )
    img_src = _render_dot_to_image(dot_source, fmt="png")
    if img_src is None:
        return None
    return _image_html(img_src)
