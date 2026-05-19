from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.detection.linked import _collect_linked_list_labels
from ...utils.value_formatting import dot_escape_label
from ..html.tables import _format_value_label
from ..shared.dot_utils import _digraph_edge
from ..shared.theme import (
    BG_HEADER_MUTED,
    BG_SURFACE,
    BORDER_TREE,
    FONT_FAMILY,
    TEXT_NULL,
)


def render_graphviz_linked_list(
    head: Any,
    title: str = "list",
    *,
    max_nodes: int = 80,
    nested_depth: int = 0,
    max_items: int = 50,
) -> str:
    collected = _collect_linked_list_labels(head, max_nodes)
    if collected is None:
        raise TypeError("linked_list view expects an object with .next pointer")
    values, truncated = collected
    dot = Digraph("linked")
    dot.attr("graph", labelloc="t", label=dot_escape_label(title), rankdir="LR")
    dot.attr("node", shape="plaintext", fontname=FONT_FAMILY)
    if not values:
        dot.node("empty", label="∅")
        return str(dot.source)
    for index, value in enumerate(values):
        cell_label, html_label = _format_value_label(value, nested_depth, max_items)
        value_cell = (
            f'<td port="val" bgcolor="{BG_SURFACE}">{cell_label}</td>'
            if html_label
            else f'<td port="val" width="60" bgcolor="{BG_SURFACE}">{dot_escape_label(cell_label)}</td>'
        )
        node_label = f'<<table border="1" cellborder="1" cellspacing="0" color="{BORDER_TREE}"><tr>{value_cell}<td port="next" width="24" bgcolor="{BG_HEADER_MUTED}">&rarr;</td></tr></table>>'
        dot.node(f"n{index}", label=node_label)
    for index in range(len(values) - 1):
        _digraph_edge(dot, f"n{index}:next", f"n{index + 1}:val")
    if truncated:
        dot.node("tail_ellipsis", label="…", shape="plaintext")
        _digraph_edge(dot, f"n{len(values) - 1}:next", "tail_ellipsis")
    else:
        _digraph_edge(
            dot, f"n{len(values) - 1}:next", "null", style="dashed", color=TEXT_NULL
        )
        dot.node("null", label="None", shape="plaintext")
    dot.body.append(f"{{rank=same; {' '.join(f'n{i}' for i in range(len(values)))} }}")
    return str(dot.source)
