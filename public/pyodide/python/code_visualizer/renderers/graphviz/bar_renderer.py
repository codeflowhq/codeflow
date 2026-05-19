from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.value_formatting import dot_escape_label
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ...utils.value_shapes import _is_list_numbers
from ..shared.theme import (
    BG_BAR_NEGATIVE_SOFT,
    BG_BAR_POSITIVE_SOFT,
    TEXT_INDEX,
    TEXT_PRIMARY,
)


def render_graphviz_bar(
    arr: list[Any], title: str = "bar", *, max_items: int = 50
) -> str:
    if not _is_list_numbers(arr):
        raise TypeError("bar expects list[number]")
    labels = [str(index) for index, _ in enumerate(arr[:max_items])]
    values = [float(value) for value in arr[:max_items]]
    if len(arr) > max_items:
        labels.append("…")
        values.append(0.0)

    dot = Digraph("bar")
    dot.attr("graph", labelloc="t", label=dot_escape_label(title))
    dot.attr("node", shape="plain")
    if not labels:
        dot.node(
            "bars",
            label=f'<<table id="{_stable_svg_id(title, "wrapper")}" border="0"><tr><td id="{_stable_svg_id(title, "value", "empty")}">∅</td></tr></table>>',
        )
        return str(dot.source)

    max_abs = max((abs(number) for number in values), default=1.0) or 1.0
    max_height_px = 160
    table = ['<table border="0" cellborder="0" cellspacing="10"><tr>']
    for label, value in zip(labels, values, strict=False):
        norm = abs(value) / max_abs
        height = max(24, int(max_height_px * norm))
        gap = max(0, max_height_px - height)
        color = BG_BAR_POSITIVE_SOFT if value >= 0 else BG_BAR_NEGATIVE_SOFT
        value_text = int(value) if float(value).is_integer() else round(value, 2)
        inner = (
            "<table border='0' cellborder='0' cellspacing='0' cellpadding='0'>"
            f"<tr><td height='{gap}'></td></tr>"
            f"<tr><td bgcolor='{color}' width='34' height='{height}'></td></tr>"
            f"<tr><td align='center'><font point-size='11' color='{TEXT_PRIMARY}'>{value_text}</font></td></tr>"
            f"<tr><td align='center'><font point-size='9' color='{TEXT_INDEX}'>{label}</font></td></tr>"
            "</table>"
        )
        table.append(
            f"<td id='{_stable_svg_id(title, 'bar', label)}' valign='bottom'>{inner}</td>"
        )
    table.append("</tr></table>")
    dot.node("bars", label=f"<{''.join(table)}>")
    return str(dot.source)
