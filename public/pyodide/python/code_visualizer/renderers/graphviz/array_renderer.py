from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.value_formatting import dot_escape_label
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ...utils.value_shapes import _is_matrix_value
from ..html.labels import (
    html_cell,
    html_font,
    html_row,
    html_single_cell_table,
    html_table,
)
from ..html.tables import NestedRenderer, _format_nested_value
from ..shared.theme import BG_FOCUS_SOFT, FONT_FAMILY, TEXT_INDEX, TEXT_PRIMARY


def render_graphviz_array_cells(
    arr: list[Any],
    title: str = "array",
    *,
    max_items: int = 50,
    nested_depth: int = 0,
    nested_renderer: NestedRenderer | None = None,
) -> str:
    item_count = len(arr)
    limit = min(item_count, max_items)
    dot = Digraph("array")
    dot.attr(
        "graph",
        labelloc="t",
        label=dot_escape_label(f"{title} [cell-node-v1]"),
        ranksep="0.18",
        nodesep="0.02",
    )
    dot.attr("node", shape="plain", margin="0", fontname=FONT_FAMILY)
    dot.attr("edge", style="invis")
    depth_budget = max(0, nested_depth)

    if item_count == 0:
        empty_label = html_single_cell_table(
            "∅",
            table_attrs={"border": "1", "cellborder": "1", "cellspacing": "0"},
            cell_attrs={"id": _stable_svg_id(title, "value", "empty")},
            cellpadding="6",
        )
        dot.node(
            "array_empty",
            label=f"<{empty_label}>",
            id=_stable_svg_id(title, "node", "empty"),
        )
        return str(dot.source)

    value_node_ids: list[str] = []
    index_node_ids: list[str] = []
    for index in range(limit):
        cell_depth = depth_budget - 1 if depth_budget > 0 else 0
        if cell_depth == 0 and _is_matrix_value(arr[index]):
            cell_depth = 1
        slot_name = f"{title}[{index}]"
        cell_html = _format_nested_value(
            arr[index], cell_depth, max_items, nested_renderer, slot_name
        )
        value_node_id = f"value_{index}"
        index_node_id = f"index_{index}"
        value_node_ids.append(value_node_id)
        index_node_ids.append(index_node_id)
        value_label = html_single_cell_table(
            f"CELL {index}: {cell_html}",
            table_attrs={"border": "1", "cellborder": "1", "cellspacing": "0"},
            cell_attrs={
                "id": _stable_svg_id(title, "value", index),
                "align": "center",
                "bgcolor": BG_FOCUS_SOFT,
                "color": TEXT_PRIMARY,
                "cellpadding": "4",
            },
        )
        index_label = html_table(
            html_row(
                html_cell(
                    html_font(str(index), {"color": TEXT_INDEX, "point-size": 12}),
                    id=_stable_svg_id(title, "index", index),
                    width="48",
                    align="center",
                )
            ),
            border="0",
            cellborder="0",
            cellspacing="0",
        )
        dot.node(
            value_node_id,
            label=f"<{value_label}>",
            id=_stable_svg_id(title, "node", "value", index),
        )
        dot.node(
            index_node_id,
            label=f"<{index_label}>",
            id=_stable_svg_id(title, "node", "index", index),
        )

    if item_count > max_items:
        value_node_ids.append("value_ellipsis")
        index_node_ids.append("index_ellipsis")
        ellipsis_label = html_single_cell_table(
            "…",
            table_attrs={"border": "1", "cellborder": "1", "cellspacing": "0"},
            cell_attrs={
                "id": _stable_svg_id(title, "value", "ellipsis"),
                "width": "48",
                "height": "36",
                "align": "center",
            },
        )
        index_ellipsis_label = html_table(
            html_row(
                html_cell("", id=_stable_svg_id(title, "index", "ellipsis"), width="48")
            ),
            border="0",
            cellborder="0",
            cellspacing="0",
        )
        dot.node(
            "value_ellipsis",
            label=f"<{ellipsis_label}>",
            id=_stable_svg_id(title, "node", "value", "ellipsis"),
        )
        dot.node(
            "index_ellipsis",
            label=f"<{index_ellipsis_label}>",
            id=_stable_svg_id(title, "node", "index", "ellipsis"),
        )

    for left, right in zip(value_node_ids, value_node_ids[1:], strict=False):
        dot.edge(left, right)
    for left, right in zip(index_node_ids, index_node_ids[1:], strict=False):
        dot.edge(left, right)
    if value_node_ids:
        dot.body.append("{rank=same; " + " ".join(value_node_ids) + " }")
    if index_node_ids:
        dot.body.append("{rank=same; " + " ".join(index_node_ids) + " }")
    return str(dot.source)
