from __future__ import annotations

from typing import Any

from ...renderers.html.labels import (
    html_cell,
    html_font,
    html_row,
    html_single_cell_table,
    html_table,
)
from ...renderers.shared.theme import (
    BG_PANEL,
    BG_SURFACE,
    BODY_FONT_SIZE,
    BORDER_CHAIN,
    BORDER_DEFAULT,
    TEXT_MUTED,
    TEXT_NULL,
)
from ...shared.models import EdgeKind, NodeKind, VisualEdge, VisualNode
from ...utils.detection.linked import _collect_linked_list_labels
from ...utils.value_formatting import format_container_stub as _format_container_stub
from ...utils.value_formatting import format_scalar_html as _format_scalar_html
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ...utils.value_shapes import _is_scalar_value
from ..context import ViewBuildContext
from ..graph_layout import (
    attach_view_title,
    init_graph_attrs,
    new_node_id,
    render_nested_preview,
    safe_dot_token,
)


def build_linked_list_view_nodes(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    logical_name = name.split(" [step ", 1)[0]
    seq = _collect_linked_list_labels(value, runtime.item_limit)
    if seq is None:
        raise TypeError("linked_list_node view expects objects with .next")
    values, truncated = seq

    graph = runtime.graph
    init_graph_attrs(
        graph,
        rankdir="LR",
        nodesep="0.18",
        ranksep="0.30",
        show_title=False,
    )

    root_id = new_node_id(runtime, "linked_exp")
    graph.add_node(
        VisualNode(
            root_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "linked_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )
    attach_view_title(runtime, root_id, name, "linked_list_node")

    item_limit = runtime.item_limit
    depth_budget = max(0, depth)
    cell_depth = depth_budget - 1 if depth_budget > 0 else 0
    occurrence_counts: dict[str, int] = {}

    prev_id: str | None = None
    for idx, item in enumerate(values):
        slot_name = f"{name}[{idx}]"
        if _is_scalar_value(item):
            scalar_key = str(item)
            occurrence = occurrence_counts.get(scalar_key, 0)
            occurrence_counts[scalar_key] = occurrence + 1
            node_id = safe_dot_token(
                "linked_item", logical_name or "linked", scalar_key, occurrence
            )
            svg_id = _stable_svg_id(
                logical_name or "linked", "linked", "item", scalar_key, occurrence
            )
            content_html = _format_scalar_html(item)
        else:
            node_id = safe_dot_token("linked_node", logical_name or "linked", idx)
            svg_id = _stable_svg_id(logical_name or "linked", "linked", "node", idx)
            content_html = render_nested_preview(
                item, cell_depth, item_limit, slot_name
            )
            if not content_html:
                content_html = _format_container_stub(item)

        node_label = html_table(
            html_row(
                html_cell(
                    content_html, align="center", bgcolor=BG_SURFACE, cellpadding="6"
                ),
                html_cell(
                    html_font(
                        "next", {"color": TEXT_MUTED, "point-size": BODY_FONT_SIZE - 1}
                    ),
                    align="center",
                    bgcolor=BG_PANEL,
                    cellpadding="6",
                ),
            ),
            border="1",
            cellborder="1",
            cellspacing="0",
            cellpadding="0",
        )
        graph.add_node(
            VisualNode(
                node_id,
                NodeKind.OBJECT,
                node_label,
                {
                    "kind": "linked_list_node",
                    "html_label": True,
                    "node_attrs": {
                        "shape": "plain",
                        "color": BORDER_DEFAULT,
                        "penwidth": "1.1",
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
                    meta={
                        "edge_attrs": {
                            "color": BORDER_CHAIN,
                            "penwidth": "1.2",
                            "arrowhead": "normal",
                        }
                    },
                )
            )
        prev_id = node_id

    tail_id = safe_dot_token("linked_tail", logical_name or "linked")
    tail_text = "…" if truncated else "∅"
    tail_label = html_single_cell_table(
        html_font(tail_text, {"color": TEXT_NULL}),
        table_attrs={
            "border": "1",
            "cellborder": "1",
            "cellspacing": "0",
            "cellpadding": "6",
        },
        align="center",
        bgcolor=BG_SURFACE,
    )
    graph.add_node(
        VisualNode(
            tail_id,
            NodeKind.OBJECT,
            tail_label,
            {
                "html_label": True,
                "node_attrs": {
                    "shape": "plain",
                    "color": BORDER_DEFAULT,
                    "penwidth": "1.0",
                    "id": _stable_svg_id(logical_name or "linked", "linked", "tail"),
                },
            },
        )
    )
    if prev_id is None:
        graph.add_edge(
            VisualEdge(
                root_id,
                tail_id,
                type=EdgeKind.LAYOUT,
                meta={"edge_attrs": {"style": "invis"}},
            )
        )
    else:
        graph.add_edge(
            VisualEdge(
                prev_id,
                tail_id,
                type=EdgeKind.LAYOUT,
                meta={
                    "edge_attrs": {
                        "color": TEXT_NULL,
                        "penwidth": "1.1",
                        "arrowhead": "normal",
                    }
                },
            )
        )

    return root_id
