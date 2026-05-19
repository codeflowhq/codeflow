from __future__ import annotations

from html import escape as html_escape
from typing import Any

from ...renderers.shared.theme import TEXT_PRIMARY, TEXT_SECONDARY


def table_cell_text(value: Any) -> str:
    return html_escape(str(value), quote=True)


def format_scalar_html(value: Any) -> str:
    text = html_escape(str(value))
    if text == "":
        text = "&#xa0;"
    return f'<font point-size="12" color="{TEXT_PRIMARY}">{text}</font>'


def format_container_stub(value: Any) -> str:
    def label(kind: str, extra: str | None = None) -> str:
        suffix = f" {extra}" if extra else ""
        return f'<font point-size="12" color="{TEXT_SECONDARY}">{kind}{suffix}</font>'

    if isinstance(value, (list, tuple, set, frozenset)):
        kind = type(value).__name__
        return label(kind, f"len={len(value)}")
    if isinstance(value, dict):
        return label("dict", f"keys={len(value)}")
    return label(type(value).__name__)
