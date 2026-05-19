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
    BORDER_CHAIN,
    BORDER_DEFAULT,
    ELLIPSIS_TEXT,
    TEXT_NULL,
)
from ...shared.models import EdgeKind, NodeKind, VisualEdge, VisualNode
from ...utils.value_formatting import format_container_stub as _format_container_stub
from ...utils.value_formatting import format_scalar_html as _format_scalar_html
from ...utils.value_shapes import _is_scalar_value
from ..context import ViewBuildContext
from ..graph_layout import (
    flatten_nested_preview_frame,
    new_node_id,
    render_nested_preview,
    safe_dot_token,
)
from .hash_table_helpers import (
    configure_hash_table_graph,
    hash_bucket_head_node,
    hash_chain_node,
    hash_table_focus_indices,
)


def build_hash_table_view_node_heads_chains(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    logical_name = name.split(" [step ", 1)[0]
    if not isinstance(value, list):
        raise TypeError("hash_table_node view expects list input")

    graph = runtime.graph
    item_limit = runtime.item_limit
    depth_budget = max(0, depth)
    preview_depth = depth_budget - 1 if depth_budget > 0 else 0
    limit = min(len(value), item_limit)
    focus_idx, focus_item_idx = hash_table_focus_indices(
        runtime.focus_path, logical_name
    )

    configure_hash_table_graph(graph, name, show_titles=runtime.show_titles)

    root_id = new_node_id(runtime, "hash_exp")
    graph.add_node(
        VisualNode(
            root_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "hash_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )

    head_anchor_id = new_node_id(runtime, "hash_head_row")
    graph.add_node(
        VisualNode(
            head_anchor_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "hash_head_anchor",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )
    graph.add_edge(
        VisualEdge(
            root_id,
            head_anchor_id,
            type=EdgeKind.LAYOUT,
            meta={"edge_attrs": {"style": "invis", "constraint": "false"}},
        )
    )

    prev_head_id: str | None = None
    for idx in range(limit):
        bucket = value[idx]
        is_focused = focus_idx is not None and focus_idx == idx
        bucket_node = hash_bucket_head_node(logical_name, idx, is_focused=is_focused)
        bucket_id = bucket_node.id
        graph.add_node(bucket_node)
        graph.add_edge(
            VisualEdge(
                head_anchor_id,
                bucket_id,
                type=EdgeKind.LAYOUT,
                meta={
                    "edge_attrs": {
                        "style": "invis",
                        "constraint": "false",
                        "weight": "12",
                    }
                },
            )
        )
        if prev_head_id is not None:
            graph.add_edge(
                VisualEdge(
                    prev_head_id,
                    bucket_id,
                    type=EdgeKind.LAYOUT,
                    meta={
                        "edge_attrs": {
                            "style": "invis",
                            "constraint": "false",
                            "weight": "4",
                        }
                    },
                )
            )
        prev_head_id = bucket_id

        bucket_items = (
            bucket if isinstance(bucket, list) else ([] if bucket is None else [bucket])
        )
        if not bucket_items:
            continue

        chain_limit = min(len(bucket_items), item_limit)
        prev_chain_node_id = bucket_id
        for item_idx in range(chain_limit):
            item = bucket_items[item_idx]
            chain_focus = (
                focus_idx is not None
                and focus_idx == idx
                and (focus_item_idx is None or focus_item_idx == item_idx)
            )

            item_preview = render_nested_preview(
                item, preview_depth, item_limit, f"{name}[{idx}][{item_idx}]"
            )
            if not item_preview:
                if _is_scalar_value(item):
                    item_preview = _format_scalar_html(item)
                else:
                    item_preview = _format_container_stub(item)
            item_preview = flatten_nested_preview_frame(item_preview)

            chain_node = hash_chain_node(
                logical_name, idx, item_idx, item_preview, chain_focus=chain_focus
            )
            chain_node_id = chain_node.id
            graph.add_node(chain_node)
            graph.add_edge(
                VisualEdge(
                    prev_chain_node_id,
                    chain_node_id,
                    type=EdgeKind.LAYOUT,
                    meta={
                        "edge_attrs": {
                            "color": BORDER_CHAIN,
                            "penwidth": "1.0",
                            "arrowhead": "normal",
                        }
                    },
                )
            )
            prev_chain_node_id = chain_node_id

        if len(bucket_items) > item_limit:
            more_id = safe_dot_token("hash_more", logical_name, idx)
            more_label = html_single_cell_table(
                html_font("…", {"color": ELLIPSIS_TEXT}),
                table_attrs={
                    "border": "1",
                    "cellborder": "1",
                    "cellspacing": "0",
                    "cellpadding": "4",
                },
                align="center",
                bgcolor=BG_PANEL,
            )
            graph.add_node(
                VisualNode(
                    more_id,
                    NodeKind.OBJECT,
                    more_label,
                    {
                        "html_label": True,
                        "rank": f"hash_chain_more_{idx}",
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
                    prev_chain_node_id,
                    more_id,
                    type=EdgeKind.LAYOUT,
                    meta={
                        "edge_attrs": {
                            "color": TEXT_NULL,
                            "style": "dashed",
                            "arrowhead": "normal",
                        }
                    },
                )
            )

    if not value:
        empty_id = safe_dot_token("hash_empty", logical_name)
        empty_label = html_table(
            html_row(html_cell("∅", align="center", bgcolor=BG_SURFACE)),
            border="1",
            cellborder="1",
            cellspacing="0",
            cellpadding="8",
        )
        graph.add_node(
            VisualNode(
                empty_id,
                NodeKind.OBJECT,
                empty_label,
                {
                    "html_label": True,
                    "rank": "hash_empty",
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
                head_anchor_id,
                empty_id,
                type=EdgeKind.LAYOUT,
                meta={"edge_attrs": {"style": "invis", "constraint": "false"}},
            )
        )

    return root_id
