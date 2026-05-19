from __future__ import annotations

from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.detection.linked import _hash_bucket_entries
from ...utils.value_formatting import dot_escape_label
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ..html.tables import _format_value_label
from ..shared.dot_utils import _digraph_edge
from ..shared.theme import (
    BORDER_CHAIN,
    BORDER_TREE,
    ELLIPSIS_TEXT,
    FONT_FAMILY,
    TEXT_INDEX,
)


def render_graphviz_hash_table(
    table: list[Any],
    title: str = "hash_table",
    *,
    max_buckets: int = 50,
    max_chain_items: int = 8,
    nested_depth: int = 0,
) -> str:
    if not isinstance(table, list):
        raise TypeError("hash_table view expects a list of buckets")
    total = len(table)
    limit = min(total, max_buckets)
    buckets = table[:limit]
    dot = Digraph("hash")
    dot.attr(
        "graph",
        labelloc="t",
        nodesep="0.9",
        ranksep="1.2",
        splines="true",
        label=f'<<font point-size="18"><b>{dot_escape_label(title)}</b></font><br/><font point-size="12">(buckets={total})</font>>',
    )
    dot.attr("edge", color=BORDER_CHAIN, arrowsize="0.6")
    dot.attr("node", fontname=FONT_FAMILY)
    bucket_nodes: list[str] = []
    for index in range(limit):
        bucket_id = f"b{index}"
        bucket_nodes.append(bucket_id)
        bucket_label = (
            '<<table border="0" cellborder="0" cellspacing="0">'
            f'<tr><td id="{_stable_svg_id(title, "bucket", index, "hook")}" port="hook" width="46" height="38" border="1" color="{BORDER_TREE}">'
            '<font point-size="16"><b>H</b></font></td></tr>'
            f'<tr><td id="{_stable_svg_id(title, "bucket", index, "index")}"><font color="{TEXT_INDEX}" point-size="12">{index}</font></td></tr>'
            "</table>>"
        )
        dot.node(bucket_id, label=bucket_label, shape="plaintext")
    if bucket_nodes:
        dot.body.append(f"{{rank=same; {' '.join(bucket_nodes)} }}")
    for index, bucket in enumerate(buckets):
        entries, clipped = _hash_bucket_entries(bucket, max_chain_items)
        previous = f"b{index}:hook"
        for entry_index, value in enumerate(entries):
            node_id = f"bucket_{index}_{entry_index}"
            label_text, is_html = _format_value_label(
                value, nested_depth, max_chain_items
            )
            if is_html:
                dot.node(node_id, label=f"<{label_text}>", shape="plaintext")
            else:
                dot.node(
                    node_id,
                    label=dot_escape_label(label_text),
                    shape="circle",
                    color=BORDER_TREE,
                )
            _digraph_edge(dot, previous, node_id)
            previous = node_id
        if clipped:
            ellipsis_id = f"bucket_{index}_ellipsis"
            dot.node(ellipsis_id, label="…", shape="plaintext")
            _digraph_edge(dot, previous, ellipsis_id)
    if total > limit and bucket_nodes:
        dot.node("more", label="… (+more buckets)", shape="plaintext")
        _digraph_edge(
            dot, bucket_nodes[-1], "more", style="dashed", color=ELLIPSIS_TEXT
        )
    return str(dot.source)
