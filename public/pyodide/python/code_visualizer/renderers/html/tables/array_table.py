from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ....utils.value_formatting import stable_svg_id as _stable_svg_id
from ...shared.theme import BG_SURFACE, INDEX_FONT_SIZE, TEXT_INDEX
from ..labels import html_cell, html_font, html_row, html_table

FormatNestedValue = Callable[[Any, int, int, Any, str], str]


def graphviz_array_block(
    value_cells: list[str],
    index_cells: list[str],
    *,
    slot_name: str = "array",
) -> str:
    value_row = (
        html_cell(
            "&nbsp;", id=_stable_svg_id(slot_name, "value", "empty"), align="center"
        )
        if not value_cells
        else "".join(value_cells)
    )
    index_row = (
        html_cell(
            "&nbsp;", id=_stable_svg_id(slot_name, "index", "empty"), align="center"
        )
        if not index_cells
        else "".join(index_cells)
    )
    value_table = html_table(
        html_row(value_row, id=_stable_svg_id(slot_name, "value-row")),
        id=_stable_svg_id(slot_name, "value-table"),
        border="1",
        cellborder="1",
        cellspacing="0",
    )
    index_table = html_table(
        html_row(index_row, id=_stable_svg_id(slot_name, "index-row")),
        id=_stable_svg_id(slot_name, "index-table"),
        border="0",
        cellborder="0",
        cellspacing="4",
    )
    return html_table(
        html_row(
            html_cell(
                value_table, id=_stable_svg_id(slot_name, "value-table-container")
            )
        ),
        html_row(
            html_cell(
                index_table, id=_stable_svg_id(slot_name, "index-table-container")
            )
        ),
        id=_stable_svg_id(slot_name, "wrapper"),
        border="0",
        cellborder="0",
        cellspacing="0",
    )


def sequence_html(
    sequence: list[object],
    next_depth: int,
    max_items: int,
    nested_renderer: Any,
    slot_name: str,
    format_nested_value: FormatNestedValue,
) -> str:
    limit = min(len(sequence), max_items)
    value_cells: list[str] = []
    index_cells: list[str] = []
    for index in range(limit):
        cell_html = format_nested_value(
            sequence[index],
            next_depth,
            max_items,
            nested_renderer,
            f"{slot_name}[{index}]",
        )
        value_cells.append(
            html_cell(cell_html, align="center", bgcolor=BG_SURFACE, cellpadding="4")
        )
        index_cells.append(
            html_cell(
                html_font(
                    str(index), {"color": TEXT_INDEX, "point-size": INDEX_FONT_SIZE}
                ),
                align="center",
            )
        )
    if len(sequence) > max_items:
        value_cells.append(html_cell("…", align="center", bgcolor=BG_SURFACE))
        index_cells.append(html_cell("", align="center"))
    return graphviz_array_block(value_cells, index_cells, slot_name=slot_name)
