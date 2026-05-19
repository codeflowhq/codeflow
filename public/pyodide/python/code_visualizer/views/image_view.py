from __future__ import annotations

from typing import Any

from ..renderers.html.labels import (
    html_bold_text,
    html_cell,
    html_font,
    html_row,
    html_table,
)
from ..renderers.shared.theme import TEXT_PRIMARY, TITLE_FONT_SIZE
from ..shared.models import NodeKind, VisualNode
from ..shared.view_kinds import ViewKind
from ..utils.image_sources import _detect_image_source, _image_html
from .context import ViewBuildContext


def build_image_view(
    runtime: ViewBuildContext, value: Any, name: str, depth: int
) -> str:
    del depth
    src = _detect_image_source(value, strict=True)
    if src is None:
        raise TypeError("image view expects a valid image source")
    node_id = f"{ViewKind.IMAGE}_{next(runtime.counter)}"
    html = html_table(
        html_row(
            html_cell(
                html_font(
                    html_bold_text(name),
                    {"point-size": TITLE_FONT_SIZE, "color": TEXT_PRIMARY},
                ),
                align="center",
            )
        ),
        html_row(html_cell(_image_html(src))),
        border="0",
        cellborder="0",
        cellspacing="2",
    )
    runtime.graph.add_node(
        VisualNode(
            node_id,
            NodeKind.OBJECT,
            html,
            {"html_label": True, "node_attrs": {"shape": "plain"}},
        )
    )
    return node_id
