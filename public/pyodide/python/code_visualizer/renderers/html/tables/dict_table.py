from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ....utils.value_formatting import (
    estimate_table_column_widths as _estimate_table_column_widths,
)
from ....utils.value_formatting import table_cell_text as _table_cell_text
from ...shared.theme import BG_HEADER
from ..labels import html_cell, html_row, html_table

FormatNestedValue = Callable[[Any, int, int, Any, str], str]


def dict_html(
    value: dict[object, object],
    next_depth: int,
    max_items: int,
    nested_renderer: Any,
    slot_name: str,
    format_nested_value: FormatNestedValue,
) -> str:
    items = list(value.items())
    limit = min(len(items), max_items)
    key_width, value_width = _estimate_table_column_widths(items[:limit], max_items)
    rows = [
        html_row(
            html_cell("<b>Key</b>", width=key_width, bgcolor=BG_HEADER, align="center"),
            html_cell(
                "<b>Value</b>", width=value_width, bgcolor=BG_HEADER, align="center"
            ),
        )
    ]
    if not items:
        rows.append(html_row(html_cell("∅", colspan="2")))
    else:
        for key, item_value in items[:limit]:
            value_html = format_nested_value(
                item_value,
                next_depth,
                max_items,
                nested_renderer,
                f"{slot_name}.{_table_cell_text(key)}",
            )
            rows.append(
                html_row(
                    html_cell(_table_cell_text(key), width=key_width, align="center"),
                    html_cell(value_html, width=value_width, align="center"),
                )
            )
        if len(items) > max_items:
            rows.append(html_row(html_cell("… (+more)", colspan="2")))
    return html_table(*rows, border="1", cellborder="1", cellspacing="0")
