from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class NodeKind(StrEnum):
    SCALAR = "scalar"
    LIST = "list"
    TUPLE = "tuple"
    DICT = "dict"
    SET = "set"
    OBJECT = "object"
    ENTRY = "entry"
    ELLIPSIS = "ellipsis"


class EdgeKind(StrEnum):
    CONTAINS = "contains"
    INDEX = "index"
    KEY = "key"
    VALUE = "value"
    ATTR = "attr"
    REF = "ref"
    LINK = "link"
    LAYOUT = "layout"


class AnchorKind(StrEnum):
    VAR = "var"
    FOCUS = "focus"
    SELECTION = "selection"


class ArtifactKind(StrEnum):
    GRAPHVIZ = "graphviz"
    MERMAID = "mermaid"
    MARKDOWN = "markdown"
    HTML = "html"
    TEXT = "text"


@dataclass(frozen=True)
class VisualNode:
    id: str
    type: NodeKind
    label: str
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class VisualEdge:
    src: str
    dst: str
    type: EdgeKind = EdgeKind.LINK
    label: str | None = None
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Anchor:
    """Named handles into the graph; graph may have 0 anchors."""

    name: str
    node_id: str
    kind: AnchorKind = AnchorKind.VAR
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass
class VisualGraph:
    nodes: dict[str, VisualNode] = field(default_factory=dict)
    edges: list[VisualEdge] = field(default_factory=list)
    anchors: list[Anchor] = field(default_factory=list)  # replaces roots
    graph_attrs: dict[str, Any] = field(default_factory=dict)

    def add_node(self, node: VisualNode) -> None:
        self.nodes[node.id] = node

    def add_edge(self, edge: VisualEdge) -> None:
        self.edges.append(edge)


@dataclass(frozen=True)
class Frame:
    step: int
    value: Any
    note: str = ""
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Trace:
    name: str
    frames: list[Frame]


@dataclass(frozen=True)
class Artifact:
    kind: ArtifactKind
    content: str
    title: str | None = None
