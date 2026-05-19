from __future__ import annotations

import re
from dataclasses import replace
from html import unescape as html_unescape
from typing import Any

from ...renderers.graphviz.tree_renderer import build_tree
from ...renderers.html.labels import html_cell, html_font, html_row, html_table
from ...renderers.shared.theme import (
    BG_FOCUS,
    BG_PANEL,
    BG_SURFACE,
    BORDER_DEFAULT,
    BORDER_STRONG,
    BORDER_TREE,
    ELLIPSIS_TEXT,
    SUBTITLE_FONT_SIZE,
    TEXT_MUTED,
)
from ...shared.models import EdgeKind, NodeKind, VisualEdge, VisualNode
from ...shared.view_kinds import ViewKind
from ...utils.value_formatting import format_container_stub as _format_container_stub
from ...utils.value_formatting import format_scalar_html as _format_scalar_html
from ...utils.value_formatting import stable_svg_id as _stable_svg_id
from ...utils.value_shapes import _is_scalar_value
from ..context import ViewBuildContext
from ..graph_layout import (
    init_graph_attrs,
    merge_visual_graph,
    new_node_id,
    render_nested_preview,
    safe_dot_token,
)
from .heap_projection import build_heap_tree_payload

_HTML_TAG_PATTERN = re.compile(r"<[^>]+>")


def _plain_heap_tree_label(label: str) -> str:
    stripped = _HTML_TAG_PATTERN.sub("", label)
    return html_unescape(stripped).strip() or "?"


def _heap_focus_index(focus_path: str | None, logical_name: str) -> int | None:
    if not focus_path:
        return None
    normalized_focus_path = focus_path.replace('"', "'")
    normalized_name = logical_name.replace('"', "'")
    if not normalized_focus_path.startswith(normalized_name):
        return None
    suffix = normalized_focus_path[len(normalized_name) :]
    match = re.match(r"^\[(\d+)\]", suffix)
    if not match:
        return None
    return int(match.group(1))


def _heap_strip_label(content_html: str, *, is_focused: bool, index: int) -> str:
    return html_table(
        html_row(
            html_cell(
                content_html,
                align="center",
                bgcolor=BG_FOCUS if is_focused else BG_PANEL,
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


def _build_heap_array_node_strip(
    runtime: ViewBuildContext, value: list[Any], name: str, depth: int
) -> str:
    logical_name = name.split(" [step ", 1)[0]
    graph = runtime.graph
    item_limit = runtime.item_limit
    depth_budget = max(0, depth)
    cell_depth = depth_budget - 1 if depth_budget > 0 else 0
    limit = min(len(value), item_limit)
    focus_idx = _heap_focus_index(
        runtime.focus_path, logical_name.split("[array]", 1)[0]
    )

    strip_root_id = new_node_id(runtime, "heap_arr")
    graph.add_node(
        VisualNode(
            strip_root_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "heap_array_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )

    occurrence_counts: dict[str, int] = {}
    prev_id: str | None = None
    for idx in range(limit):
        item = value[idx]
        slot_name = f"{name}[{idx}]"
        is_focused = focus_idx == idx
        if _is_scalar_value(item):
            scalar_key = str(item)
            occurrence = occurrence_counts.get(scalar_key, 0)
            occurrence_counts[scalar_key] = occurrence + 1
            node_id = safe_dot_token(
                "heap_item", logical_name or "heap", scalar_key, occurrence
            )
            svg_id = _stable_svg_id(
                logical_name or "heap", "heap", "item", scalar_key, occurrence
            )
            content_html = _format_scalar_html(item)
        else:
            node_id = safe_dot_token("heap_cell", logical_name or "heap", idx)
            svg_id = _stable_svg_id(logical_name or "heap", "heap", "cell", idx)
            content_html = render_nested_preview(
                item, cell_depth, item_limit, slot_name
            )
            if not content_html:
                content_html = _format_container_stub(item)

        node_label = _heap_strip_label(content_html, is_focused=is_focused, index=idx)
        graph.add_node(
            VisualNode(
                node_id,
                NodeKind.OBJECT,
                node_label,
                {
                    "kind": "heap_array_cell",
                    "html_label": True,
                    "rank": "heap_array_items",
                    "node_attrs": {
                        "shape": "plain",
                        "color": BORDER_STRONG if is_focused else BORDER_DEFAULT,
                        "penwidth": "2.0" if is_focused else "1.0",
                        "id": svg_id,
                    },
                },
            )
        )
        if prev_id is None:
            graph.add_edge(
                VisualEdge(
                    strip_root_id,
                    node_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis", "weight": "12"}},
                )
            )
        else:
            graph.add_edge(
                VisualEdge(
                    prev_id,
                    node_id,
                    type=EdgeKind.LAYOUT,
                    meta={"edge_attrs": {"style": "invis", "weight": "12"}},
                )
            )
        prev_id = node_id

    if len(value) > item_limit and prev_id is not None:
        more_id = safe_dot_token("heap_more", logical_name or "heap")
        more_label = html_table(
            html_row(
                html_cell(
                    html_font("…", color=ELLIPSIS_TEXT),
                    align="center",
                    bgcolor=BG_PANEL,
                )
            ),
            html_row(
                html_cell(
                    html_font(
                        "…", {"color": TEXT_MUTED, "point-size": SUBTITLE_FONT_SIZE}
                    ),
                    align="center",
                    bgcolor=BG_SURFACE,
                    cellpadding="2",
                )
            ),
            border="1",
            cellborder="1",
            cellspacing="0",
            cellpadding="4",
        )
        graph.add_node(
            VisualNode(
                more_id,
                NodeKind.ELLIPSIS,
                more_label,
                {
                    "html_label": True,
                    "rank": "heap_array_items",
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
                meta={"edge_attrs": {"style": "invis", "weight": "12"}},
            )
        )

    return strip_root_id


def build_heap_dual_view_node(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    if not isinstance(value, list):
        raise TypeError("heap_dual_node view expects list input")

    graph = runtime.graph
    init_graph_attrs(
        graph,
        rankdir="TB",
        nodesep="0.04",
        ranksep="0.16",
        title=name,
        show_title=runtime.show_titles,
    )

    root_id = new_node_id(runtime, "heap_exp")
    graph.add_node(
        VisualNode(
            root_id,
            NodeKind.OBJECT,
            "",
            {
                "kind": "heap_root",
                "node_attrs": {
                    "shape": "point",
                    "style": "invis",
                    "width": "0.01",
                    "height": "0.01",
                },
            },
        )
    )

    array_root_id = _build_heap_array_node_strip(
        runtime, value, f"{name}[array]", depth
    )
    graph.add_edge(
        VisualEdge(
            root_id,
            array_root_id,
            type=EdgeKind.LAYOUT,
            meta={"edge_attrs": {"style": "invis", "weight": "24"}},
        )
    )

    tree_payload = build_heap_tree_payload(value, runtime.item_limit)
    if tree_payload is not None:
        tree_root_hint, tree_graph = build_tree(
            tree_payload,
            name="",
            max_nodes=runtime.item_limit,
            nested_depth=depth,
            max_items=runtime.item_limit,
        )
        for node in tree_graph.nodes.values():
            if node.meta.get("cutoff"):
                continue
            node_attrs = dict(node.meta.get("node_attrs", {}))
            node_attrs["shape"] = "circle"
            node_attrs["style"] = "solid"
            node_attrs.setdefault("width", "0.6")
            node_attrs.setdefault("height", "0.6")
            node_attrs.setdefault("fixedsize", "false")
            node_attrs["color"] = BORDER_TREE
            node_meta = dict(node.meta)
            html_label = bool(node_meta.pop("html_label", None))
            node_meta["node_attrs"] = node_attrs
            next_label = (
                _plain_heap_tree_label(node.label) if html_label else node.label
            )
            tree_graph.nodes[node.id] = replace(node, label=next_label, meta=node_meta)
        tree_id = merge_visual_graph(
            runtime,
            tree_graph,
            new_node_id(runtime, ViewKind.TREE),
            root_hint=tree_root_hint,
        )
    else:
        tree_id = new_node_id(runtime, "heap_empty")
        empty_html = html_table(
            html_row(html_cell("∅", align="center")),
            border="1",
            cellborder="1",
            cellspacing="0",
        )
        graph.add_node(
            VisualNode(
                tree_id,
                NodeKind.OBJECT,
                empty_html,
                {"html_label": True, "node_attrs": {"shape": "plain"}},
            )
        )

    graph.add_edge(
        VisualEdge(
            array_root_id,
            tree_id,
            type=EdgeKind.LAYOUT,
            meta={"edge_attrs": {"style": "invis", "weight": "24"}},
        )
    )
    return root_id
