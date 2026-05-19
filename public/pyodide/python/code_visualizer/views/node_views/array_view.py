from __future__ import annotations

import re
from collections.abc import Mapping
from typing import Any

from ...renderers.html.labels import html_cell, html_font, html_row, html_table
from ...renderers.html.tables import _format_nested_value
from ...renderers.shared.theme import (
    BG_FOCUS_SOFT,
    BG_SURFACE,
    BORDER_DEFAULT,
    BORDER_FOCUS,
    SUBTITLE_FONT_SIZE,
    TEXT_MUTED,
)
from ...shared.models import EdgeKind, NodeKind, VisualEdge, VisualNode
from ...utils.value_formatting import estimate_visual_height, estimate_visual_width
from ...utils.value_formatting import format_container_stub as _format_container_stub
from ...utils.value_formatting import format_scalar_html as _format_scalar_html
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ...utils.value_shapes import _is_scalar_value
from ..context import ViewBuildContext
from ..graph_layout import (
    flatten_nested_preview_frame,
    init_graph_attrs,
    new_node_id,
    safe_dot_token,
)


def _array_focus_index(focus_path: str | None, logical_name: str) -> int | None:
    if not focus_path:
        return None
    normalized_focus = focus_path.replace('"', "'")
    normalized_name = logical_name.replace('"', "'")
    if not normalized_focus.startswith(normalized_name):
        return None
    suffix = normalized_focus[len(normalized_name) :]
    match = re.match(r"^\[(\d+)\]", suffix)
    return int(match.group(1)) if match else None


def _array_cell_label(
    content_html: str,
    *,
    node_id: str,
    value_cell_width: int,
    value_cell_height: int,
    value_fill: str,
    index: int,
) -> str:
    return html_table(
        html_row(
            html_cell(
                content_html,
                port=f"{node_id}_value",
                width=value_cell_width,
                height=value_cell_height,
                fixedsize="true",
                align="center",
                bgcolor=value_fill,
                cellpadding="2",
            )
        ),
        html_row(
            html_cell(
                html_font(
                    str(index), {"color": TEXT_MUTED, "point-size": SUBTITLE_FONT_SIZE}
                ),
                align="center",
                bgcolor=BG_SURFACE,
                cellpadding="1",
            )
        ),
        border="1",
        cellborder="1",
        cellspacing="0",
        cellpadding="0",
    )


def build_array_view_node_cells(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    from ..composite_view import (
        experimental_array_nested_resolver,
        make_nested_renderer,
    )

    logical_name = name.split(" [step ", 1)[0]
    if isinstance(value, (set, frozenset)):
        array = sorted(value, key=lambda x: str(x))
    elif isinstance(value, Mapping) or isinstance(value, (str, bytes, bytearray)):
        raise TypeError("array_cells_node view expects a list-like input")
    elif hasattr(value, "__iter__") and hasattr(value, "__len__"):
        array = list(value)
    else:
        raise TypeError("array_cells_node view expects a list-like input")

    graph = runtime.graph
    init_graph_attrs(
        graph,
        rankdir="TB",
        nodesep="0.006",
        ranksep="0.06",
        title=logical_name,
        show_title=runtime.show_titles,
    )
    focus_idx = _array_focus_index(runtime.focus_path, logical_name)

    root_id = new_node_id(runtime, "arr_exp")
    graph.add_node(
        VisualNode(
            root_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "array_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )

    item_limit = runtime.item_limit
    depth_budget = max(0, depth)
    cell_depth = depth_budget - 1 if depth_budget > 0 else 0
    nested_runtime = runtime.with_resolver(
        experimental_array_nested_resolver(runtime, runtime.resolver)
    )
    limit = min(len(array), item_limit)
    visible_items = array[:limit]
    value_cell_height = max(
        30,
        min(
            420,
            max(
                (estimate_visual_height(item, item_limit) for item in visible_items),
                default=30,
            ),
        ),
    )
    value_cell_width = max(
        54,
        min(
            920,
            max(
                (estimate_visual_width(item, item_limit) for item in visible_items),
                default=54,
            ),
        ),
    )
    occurrence_counts: dict[str, int] = {}
    prev_id: str | None = None
    for idx in range(limit):
        item = array[idx]
        slot_name = f"{name}[{idx}]"
        is_focused = focus_idx is not None and focus_idx == idx
        value_fill = BG_FOCUS_SOFT if is_focused else BG_SURFACE
        border_color = BORDER_FOCUS if is_focused else BORDER_DEFAULT
        penwidth = "1.6" if is_focused else "1.1"
        if _is_scalar_value(item):
            scalar_key = str(item)
            occurrence = occurrence_counts.get(scalar_key, 0)
            occurrence_counts[scalar_key] = occurrence + 1
            node_id = safe_dot_token(
                "arr_item", logical_name or "array", scalar_key, occurrence
            )
            svg_id = _stable_svg_id(
                logical_name or "array", "array", "item", scalar_key, occurrence
            )
            content_html = _format_scalar_html(item)
        else:
            node_id = safe_dot_token("arr_cell", logical_name or "array", idx)
            svg_id = _stable_svg_id(logical_name or "array", "array", "cell", idx)
            if isinstance(item, (list, tuple, set, frozenset, dict)):
                content_html = _format_nested_value(
                    item, cell_depth, item_limit, None, slot_name
                )
            else:
                nested_renderer = make_nested_renderer(
                    nested_runtime, node_id, f"{node_id}_value", slot_name
                )
                content_html = flatten_nested_preview_frame(
                    nested_renderer(item, slot_name, cell_depth)
                    or _format_container_stub(item)
                )
        node_label = _array_cell_label(
            content_html,
            node_id=node_id,
            value_cell_width=value_cell_width,
            value_cell_height=value_cell_height,
            value_fill=value_fill,
            index=idx,
        )
        graph.add_node(
            VisualNode(
                node_id,
                NodeKind.OBJECT,
                node_label,
                {
                    "kind": "array_cell",
                    "html_label": True,
                    "rank": "array_items",
                    "node_attrs": {
                        "shape": "plain",
                        "color": border_color,
                        "penwidth": penwidth,
                        "id": svg_id,
                    },
                },
            )
        )
        if prev_id is None:
            graph.add_edge(
                VisualEdge(
                    root_id,
                    node_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis"}},
                )
            )
        else:
            graph.add_edge(
                VisualEdge(
                    prev_id,
                    node_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis"}},
                )
            )
        prev_id = node_id

    return root_id
