from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..converters.pipeline import ConverterPipeline
from ..shared.config import VisualizerConfig
from ..shared.view_kinds import ViewKind, ViewOverrideMap
from ..utils.detection.graph import _looks_like_graph_mapping, _try_networkx_edges_nodes
from ..utils.detection.linked import _collect_linked_list_labels, _looks_like_hash_table
from ..utils.detection.tree import _tree_children
from ..utils.image_sources import _detect_image_source
from ..utils.type_patterns.matching import _match_type_pattern_override
from ..utils.type_patterns.naming import _match_named_override
from ..utils.value_shapes import _auto_nested_depth

_AUTO_VIEW_TYPE_MAP: dict[str, ViewKind] = {
    "list[list]": ViewKind.MATRIX,
    "list[tuple]": ViewKind.MATRIX,
    "tuple[list]": ViewKind.MATRIX,
    "tuple[tuple]": ViewKind.MATRIX,
    "list[number]": ViewKind.ARRAY_CELLS,
    "tuple[number]": ViewKind.ARRAY_CELLS,
    "set[number]": ViewKind.ARRAY_CELLS,
    "frozenset[number]": ViewKind.ARRAY_CELLS,
    "list[any]": ViewKind.ARRAY_CELLS,
    "tuple[any]": ViewKind.ARRAY_CELLS,
    "set[any]": ViewKind.ARRAY_CELLS,
    "frozenset[any]": ViewKind.ARRAY_CELLS,
    "dict[str, any]": ViewKind.TABLE,
    "dict[any, any]": ViewKind.TABLE,
    "dict": ViewKind.TABLE,
    "linked_list": ViewKind.LINKED_LIST,
    "tree": ViewKind.TREE,
}


def make_value_coercer(config: VisualizerConfig) -> Callable[[Any], Any]:
    pipeline: ConverterPipeline = config.converter_pipeline

    def _coerce(value: Any) -> Any:
        coerced, _ = pipeline.coerce(value)
        return coerced

    return _coerce


def choose_view(value: Any) -> ViewKind:
    if _detect_image_source(value) is not None:
        return ViewKind.IMAGE
    if _try_networkx_edges_nodes(value) is not None or _looks_like_graph_mapping(value):
        return ViewKind.GRAPH
    if _collect_linked_list_labels(value, max_nodes=10) is not None:
        return ViewKind.LINKED_LIST
    if isinstance(value, (list, tuple)) and _looks_like_hash_table(list(value)):
        return ViewKind.HASH_TABLE
    if _tree_children(value) is not None:
        return ViewKind.TREE
    pattern_view = _match_type_pattern_override(value, _AUTO_VIEW_TYPE_MAP)
    return pattern_view if pattern_view is not None else ViewKind.NODE_LINK


def compatible_views(value: Any) -> list[ViewKind]:
    if _detect_image_source(value) is not None:
        return [ViewKind.AUTO, ViewKind.IMAGE]
    if _try_networkx_edges_nodes(value) is not None or _looks_like_graph_mapping(value):
        return [ViewKind.AUTO, ViewKind.GRAPH]
    if _collect_linked_list_labels(value, max_nodes=10) is not None:
        return [ViewKind.AUTO, ViewKind.LINKED_LIST]
    if isinstance(value, (list, tuple)) and _looks_like_hash_table(list(value)):
        return [ViewKind.AUTO, ViewKind.HASH_TABLE]
    if _tree_children(value) is not None:
        return [ViewKind.AUTO, ViewKind.TREE]
    pattern_view = _match_type_pattern_override(value, _AUTO_VIEW_TYPE_MAP)
    if pattern_view == ViewKind.MATRIX:
        return [ViewKind.AUTO, ViewKind.MATRIX]
    if pattern_view == ViewKind.ARRAY_CELLS:
        numeric = isinstance(value, (list, tuple, set, frozenset)) and all(
            isinstance(item, (int, float)) for item in value
        )
        if numeric and isinstance(value, (list, tuple)):
            return [ViewKind.AUTO, ViewKind.ARRAY_CELLS, ViewKind.BAR, ViewKind.HEAP_DUAL]
        return [ViewKind.AUTO, ViewKind.ARRAY_CELLS]
    if pattern_view == ViewKind.TABLE or isinstance(value, dict):
        return [ViewKind.AUTO, ViewKind.TABLE]
    return [ViewKind.AUTO]


def apply_view_override(
    name: str, value: Any, view_map: ViewOverrideMap | None
) -> ViewKind | None:
    if not view_map:
        return None
    if name in view_map:
        return view_map[name]
    for key, override in view_map.items():
        if isinstance(key, type) and isinstance(value, key):
            return override
    return None


def resolve_recursion_depth(name: str, value: Any, config: VisualizerConfig) -> int:
    depth_map = config.recursion_depth_map
    if name in depth_map:
        resolved = depth_map[name]
    else:
        resolved = None
        for key, depth in depth_map.items():
            if isinstance(key, type) and isinstance(value, key):
                resolved = depth
                break
        if resolved is None:
            resolved = config.recursion_depth_default

    resolved_depth = config.recursion_depth_default if resolved is None else resolved
    if resolved_depth < 0:
        resolved_depth = _auto_nested_depth(value, config.auto_recursion_depth_cap)
    resolved_depth = max(0, resolved_depth)
    return min(resolved_depth, max(0, config.max_depth))


def determine_view(
    name: str,
    original_value: Any,
    coerced_value: Any,
    config: VisualizerConfig,
) -> tuple[ViewKind, bool]:
    override_view = _match_named_override(name, config.view_name_map)
    if override_view is not None:
        return override_view, True
    override_view = _match_type_pattern_override(original_value, config.view_type_map)
    if override_view is not None:
        return override_view, True
    override_view = apply_view_override(name, original_value, config.view_map)
    if override_view is not None:
        return override_view, True
    return choose_view(coerced_value), False
