from __future__ import annotations

from pathlib import Path
from typing import Any

from graphviz import Digraph  # type: ignore[import-untyped]

from ...utils.image_sources import _detect_image_source
from ...utils.value_formatting import dot_escape_label


def render_graphviz_image(src: Any, title: str = "image") -> str:
    dot = Digraph("image")
    dot.attr("graph", labelloc="t", label=dot_escape_label(title))
    resolved = _detect_image_source(src, strict=True)
    if resolved is None:
        raise ValueError("image source could not be resolved")
    image_path = Path(resolved)
    dot.graph_attr["imagepath"] = str(image_path.parent)
    dot.attr("node", shape="none", label="")
    dot.node("image_value", image=image_path.name, imagescale="true")
    return str(dot.source)
