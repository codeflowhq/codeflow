from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ....utils.value_formatting import stable_svg_id as _stable_svg_id
from ...shared.theme import BG_HEADER_MUTED, TEXT_INDEX, TEXT_WARNING
from ..labels import html_cell, html_font, html_row, html_table

FormatNestedValue = Callable[[Any, int, int, Any, str], str]


def matrix_html(
    rows: list[list[object]],
    depth_remaining: int,
    max_items: int,
    *,
    include_headers: bool = False,
    row_limit: int | None = None,
    col_limit: int | None = None,
    nested_renderer: Any = None,
    slot_name: str = "matrix",
    format_nested_value: FormatNestedValue,
) -> str:
    depth_remaining = max(0, depth_remaining)
    total_rows = len(rows)
    width = max((len(row) for row in rows), default=0)
    limit_rows = min(
        total_rows, row_limit if row_limit is not None else total_rows, max_items
    )
    limit_cols = min(width, col_limit if col_limit is not None else width, max_items)
    table: list[str] = []

    def cell(item: object) -> str:
        return format_nested_value(
            item, depth_remaining, max_items, nested_renderer, slot_name
        )

    if include_headers:
        header_cells = [
            html_cell(
                "",
                id=_stable_svg_id(slot_name, "header", "corner"),
                bgcolor=BG_HEADER_MUTED,
            )
        ]
        for column in range(limit_cols):
            header_cells.append(
                html_cell(
                    html_font(str(column), color=TEXT_INDEX),
                    id=_stable_svg_id(slot_name, "header", column),
                    bgcolor=BG_HEADER_MUTED,
                )
            )
        if width > limit_cols:
            header_cells.append(
                html_cell(
                    "…",
                    id=_stable_svg_id(slot_name, "header", "ellipsis"),
                    bgcolor=BG_HEADER_MUTED,
                )
            )
        table.append(html_row(*header_cells))

    for row_index in range(limit_rows):
        row = rows[row_index]
        cells: list[str] = []
        if include_headers:
            cells.append(
                html_cell(
                    html_font(str(row_index), color=TEXT_WARNING),
                    id=_stable_svg_id(slot_name, "row", row_index, "header"),
                    bgcolor="#fef3c7",
                )
            )
        for column_index in range(limit_cols):
            item = row[column_index] if column_index < len(row) else ""
            cells.append(
                html_cell(
                    cell(item),
                    id=_stable_svg_id(slot_name, "row", row_index, "col", column_index),
                )
            )
        if len(row) > limit_cols:
            cells.append(
                html_cell(
                    "…", id=_stable_svg_id(slot_name, "row", row_index, "ellipsis")
                )
            )
        table.append(html_row(*cells))

    if total_rows > limit_rows:
        colspan = (
            limit_cols
            + (1 if include_headers else 0)
            + (1 if width > limit_cols else 0)
        )
        table.append(
            html_row(
                html_cell(
                    "… (+more rows)",
                    id=_stable_svg_id(slot_name, "rows", "ellipsis"),
                    colspan=max(1, colspan),
                )
            )
        )

    return html_table(
        *table,
        id=_stable_svg_id(slot_name, "wrapper"),
        border="1",
        cellborder="1",
        cellspacing="0",
    )
