from __future__ import annotations

from collections.abc import Callable
from typing import Any, Literal

from ..renderers.graphviz.renderer import render_graphviz_node_link
from ..shared.models import (
    Anchor,
    AnchorKind,
    Artifact,
    ArtifactKind,
    NodeKind,
    VisualGraph,
    VisualNode,
)
from ..shared.view_kinds import ViewKind
from ..utils.image_sources import VisualizationImageError
from ..utils.value_formatting import format_scalar_html
from ..views.composite_view import STRUCTURED_VIEW_KINDS
from ..views.dispatcher import build_graph_view
from ..views.nodelink_graph import NodelinkGraphBuilder, NodelinkGraphOptions

DirectionLiteral = Literal["LR", "TD"]
ViewResolver = Callable[[str, Any, Any], tuple[ViewKind, bool]]


def render_scalar_artifact(
    name: str, value: Any, direction: DirectionLiteral, *, show_titles: bool
) -> Artifact:
    graph = VisualGraph()
    graph.add_node(
        VisualNode(
            "scalar_value",
            NodeKind.OBJECT,
            format_scalar_html(value),
            {"html_label": True, "node_attrs": {"shape": "plain"}},
        )
    )
    return Artifact(
        ArtifactKind.GRAPHVIZ,
        render_graphviz_node_link(graph, direction=direction),
        title=f"{name}: value" if show_titles else None,
    )


def render_structured_artifact(
    *,
    view: ViewKind,
    name: str,
    value: Any,
    direction: DirectionLiteral,
    recursion_budget: int,
    item_limit: int,
    configured_view: bool,
    value_coercer: Callable[[Any], Any],
    view_resolver: ViewResolver,
    focus_path: str | None = None,
    show_titles: bool = True,
) -> tuple[Artifact | None, bool]:
    if view not in STRUCTURED_VIEW_KINDS:
        return None, False

    try:
        root_id, nested_graph = build_graph_view(
            value,
            name,
            view,
            recursion_budget,
            item_limit=item_limit,
            value_coercer=value_coercer,
            view_resolver=view_resolver,
            focus_path=focus_path,
            show_titles=show_titles,
        )
    except (TypeError, VisualizationImageError):
        if configured_view:
            raise
        return None, True

    anchor_meta: dict[str, Any] = {}
    if view == ViewKind.GRAPH:
        anchor_meta["connect"] = False
    nested_graph.anchors.append(
        Anchor(name=name, node_id=root_id, kind=AnchorKind.VAR, meta=anchor_meta)
    )
    graph_direction: DirectionLiteral = (
        "TD" if view in {ViewKind.TREE, ViewKind.HASH_TABLE} else direction
    )
    graph_dot = render_graphviz_node_link(nested_graph, direction=graph_direction)
    artifact_title = f"{name}: {view.value}" if show_titles else None
    return Artifact(ArtifactKind.GRAPHVIZ, graph_dot, title=artifact_title), True


def render_fallback_nodelink_artifact(
    *,
    value: Any,
    name: str,
    direction: DirectionLiteral,
    max_depth: int,
    max_items: int,
    value_coercer: Callable[[Any], Any] | None,
    show_titles: bool,
) -> Artifact:
    graph = NodelinkGraphBuilder(
        NodelinkGraphOptions(max_depth=max_depth, max_items=max_items),
        value_coercer=value_coercer,
    ).extract(value, name=name)
    return Artifact(
        ArtifactKind.GRAPHVIZ,
        render_graphviz_node_link(graph, direction=direction),
        title=f"{name}: {ViewKind.NODE_LINK.value}" if show_titles else None,
    )
