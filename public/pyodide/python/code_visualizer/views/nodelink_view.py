from __future__ import annotations

from collections.abc import Callable
from typing import Any, Literal

from ..renderers.graphviz.renderer import render_graphviz_node_link
from ..shared.models import Artifact, ArtifactKind
from ..shared.view_kinds import ViewKind
from .nodelink_graph import NodelinkGraphBuilder, NodelinkGraphOptions

DirectionLiteral = Literal["LR", "TD"]


def build_nodelink_artifact(
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
