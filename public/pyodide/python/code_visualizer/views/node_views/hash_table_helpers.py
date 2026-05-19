from __future__ import annotations

import re
from typing import Any

from ...renderers.html.labels import (
    html_bold_text,
    html_cell,
    html_font,
    html_row,
    html_table,
)
from ...renderers.shared.theme import (
    BG_FOCUS,
    BG_FOCUS_SOFT,
    BG_SURFACE,
    BODY_FONT_SIZE,
    BORDER_CHAIN,
    BORDER_DARK,
    BORDER_FOCUS,
    TEXT_INDEX,
    TEXT_PRIMARY,
)
from ...shared.models import NodeKind, VisualNode
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ..graph_layout import init_graph_attrs, safe_dot_token


def hash_table_focus_indices(
    focus_path: str | None,
    logical_name: str,
) -> tuple[int | None, int | None]:
    if not focus_path or not focus_path.startswith(logical_name):
        return None, None
    suffix = focus_path[len(logical_name) :]
    matches = re.findall(r"\[(\d+)\]", suffix)
    if not matches:
        return None, None
    bucket_index = int(matches[0])
    item_index = int(matches[1]) if len(matches) > 1 else None
    return bucket_index, item_index


def configure_hash_table_graph(graph: Any, name: str, *, show_titles: bool) -> None:
    init_graph_attrs(
        graph,
        rankdir="TB",
        nodesep="0.42",
        ranksep="0.36",
        title=name,
        subtitle_html="<br/><font point-size='10' color='#94a3b8'>hash table node</font>",
        show_title=show_titles,
    )


def hash_bucket_head_node(
    logical_name: str, idx: int, *, is_focused: bool
) -> VisualNode:
    head_fill = BG_FOCUS if is_focused else BG_SURFACE
    head_border = BORDER_FOCUS if is_focused else BORDER_DARK
    head_penwidth = "1.7" if is_focused else "1.2"
    bucket_label = html_table(
        html_row(
            html_cell(
                html_font(
                    html_bold_text("H"), {"point-size": 14, "color": TEXT_PRIMARY}
                ),
                align="center",
                bgcolor=head_fill,
                cellpadding="6",
            )
        ),
        html_row(
            html_cell(
                html_font(
                    str(idx), {"point-size": BODY_FONT_SIZE, "color": TEXT_INDEX}
                ),
                align="center",
                bgcolor=head_fill,
                cellpadding="3",
            )
        ),
        border="0",
        cellborder="1",
        cellspacing="0",
        cellpadding="0",
    )
    return VisualNode(
        safe_dot_token("hash_bucket_node", logical_name, idx),
        NodeKind.OBJECT,
        bucket_label,
        {
            "kind": "hash_bucket_node",
            "html_label": True,
            "rank": "hash_heads",
            "node_attrs": {
                "shape": "plain",
                "color": head_border,
                "penwidth": head_penwidth,
                "id": _stable_svg_id(logical_name, "hash", "bucket", idx),
            },
        },
    )


def hash_chain_node(
    logical_name: str,
    idx: int,
    item_idx: int,
    item_preview: str,
    *,
    chain_focus: bool,
) -> VisualNode:
    item_fill = BG_FOCUS_SOFT if chain_focus else BG_SURFACE
    item_border = BORDER_FOCUS if chain_focus else BORDER_CHAIN
    item_penwidth = "1.5" if chain_focus else "1.0"
    chain_label = html_table(
        html_row(
            html_cell(item_preview, align="center", bgcolor=item_fill, cellpadding="4"),
        ),
        border="1",
        cellborder="1",
        cellspacing="0",
        cellpadding="0",
    )
    return VisualNode(
        safe_dot_token("hash_chain_node", logical_name, idx, item_idx),
        NodeKind.OBJECT,
        chain_label,
        {
            "kind": "hash_chain_node",
            "html_label": True,
            "rank": f"hash_chain_{idx}_{item_idx}",
            "node_attrs": {
                "shape": "plain",
                "color": item_border,
                "penwidth": item_penwidth,
                "id": _stable_svg_id(logical_name, "hash", "chain", idx, item_idx),
            },
        },
    )
