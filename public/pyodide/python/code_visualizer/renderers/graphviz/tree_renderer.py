from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import Any

from ...shared.models import EdgeKind, NodeKind, VisualEdge, VisualGraph, VisualNode
from ...utils.detection.tree import _tree_children
from ..html.tables import _format_value_label


@dataclass
class _TreeBuilder:
    graph: VisualGraph
    nested_depth: int
    max_items: int
    max_nodes: int
    info_cache: dict[int, tuple[Any, list[Any]] | None] = field(default_factory=dict)
    id_map: dict[int, str] = field(default_factory=dict)
    signature_counts: dict[str, int] = field(default_factory=dict)

    def tree_info(self, node: Any) -> tuple[Any, list[Any]] | None:
        object_id = id(node)
        if object_id not in self.info_cache:
            self.info_cache[object_id] = _tree_children(node)
        return self.info_cache[object_id]

    def subtree_signature(self, node: Any) -> str:
        info = self.tree_info(node)
        if info is None:
            payload = f"leaf|{type(node).__name__}|{node!r}"
            return hashlib.blake2s(payload.encode("utf-8"), digest_size=8).hexdigest()

        raw_label, children = info
        child_signatures = ",".join(
            sorted(self.subtree_signature(child) for child in children)
        )
        payload = f"tree|{type(node).__name__}|{raw_label!r}|{child_signatures}"
        return hashlib.blake2s(payload.encode("utf-8"), digest_size=8).hexdigest()

    def node_signature(self, node: Any) -> str:
        return self.subtree_signature(node)

    def node_id_for(self, node: Any) -> str:
        object_id = id(node)
        existing = self.id_map.get(object_id)
        if existing is not None:
            return existing
        signature = self.node_signature(node)
        self.signature_counts[signature] = self.signature_counts.get(signature, 0) + 1
        node_id = f"t_{signature}_{self.signature_counts[signature]}"
        self.id_map[object_id] = node_id
        return node_id

    def ensure_node(self, node: Any) -> str:
        node_id = self.node_id_for(node)
        if node_id in self.graph.nodes:
            return node_id
        info = self.tree_info(node)
        raw_label = info[0] if info is not None else node
        label_text, is_html = _format_value_label(
            raw_label, self.nested_depth, self.max_items
        )
        meta: dict[str, Any] = {"kind": "tree_node", "node_attrs": {"shape": "circle"}}
        if is_html:
            meta["html_label"] = True
            meta["node_attrs"] = {"shape": "plain"}
        self.graph.add_node(VisualNode(node_id, NodeKind.OBJECT, label_text, meta))
        return node_id

    def add_children(self, node: Any, stack: list[Any]) -> None:
        info = self.tree_info(node)
        if info is None:
            return
        _, children = info
        src_id = self.ensure_node(node)
        for child in children:
            child_id = self.ensure_node(child)
            self.graph.add_edge(
                VisualEdge(src_id, child_id, type=EdgeKind.CONTAINS, label=None)
            )
            stack.append(child)


def build_tree(
    root: Any,
    *,
    name: str = "root",
    max_nodes: int = 80,
    nested_depth: int = 0,
    max_items: int = 50,
) -> tuple[str, VisualGraph]:
    del name
    graph = VisualGraph()
    builder = _TreeBuilder(
        graph=graph, nested_depth=nested_depth, max_items=max_items, max_nodes=max_nodes
    )

    root_id = builder.ensure_node(root)
    stack = [root]
    seen: set[int] = set()
    created = 0

    while stack and created < max_nodes:
        current = stack.pop()
        object_id = id(current)
        if object_id in seen:
            continue
        seen.add(object_id)
        created += 1
        builder.add_children(current, stack)

    if stack:
        ellipsis_id = "CUT"
        graph.add_node(
            VisualNode(ellipsis_id, NodeKind.ELLIPSIS, "… (cutoff)", {"cutoff": True})
        )
        graph.add_edge(
            VisualEdge(root_id, ellipsis_id, type=EdgeKind.CONTAINS, label=None)
        )

    return root_id, graph
