from __future__ import annotations

from collections import defaultdict
from typing import Literal

from graphviz import Digraph  # type: ignore[import-untyped]

from ...shared.models import VisualGraph
from ...utils.value_formatting import dot_escape_label
from ..shared.theme import BG_SURFACE, BORDER_CHAIN, BORDER_TREE, FONT_FAMILY

DirectionLiteral = Literal["LR", "TD"]


def _assign_rank_group(
    spec: str,
    node_id: str,
    *,
    rank_groups: dict[str, list[str]],
    min_rank: list[str],
    max_rank: list[str],
) -> None:
    if spec == "min":
        min_rank.append(node_id)
    elif spec == "max":
        max_rank.append(node_id)
    else:
        rank_groups[spec].append(node_id)


def _add_graphviz_nodes(
    dot: Digraph,
    graph: VisualGraph,
    *,
    rank_groups: dict[str, list[str]],
    min_rank: list[str],
    max_rank: list[str],
) -> None:
    for node_id in sorted(graph.nodes.keys()):
        node = graph.nodes[node_id]
        node_attrs = dict(node.meta.get("node_attrs", {}))
        if node.meta.get("html_label"):
            dot.node(str(node_id), label=f"<{node.label}>", **node_attrs)
        else:
            dot.node(str(node_id), label=dot_escape_label(node.label), **node_attrs)
        rank_spec = node.meta.get("rank")
        if isinstance(rank_spec, str):
            _assign_rank_group(
                rank_spec,
                str(node_id),
                rank_groups=rank_groups,
                min_rank=min_rank,
                max_rank=max_rank,
            )
        elif isinstance(rank_spec, (list, tuple, set)):
            for spec in rank_spec:
                if isinstance(spec, str):
                    _assign_rank_group(
                        spec,
                        str(node_id),
                        rank_groups=rank_groups,
                        min_rank=min_rank,
                        max_rank=max_rank,
                    )


def _add_graphviz_edges(dot: Digraph, graph: VisualGraph) -> None:
    for edge in graph.edges:
        attrs = dict(edge.meta.get("edge_attrs", {}))
        tailport = edge.meta.get("tailport")
        headport = edge.meta.get("headport")
        if tailport:
            attrs["tailport"] = tailport
        if headport:
            attrs["headport"] = headport
        if edge.label is not None:
            attrs["label"] = dot_escape_label(edge.label)
        dot.edge(str(edge.src), str(edge.dst), **attrs)


def _add_rank_constraints(
    dot: Digraph,
    *,
    rank_groups: dict[str, list[str]],
    min_rank: list[str],
    max_rank: list[str],
) -> None:
    for members in rank_groups.values():
        if len(members) > 1:
            dot.body.append(f"{{rank=same; {' '.join(members)} }}")
    if min_rank:
        dot.body.append(f"{{rank=min; {' '.join(min_rank)} }}")
    if max_rank:
        dot.body.append(f"{{rank=max; {' '.join(max_rank)} }}")


def render_graphviz_node_link(
    graph: VisualGraph, direction: DirectionLiteral = "LR"
) -> str:
    rankdir = "LR" if direction == "LR" else "TB"
    dot = Digraph("G")
    graph_attrs = {"rankdir": rankdir, "nodesep": "0.6", "ranksep": "0.7"}
    graph_attrs.update({key: str(value) for key, value in graph.graph_attrs.items()})
    dot.attr("graph", **graph_attrs)
    dot.attr(
        "node",
        shape="box",
        style="rounded,filled",
        fillcolor=BG_SURFACE,
        color=BORDER_TREE,
        fontname=FONT_FAMILY,
    )
    dot.attr("edge", color=BORDER_CHAIN, fontname=FONT_FAMILY)

    rank_groups: dict[str, list[str]] = defaultdict(list)
    min_rank: list[str] = []
    max_rank: list[str] = []
    _add_graphviz_nodes(
        dot, graph, rank_groups=rank_groups, min_rank=min_rank, max_rank=max_rank
    )
    _add_graphviz_edges(dot, graph)
    _add_rank_constraints(
        dot, rank_groups=rank_groups, min_rank=min_rank, max_rank=max_rank
    )

    return str(dot.source)
