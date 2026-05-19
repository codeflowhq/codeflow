from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ..renderers.html.tables import _format_value_label
from ..shared.models import EdgeKind, NodeKind, VisualEdge, VisualGraph, VisualNode
from ..shared.view_kinds import ViewKind
from ..utils.detection.graph import (
    _looks_like_graph_mapping,
    _try_networkx_edges_nodes,
)
from .context import ViewBuildContext
from .graph_layout import (
    attach_view_title,
    merge_visual_graph,
    new_node_id,
    safe_dot_token,
)


def _edge_label_from_attrs(attrs: Mapping[str, Any]) -> Any:
    for key in ("label", "value", "weight", "text"):
        if key in attrs and attrs[key] is not None:
            return attrs[key]
    return None


def _normalize_graph_node_entry(entry: Any) -> tuple[Any, Any]:
    if isinstance(entry, Mapping):
        key = entry.get("id") or entry.get("name") or entry.get("key")
        if key is None:
            key = entry.get("label") or entry.get("value") or entry.get("data")
        payload = entry.get("value") or entry.get("label") or entry.get("data") or entry
        return key, payload
    if isinstance(entry, (tuple, list)) and entry:
        key = entry[0]
        payload = entry[1] if len(entry) > 1 else entry[0]
        return key, payload
    return entry, entry


def _graph_data_from_mapping(  # noqa: C901
    value: Any,
) -> tuple[list[tuple[Any, Any]], list[tuple[Any, Any, Any]], bool] | None:
    if not isinstance(value, Mapping):
        return None
    edges_raw = value.get("edges")
    if not isinstance(edges_raw, list):
        return None
    directed = bool(value.get("directed", True))
    nodes_raw = value.get("nodes")
    entries: list[tuple[Any, Any]] = []
    seen_keys: dict[Any, Any] = {}
    if isinstance(nodes_raw, list):
        for entry in nodes_raw:
            key, payload = _normalize_graph_node_entry(entry)
            if key in seen_keys:
                continue
            seen_keys[key] = payload
            entries.append((key, payload))
    edges: list[tuple[Any, Any, Any]] = []
    for entry in edges_raw:
        if isinstance(entry, Mapping):
            src = entry.get("source") or entry.get("from") or entry.get("src")
            dst = entry.get("target") or entry.get("to") or entry.get("dst")
            if src is None or dst is None:
                continue
            edges.append((src, dst, entry.get("label")))
        elif isinstance(entry, (tuple, list)) and len(entry) >= 2:
            src = entry[0]
            dst = entry[1]
            label = entry[2] if len(entry) >= 3 else None
            edges.append((src, dst, label))
    for key in seen_keys.keys():
        if key not in {k for k, _ in entries}:
            entries.append((key, seen_keys[key]))
    if not entries:
        derived_nodes = sorted(
            {src for src, _, _ in edges} | {dst for _, dst, _ in edges}
        )
        entries = [(node, node) for node in derived_nodes]
    return entries, edges, directed


def _extract_graph_data(
    value: Any,
) -> tuple[list[tuple[Any, Any]], list[tuple[Any, Any, Any]], bool] | None:
    nk = _try_networkx_edges_nodes(value)
    if nk is not None:
        nodes, edges, directed = nk
        normalized_nodes: list[tuple[Any, Any]] = []
        for node_key, attrs in nodes:
            payload = (
                attrs.get("value")
                or attrs.get("label")
                or attrs.get("data")
                or (attrs if attrs else node_key)
            )
            normalized_nodes.append((node_key, payload))
        normalized_edges = [
            (u, v, _edge_label_from_attrs(attrs)) for u, v, attrs in edges
        ]
        return normalized_nodes, normalized_edges, directed
    if _looks_like_graph_mapping(value):
        return _graph_data_from_mapping(value)
    return None


def build_graph_view_entry(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    graph_data = _extract_graph_data(value)
    if graph_data is None:
        raise TypeError(
            "graph view expects a networkx graph or mapping with nodes/edges"
        )

    nodes, edges, directed = graph_data
    item_limit = runtime.item_limit
    depth_budget = max(0, depth)
    node_label_depth = depth_budget - 1 if depth_budget > 0 else 0
    limit = min(len(nodes), item_limit)
    g = VisualGraph()
    container_id = new_node_id(runtime, "graph_root")
    g.add_node(
        VisualNode(
            container_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "graph_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )

    id_map: dict[Any, str] = {}
    node_ids: list[str] = []
    for idx, (key, payload) in enumerate(nodes[:limit]):
        label_text, is_html = _format_value_label(
            payload,
            node_label_depth,
            item_limit,
            None,
            f"{name}.nodes[{idx}]",
        )
        meta: dict[str, Any] = {"kind": "graph_node"}
        if is_html:
            meta["html_label"] = True
            meta["node_attrs"] = {"shape": "plain"}
        local_id = safe_dot_token("graph_node", name, key)
        g.add_node(VisualNode(local_id, NodeKind.OBJECT, label_text, meta))
        id_map[key] = local_id
        node_ids.append(local_id)

    edge_limit = min(len(edges), item_limit * 2)
    for src_key, dst_key, label in edges[:edge_limit]:
        sid = id_map.get(src_key)
        did = id_map.get(dst_key)
        if sid is None or did is None:
            continue
        edge_meta: dict[str, Any] = {}
        if not directed:
            edge_meta["edge_attrs"] = {"dir": "none"}
        g.add_edge(
            VisualEdge(sid, did, type=EdgeKind.LINK, label=label, meta=edge_meta)
        )

    if node_ids:
        for node_id in node_ids:
            g.add_edge(
                VisualEdge(
                    container_id,
                    node_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis"}},
                )
            )

    prefix = new_node_id(runtime, ViewKind.GRAPH)
    merged_root = merge_visual_graph(runtime, g, prefix, root_hint=container_id)
    attach_view_title(runtime, merged_root, name, "graph_label")
    return merged_root
