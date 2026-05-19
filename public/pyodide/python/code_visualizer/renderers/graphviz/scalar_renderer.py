from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.value_formatting import dot_escape_label
from ..html.tables import _format_value_label
from ..shared.theme import FONT_FAMILY, TEXT_PRIMARY, TITLE_FONT_SIZE


def render_graphviz_scalar(
    value: Any, title: str = "value", *, nested_depth: int = 0, max_items: int = 50
) -> str:
    dot = Digraph("scalar")
    dot.attr("graph", labelloc="t", label=dot_escape_label(title))
    dot.attr(
        "node",
        shape="plaintext",
        fontname=FONT_FAMILY,
        fontcolor=TEXT_PRIMARY,
        fontsize=str(TITLE_FONT_SIZE),
    )
    label_text, is_html = _format_value_label(value, nested_depth, max_items)
    dot.node(
        "scalar_value", f"<{label_text}>" if is_html else dot_escape_label(label_text)
    )
    return str(dot.source)
