from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any

from ..renderers.html.labels import (
    html_bold_text,
    html_cell,
    html_font,
    html_row,
    html_table,
)
from ..renderers.html.tables import _format_nested_value
from ..renderers.shared.theme import (
    BG_PREVIEW,
    BG_SURFACE,
    FONT_FAMILY,
    TEXT_PRIMARY,
    TITLE_FONT_SIZE,
)
from ..shared.models import EdgeKind, NodeKind, VisualEdge, VisualGraph, VisualNode
from ..utils.value_formatting import format_container_stub as _format_container_stub
from .context import ViewBuildContext


def init_graph_attrs(
    graph: VisualGraph,
    *,
    rankdir: str,
    nodesep: str,
    ranksep: str,
    title: str | None = None,
    subtitle_html: str | None = None,
    show_title: bool = True,
) -> None:
    graph.graph_attrs.setdefault("rankdir", rankdir)
    graph.graph_attrs.setdefault("nodesep", nodesep)
    graph.graph_attrs.setdefault("ranksep", ranksep)
    graph.graph_attrs.setdefault("fontname", FONT_FAMILY)
    graph.graph_attrs.setdefault("fontsize", str(TITLE_FONT_SIZE))
    graph.graph_attrs.setdefault("fontcolor", TEXT_PRIMARY)
    graph.graph_attrs.setdefault("labelloc", "t")
    graph.graph_attrs.setdefault("labeljust", "c")
    if show_title and title:
        title_html = html_font(
            html_bold_text(title),
            {"point-size": TITLE_FONT_SIZE, "color": TEXT_PRIMARY},
        )
        graph.graph_attrs["label"] = f"<{title_html}{subtitle_html or ''}>"


def new_node_id(runtime: ViewBuildContext, prefix: str) -> str:
    counter: Iterator[int] = runtime.counter
    return f"{prefix}_{next(counter)}"


def safe_dot_token(*parts: Any) -> str:
    tokens: list[str] = []
    for part in parts:
        token = re.sub(r"[^0-9A-Za-z_]+", "_", str(part)).strip("_")
        tokens.append(token or "x")
    return "_".join(tokens)


def matrix_focus_coords(focus_path: str | None) -> tuple[int, int] | None:
    if not focus_path:
        return None
    normalized = focus_path.split(" [step ", 1)[0].strip()
    coords = re.findall(r"\[(\d+)\]", normalized)
    if len(coords) < 2:
        return None
    return int(coords[-2]), int(coords[-1])


def soften_nested_preview_wrapper(html_label: str) -> str:
    stripped = html_label.strip()
    if not stripped.startswith("<table"):
        return html_label

    open_match = re.match(r"^<table\b[^>]*>", stripped)
    if not open_match:
        return html_label

    softened_open = "<table border='0' cellborder='0' cellspacing='0' cellpadding='0'>"
    return softened_open + stripped[open_match.end() :]


def render_nested_preview(
    value: Any, depth_remaining: int, max_items: int, slot_name: str
) -> str:
    preview_html = _format_nested_value(
        value, depth_remaining, max_items, None, slot_name
    )
    if not preview_html:
        preview_html = _format_container_stub(value)
    inner = html_table(
        html_row(
            html_cell(
                preview_html, align="center", bgcolor=BG_SURFACE, cellpadding="1"
            ),
        ),
        border="1",
        cellborder="1",
        cellspacing="0",
        cellpadding="0",
    )
    return html_table(
        html_row(
            html_cell(inner, align="center", bgcolor=BG_PREVIEW, cellpadding="1"),
        ),
        border="0",
        cellborder="0",
        cellspacing="0",
        cellpadding="0",
    )


def flatten_nested_preview_frame(html_label: str) -> str:
    softened = soften_nested_preview_wrapper(html_label)
    softened = re.sub(
        r"^<table\b[^>]*>",
        "<table border='0' cellborder='0' cellspacing='0' cellpadding='0'>",
        softened.strip(),
        count=1,
    )
    softened = softened.replace(
        "<table border='1' cellborder='1' cellspacing='0' cellpadding='0'>",
        "<table border='0' cellborder='0' cellspacing='0' cellpadding='0'>",
        1,
    )
    softened = softened.replace(
        f"bgcolor='{BG_PREVIEW}' cellpadding='1'",
        f"bgcolor='{BG_PREVIEW}' cellpadding='0'",
        1,
    )
    softened = softened.replace(
        f"bgcolor='{BG_SURFACE}' cellpadding='1'",
        f"bgcolor='{BG_SURFACE}' cellpadding='0'",
        1,
    )
    return softened


def merge_visual_graph(
    runtime: ViewBuildContext,
    other: VisualGraph,
    prefix: str,
    root_hint: str | None = None,
) -> str:
    graph = runtime.graph
    mapping: dict[str, str] = {}
    for node_id, node in other.nodes.items():
        new_id = f"{prefix}__{node_id}"
        mapping[node_id] = new_id
        graph.add_node(VisualNode(new_id, node.type, node.label, dict(node.meta)))
    for edge in other.edges:
        graph.add_edge(
            VisualEdge(
                mapping[edge.src],
                mapping[edge.dst],
                type=edge.type,
                label=edge.label,
                meta=dict(edge.meta),
            )
        )
    if root_hint is not None and root_hint in mapping:
        return mapping[root_hint]
    if other.anchors:
        anchor_target = other.anchors[0].node_id
        if anchor_target in mapping:
            return mapping[anchor_target]
    if "ROOT" in mapping:
        return mapping["ROOT"]
    return next(iter(mapping.values()))


def attach_view_title(runtime: ViewBuildContext, _: str, name: str, __: str) -> None:
    if not runtime.show_titles or not name:
        return
    init_graph_attrs(
        runtime.graph,
        rankdir=runtime.graph.graph_attrs.get("rankdir", "TB"),
        nodesep=runtime.graph.graph_attrs.get("nodesep", "0.01"),
        ranksep=runtime.graph.graph_attrs.get("ranksep", "0.06"),
        title=name,
        show_title=True,
    )


def wrap_label(title: str | None, inner_html: str, *, show_title: bool = True) -> str:
    rows: list[str] = []
    if show_title and title:
        rows.append(
            html_row(
                html_cell(
                    html_font(html_bold_text(title), {"point-size": TITLE_FONT_SIZE}),
                    align="center",
                )
            )
        )
    rows.append(html_row(html_cell(inner_html)))
    return html_table(*rows, border="0", cellborder="0", cellspacing="2")


def add_html_node(
    runtime: ViewBuildContext,
    node_id: str,
    label_html: str,
    meta: dict[str, Any] | None = None,
) -> None:
    merged_meta: dict[str, Any] = {"html_label": True, "node_attrs": {"shape": "plain"}}
    if meta:
        merged_meta.update(meta)
    runtime.graph.add_node(
        VisualNode(node_id, NodeKind.OBJECT, label_html, merged_meta)
    )


def add_edge(
    runtime: ViewBuildContext,
    src: str,
    dst: str,
    *,
    tailport: str | None = None,
    edge_meta: dict[str, Any] | None = None,
) -> None:
    meta: dict[str, Any] = {}
    if tailport:
        meta["tailport"] = tailport
    if edge_meta:
        meta["edge_attrs"] = dict(edge_meta)
    runtime.graph.add_edge(VisualEdge(src, dst, type=EdgeKind.CONTAINS, meta=meta))
