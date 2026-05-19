from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.value_formatting import dot_escape_label
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ...utils.value_formatting import table_cell_text as _table_cell_text
from ..html.labels import html_bold_text, html_cell, html_row, html_table
from ..html.tables import NestedRenderer, _format_nested_value
from ..shared.theme import BG_HEADER, ELLIPSIS_TEXT


def render_graphviz_table(
    data: dict[Any, Any],
    title: str = "dict",
    *,
    max_items: int = 50,
    nested_depth: int = 0,
    nested_renderer: NestedRenderer | None = None,
) -> str:
    items = list(data.items())
    limit = min(len(items), max_items)
    dot = Digraph("dict")
    dot.attr("graph", labelloc="t", label=dot_escape_label(title))
    dot.attr("node", shape="plain")
    rows = [
        html_row(
            html_cell(
                html_bold_text("Key"),
                id=_stable_svg_id(title, "header", "key"),
                bgcolor=BG_HEADER,
            ),
            html_cell(
                html_bold_text("Value"),
                id=_stable_svg_id(title, "header", "value"),
                bgcolor=BG_HEADER,
            ),
        )
    ]
    if not items:
        rows.append(
            html_row(
                html_cell("∅", id=_stable_svg_id(title, "row", "empty"), colspan="2")
            )
        )
    else:
        inner_depth = max(0, nested_depth) - 1 if nested_depth > 0 else 0
        for index, (key, value) in enumerate(items[:limit]):
            value_html = _format_nested_value(
                value, inner_depth, max_items, nested_renderer, f"{title}.{key}"
            )
            rows.append(
                html_row(
                    html_cell(
                        _table_cell_text(key),
                        id=_stable_svg_id(title, "row", index, "key"),
                    ),
                    html_cell(
                        value_html, id=_stable_svg_id(title, "row", index, "value")
                    ),
                )
            )
        if len(items) > max_items:
            rows.append(
                html_row(
                    html_cell(
                        f"<font color='{ELLIPSIS_TEXT}'>… (+more)</font>",
                        id=_stable_svg_id(title, "row", "ellipsis"),
                        colspan="2",
                    )
                )
            )
    table = html_table(
        *rows,
        id=_stable_svg_id(title, "wrapper"),
        border="1",
        cellborder="1",
        cellspacing="0",
    )
    dot.node("dictview", label=f"<{table}>")
    return str(dot.source)
