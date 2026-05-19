from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.value_formatting import dot_escape_label
from ..html.tables import NestedRenderer, _format_matrix_html


def render_graphviz_matrix(
    matrix: list[list[Any]],
    title: str = "matrix",
    *,
    max_rows: int = 25,
    max_cols: int = 25,
    nested_depth: int = 0,
    max_items: int = 50,
    nested_renderer: NestedRenderer | None = None,
) -> str:
    rows = [list(row) for row in matrix]
    dot = Digraph("matrix")
    dot.attr("graph", labelloc="t", label=dot_escape_label(title))
    dot.attr("node", shape="plain")
    nested_depth_inner = max(0, nested_depth) - 1 if nested_depth > 0 else 0
    table_html = _format_matrix_html(
        rows,
        nested_depth_inner,
        max_items,
        include_headers=True,
        row_limit=max_rows,
        col_limit=max_cols,
        nested_renderer=nested_renderer,
        slot_name=title,
    )
    dot.node("matrix", label=f"<{table_html}>")
    return str(dot.source)
