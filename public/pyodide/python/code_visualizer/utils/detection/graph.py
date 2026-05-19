from __future__ import annotations

from collections.abc import Mapping
from typing import Any


def _try_networkx_edges_nodes(
    value: Any,
) -> (
    tuple[list[tuple[Any, dict[Any, Any]]], list[tuple[Any, Any, dict[Any, Any]]], bool]
    | None
):
    try:
        import networkx as nx  # type: ignore
    except Exception:
        return None

    if isinstance(value, (nx.DiGraph, nx.MultiDiGraph)):
        return _networkx_snapshot(value, directed=True)
    if isinstance(value, (nx.Graph, nx.MultiGraph)):
        return _networkx_snapshot(value, directed=False)
    return None


def _networkx_snapshot(
    value: Any, *, directed: bool
) -> tuple[
    list[tuple[Any, dict[Any, Any]]], list[tuple[Any, Any, dict[Any, Any]]], bool
]:
    nodes = [(node, dict(data)) for (node, data) in value.nodes(data=True)]
    edges = [(src, dst, dict(data)) for (src, dst, data) in value.edges(data=True)]
    return nodes, edges, directed


def _looks_like_graph_mapping(value: Any) -> bool:
    if not isinstance(value, Mapping):
        return False
    edges = value.get("edges")
    if not isinstance(edges, list):
        return False
    nodes = value.get("nodes")
    if isinstance(nodes, list):
        return True
    for entry in edges:
        if isinstance(entry, Mapping) and any(
            key in entry for key in ("source", "target", "from", "to", "src", "dst")
        ):
            return True
        if isinstance(entry, (tuple, list)) and len(entry) >= 2:
            return True
    return False
