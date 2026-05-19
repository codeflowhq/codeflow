from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Literal

from ..shared.models import (
    Anchor,
    AnchorKind,
    EdgeKind,
    NodeKind,
    VisualEdge,
    VisualGraph,
    VisualNode,
)


@dataclass(slots=True)
class NodelinkGraphOptions:
    max_depth: int = 4
    max_items: int = 30
    include_object_attrs: bool = True
    max_str_len: int = 80
    string_style: Literal["pretty", "repr"] = "pretty"
    show_index_in_node: bool = False
    show_index_on_edge: bool = True
    dict_style: Literal["entry_node", "kv_edges"] = "entry_node"
    max_table_rows: int = 30
    max_table_cols: int = 12


class NodelinkGraphBuilder:
    def __init__(
        self,
        options: NodelinkGraphOptions | None = None,
        value_coercer: Callable[[Any], Any] | None = None,
    ) -> None:
        self.opts = options or NodelinkGraphOptions()
        self._obj_to_node: dict[int, str] = {}
        self._counter = 0
        self._coerce_value = value_coercer

    def extract(self, value: Any, name: str | None = None) -> VisualGraph:
        graph = VisualGraph()
        root_id = self._visit(value, graph, depth=0, hint=name)
        if name is not None:
            graph.anchors.append(
                Anchor(name=name, node_id=root_id, kind=AnchorKind.VAR)
            )
        return graph

    def _new_id(self, prefix: str = "n") -> str:
        self._counter += 1
        return f"{prefix}{self._counter}"

    def _short_str(self, text: str) -> str:
        if len(text) <= self.opts.max_str_len:
            return text
        return text[: self.opts.max_str_len - 3] + "..."

    def _is_scalar(self, value: Any) -> bool:
        return value is None or isinstance(value, (bool, int, float, str))

    def _pretty_str(self, value: str) -> str:
        normalized = value.replace("\r\n", "\n").replace("\r", "\n")
        return self._short_str(normalized.replace("\n", "⏎"))

    def _scalar_label(self, value: Any) -> str:
        if isinstance(value, str):
            if self.opts.string_style == "repr":
                return repr(self._short_str(value))
            return self._pretty_str(value)
        return repr(value)

    def _visit(
        self, value: Any, graph: VisualGraph, depth: int, hint: str | None = None
    ) -> str:
        coerced = self._coerce_value(value) if self._coerce_value is not None else value
        if depth > self.opts.max_depth:
            return self._add_ellipsis(graph, depth, "… (max depth)")
        if self._is_scalar(coerced):
            return self._add_scalar(graph, coerced, hint)

        object_id = id(coerced)
        existing = self._obj_to_node.get(object_id)
        if existing is not None:
            return existing

        networkx_node = self._visit_networkx_graph(coerced, graph, hint)
        if networkx_node is not None:
            self._obj_to_node[object_id] = networkx_node
            return networkx_node

        if isinstance(coerced, list):
            return self._visit_sequence_container(
                coerced, graph, depth, hint, "l", NodeKind.LIST, "list"
            )
        if isinstance(coerced, tuple):
            return self._visit_sequence_container(
                coerced, graph, depth, hint, "t", NodeKind.TUPLE, "tuple"
            )
        if isinstance(coerced, dict):
            return self._visit_dict_container(coerced, graph, depth, hint)
        if isinstance(coerced, (set, frozenset)):
            return self._visit_set_container(coerced, graph, depth, hint)
        return self._visit_object_container(coerced, graph, depth, hint)

    def _add_ellipsis(self, graph: VisualGraph, depth: int, label: str) -> str:
        node_id = self._new_id("e")
        graph.add_node(VisualNode(node_id, NodeKind.ELLIPSIS, label, {"depth": depth}))
        return node_id

    def _add_scalar(self, graph: VisualGraph, value: Any, hint: str | None) -> str:
        node_id = self._new_id("s")
        label = self._scalar_label(value)
        if hint:
            label = f"{hint}={label}"
        graph.add_node(
            VisualNode(
                node_id, NodeKind.SCALAR, label, {"py_type": type(value).__name__}
            )
        )
        return node_id

    def _visit_networkx_graph(
        self, value: Any, graph: VisualGraph, hint: str | None
    ) -> str | None:
        try:
            import networkx as nx  # type: ignore[import-untyped]
        except ImportError:
            return None
        if not isinstance(value, nx.Graph):
            return None

        node_id = self._new_id("G")
        label = f"Graph(|V|={value.number_of_nodes()}, |E|={value.number_of_edges()})"
        if hint:
            label = f"{hint}: {label}"
        graph.add_node(
            VisualNode(node_id, NodeKind.OBJECT, label, {"graph": "networkx"})
        )

        graph_node_ids: dict[Any, str] = {}
        for item in value.nodes():
            child_id = self._new_id("v")
            graph_node_ids[item] = child_id
            graph.add_node(
                VisualNode(child_id, NodeKind.SCALAR, str(item), {"graph_node": True})
            )
            graph.add_edge(
                VisualEdge(node_id, child_id, type=EdgeKind.CONTAINS, label="node")
            )

        for src, dst in value.edges():
            graph.add_edge(
                VisualEdge(
                    graph_node_ids[src],
                    graph_node_ids[dst],
                    type=EdgeKind.REF,
                    label="edge",
                )
            )
        return node_id

    def _visit_sequence_container(
        self,
        value: list[Any] | tuple[Any, ...],
        graph: VisualGraph,
        depth: int,
        hint: str | None,
        prefix: str,
        node_kind: NodeKind,
        kind_label: str,
    ) -> str:
        node_id = self._new_id(prefix)
        self._obj_to_node[id(value)] = node_id
        label = f"{kind_label}(len={len(value)})"
        if hint:
            label = f"{hint}: {label}"
        graph.add_node(VisualNode(node_id, node_kind, label, {"len": len(value)}))
        self._visit_sequence(value, graph, node_id, depth)
        return node_id

    def _visit_dict_container(
        self, value: dict[Any, Any], graph: VisualGraph, depth: int, hint: str | None
    ) -> str:
        node_id = self._new_id("d")
        self._obj_to_node[id(value)] = node_id
        label = f"dict(len={len(value)})"
        if hint:
            label = f"{hint}: {label}"
        graph.add_node(VisualNode(node_id, NodeKind.DICT, label, {"len": len(value)}))
        self._visit_dict(value, graph, node_id, depth)
        return node_id

    def _visit_set_container(
        self,
        value: set[Any] | frozenset[Any],
        graph: VisualGraph,
        depth: int,
        hint: str | None,
    ) -> str:
        node_id = self._new_id("S")
        self._obj_to_node[id(value)] = node_id
        label = f"set(len={len(value)})"
        if hint:
            label = f"{hint}: {label}"
        graph.add_node(VisualNode(node_id, NodeKind.SET, label, {"len": len(value)}))
        self._visit_set(value, graph, node_id, depth)
        return node_id

    def _visit_object_container(
        self, value: Any, graph: VisualGraph, depth: int, hint: str | None
    ) -> str:
        node_id = self._new_id("o")
        self._obj_to_node[id(value)] = node_id
        class_name = type(value).__name__
        label = f"{hint}: {class_name}" if hint else class_name
        graph.add_node(
            VisualNode(node_id, NodeKind.OBJECT, label, {"py_type": class_name})
        )

        if (
            not self.opts.include_object_attrs
            or not hasattr(value, "__dict__")
            or not isinstance(value.__dict__, dict)
        ):
            return node_id

        items = list(value.__dict__.items())
        for attr_name, attr_value in items[: self.opts.max_items]:
            child_id = self._visit(attr_value, graph, depth + 1, hint=attr_name)
            graph.add_edge(
                VisualEdge(node_id, child_id, type=EdgeKind.ATTR, label=attr_name)
            )
        if len(items) > self.opts.max_items:
            remaining = len(items) - self.opts.max_items
            ellipsis_id = self._new_id("e")
            graph.add_node(
                VisualNode(
                    ellipsis_id,
                    NodeKind.ELLIPSIS,
                    f"… (+{remaining} attrs)",
                    {"more": remaining},
                )
            )
            graph.add_edge(
                VisualEdge(node_id, ellipsis_id, type=EdgeKind.ATTR, label="more")
            )
        return node_id

    def _visit_sequence(
        self,
        value: list[Any] | tuple[Any, ...],
        graph: VisualGraph,
        parent_id: str,
        depth: int,
    ) -> None:
        if not value:
            empty_id = self._new_id("e")
            graph.add_node(
                VisualNode(empty_id, NodeKind.ELLIPSIS, "∅ (empty)", {"empty": True})
            )
            graph.add_edge(
                VisualEdge(parent_id, empty_id, type=EdgeKind.CONTAINS, label="empty")
            )
            return

        limit = min(len(value), self.opts.max_items)
        for index in range(limit):
            child_id = self._visit(value[index], graph, depth + 1, hint=None)
            graph.add_edge(
                VisualEdge(parent_id, child_id, type=EdgeKind.INDEX, label=str(index))
            )
        if len(value) > self.opts.max_items:
            self._add_more_node(
                graph, parent_id, len(value) - self.opts.max_items, "items"
            )

    def _visit_dict(
        self, value: dict[Any, Any], graph: VisualGraph, parent_id: str, depth: int
    ) -> None:
        if not value:
            empty_id = self._new_id("e")
            graph.add_node(
                VisualNode(empty_id, NodeKind.ELLIPSIS, "∅ (empty)", {"empty": True})
            )
            graph.add_edge(
                VisualEdge(parent_id, empty_id, type=EdgeKind.CONTAINS, label="empty")
            )
            return

        items = list(value.items())
        limit = min(len(items), self.opts.max_items)
        for index, (key, item_value) in enumerate(items[:limit]):
            entry_id = self._new_id("E")
            graph.add_node(
                VisualNode(
                    entry_id, NodeKind.ENTRY, f"entry[{index}]", {"index": index}
                )
            )
            graph.add_edge(
                VisualEdge(
                    parent_id, entry_id, type=EdgeKind.CONTAINS, label=str(index)
                )
            )
            key_id = self._visit(key, graph, depth + 1, hint=None)
            value_id = self._visit(item_value, graph, depth + 1, hint=None)
            graph.add_edge(VisualEdge(entry_id, key_id, type=EdgeKind.KEY, label="key"))
            graph.add_edge(
                VisualEdge(entry_id, value_id, type=EdgeKind.VALUE, label="val")
            )
        if len(items) > self.opts.max_items:
            self._add_more_node(
                graph, parent_id, len(items) - self.opts.max_items, "entries"
            )

    def _visit_set(
        self,
        value: set[Any] | frozenset[Any],
        graph: VisualGraph,
        parent_id: str,
        depth: int,
    ) -> None:
        items = list(value)
        if not items:
            empty_id = self._new_id("e")
            graph.add_node(
                VisualNode(empty_id, NodeKind.ELLIPSIS, "∅ (empty)", {"empty": True})
            )
            graph.add_edge(
                VisualEdge(parent_id, empty_id, type=EdgeKind.CONTAINS, label="empty")
            )
            return

        limit = min(len(items), self.opts.max_items)
        for item in items[:limit]:
            child_id = self._visit(item, graph, depth + 1, hint=None)
            graph.add_edge(
                VisualEdge(parent_id, child_id, type=EdgeKind.CONTAINS, label=None)
            )
        if len(items) > self.opts.max_items:
            self._add_more_node(
                graph, parent_id, len(items) - self.opts.max_items, "items"
            )

    def _add_more_node(
        self, graph: VisualGraph, parent_id: str, count: int, noun: str
    ) -> None:
        ellipsis_id = self._new_id("e")
        graph.add_node(
            VisualNode(
                ellipsis_id, NodeKind.ELLIPSIS, f"… (+{count} {noun})", {"more": count}
            )
        )
        graph.add_edge(
            VisualEdge(parent_id, ellipsis_id, type=EdgeKind.CONTAINS, label="more")
        )


VisualIRExtractor = NodelinkGraphBuilder
ExtractOptions = NodelinkGraphOptions
