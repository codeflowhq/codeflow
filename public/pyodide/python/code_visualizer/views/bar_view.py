from __future__ import annotations

from typing import Any

from ..renderers.html.labels import (
    html_bold_text,
    html_cell,
    html_font,
    html_row,
    html_table,
)
from ..renderers.shared.theme import (
    BG_SURFACE,
    BORDER_DEFAULT,
    ELLIPSIS_TEXT,
    FILL_BAR_NEGATIVE,
    FILL_BAR_POSITIVE,
    SUBTITLE_FONT_SIZE,
    TEXT_MUTED,
    TEXT_PRIMARY,
)
from ..shared.models import EdgeKind, NodeKind, VisualEdge, VisualNode
from ..utils.value_formatting import stable_svg_id as _stable_svg_id
from .context import ViewBuildContext
from .graph_layout import (
    attach_view_title,
    init_graph_attrs,
    new_node_id,
    safe_dot_token,
)


def _bar_entry_label(value: Any) -> str:
    if value is None:
        return "∅"
    if isinstance(value, float):
        display = f"{value:.2f}".rstrip("0").rstrip(".")
    else:
        display = str(value).strip()
    if not display:
        display = type(value).__name__
    if len(display) > 6:
        display = display[:5] + "…"
    return display


def _bar_item_label(
    fill: str, *, bar_height: int, spacer_height: int, value_label: str, index: int
) -> str:
    bar_body = html_table(
        html_row(html_cell("", width="28", height=spacer_height)),
        html_row(html_cell("", width="28", height=bar_height, bgcolor=fill)),
        border="0",
        cellborder="0",
        cellspacing="0",
        cellpadding="0",
    )
    return html_table(
        html_row(html_cell(bar_body, align="center")),
        html_row(
            html_cell(
                html_font(
                    html_bold_text(value_label),
                    {"color": TEXT_PRIMARY, "point-size": 11},
                ),
                align="center",
                cellpadding="2",
            )
        ),
        html_row(
            html_cell(
                html_font(
                    str(index), {"color": TEXT_MUTED, "point-size": SUBTITLE_FONT_SIZE}
                ),
                align="center",
                cellpadding="0",
            )
        ),
        border="0",
        cellborder="0",
        cellspacing="0",
        cellpadding="0",
    )


def build_bar_view_node_columns(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    logical_name = name.split(" [step ", 1)[0]
    if not isinstance(value, (list, tuple)):
        raise TypeError("bar_node view expects list-like numeric input")

    seq = list(value)
    item_limit = runtime.item_limit
    limit = min(len(seq), item_limit)
    numeric: list[float] = []
    for idx in range(limit):
        item = seq[idx]
        if not isinstance(item, (int, float)) or isinstance(item, bool):
            raise TypeError("bar_node view expects list[number]")
        numeric.append(float(item))

    graph = runtime.graph
    init_graph_attrs(
        graph,
        rankdir="TB",
        nodesep="0.02",
        ranksep="0.08",
        show_title=False,
    )

    root_id = new_node_id(runtime, "bar_exp")
    graph.add_node(
        VisualNode(
            root_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "bar_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )
    attach_view_title(runtime, root_id, name, "bar_node")

    if not numeric:
        empty_id = safe_dot_token("bar_empty", logical_name or "bar")
        empty_label = html_table(
            html_row(html_cell("∅", align="center", bgcolor=BG_SURFACE)),
            border="1",
            cellborder="1",
            cellspacing="0",
            cellpadding="6",
        )
        graph.add_node(
            VisualNode(
                empty_id,
                NodeKind.OBJECT,
                empty_label,
                {
                    "html_label": True,
                    "node_attrs": {
                        "shape": "plain",
                        "color": BORDER_DEFAULT,
                        "penwidth": "1.0",
                    },
                },
            )
        )
        graph.add_edge(
            VisualEdge(
                root_id,
                empty_id,
                type=EdgeKind.LAYOUT,
                meta={"edge_attrs": {"style": "invis"}},
            )
        )
        return root_id

    max_height = 120
    max_abs = max(abs(num) for num in numeric) or 1.0
    occurrence_counts: dict[str, int] = {}
    prev_id: str | None = None

    for idx in range(limit):
        raw = seq[idx]
        numeric_value = numeric[idx]
        scalar_key = str(raw)
        occurrence = occurrence_counts.get(scalar_key, 0)
        occurrence_counts[scalar_key] = occurrence + 1

        graph_id = safe_dot_token(
            "bar_item", logical_name or "bar", scalar_key, occurrence
        )
        svg_id = _stable_svg_id(
            logical_name or "bar", "bar", "item", scalar_key, occurrence
        )

        bar_height = max(12, int((abs(numeric_value) / max_abs) * max_height))
        spacer_height = max_height - bar_height
        fill = FILL_BAR_POSITIVE if numeric_value >= 0 else FILL_BAR_NEGATIVE
        value_label = _bar_entry_label(raw)

        bar_label = _bar_item_label(
            fill,
            bar_height=bar_height,
            spacer_height=spacer_height,
            value_label=value_label,
            index=idx,
        )
        graph.add_node(
            VisualNode(
                graph_id,
                NodeKind.OBJECT,
                bar_label,
                {
                    "kind": "bar_item",
                    "html_label": True,
                    "rank": "bar_items",
                    "node_attrs": {
                        "shape": "plain",
                        "color": fill,
                        "penwidth": "1.0",
                        "id": svg_id,
                    },
                },
            )
        )
        if prev_id is None:
            graph.add_edge(
                VisualEdge(
                    root_id,
                    graph_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis"}},
                )
            )
        else:
            graph.add_edge(
                VisualEdge(
                    prev_id,
                    graph_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis"}},
                )
            )
        prev_id = graph_id

    if len(seq) > item_limit and prev_id is not None:
        more_id = safe_dot_token("bar_more", logical_name or "bar")
        more_label = html_table(
            html_row(
                html_cell(
                    html_font("…", color=ELLIPSIS_TEXT),
                    align="center",
                    cellpadding="0",
                )
            ),
            html_row(
                html_cell(
                    html_font(
                        "…", {"color": TEXT_MUTED, "point-size": SUBTITLE_FONT_SIZE}
                    ),
                    align="center",
                    cellpadding="0",
                )
            ),
            border="0",
            cellborder="0",
            cellspacing="0",
            cellpadding="0",
        )
        graph.add_node(
            VisualNode(
                more_id,
                NodeKind.ELLIPSIS,
                more_label,
                {
                    "html_label": True,
                    "rank": "bar_items",
                    "node_attrs": {
                        "shape": "plain",
                        "color": BORDER_DEFAULT,
                        "penwidth": "1.0",
                    },
                },
            )
        )
        graph.add_edge(
            VisualEdge(
                prev_id,
                more_id,
                type=EdgeKind.LAYOUT,
                meta={"edge_attrs": {"style": "invis"}},
            )
        )

    return root_id
