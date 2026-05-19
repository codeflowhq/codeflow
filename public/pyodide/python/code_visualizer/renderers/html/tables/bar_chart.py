from __future__ import annotations

from ...shared.theme import (
    BODY_FONT_SIZE,
    FILL_BAR_NEGATIVE,
    FILL_BAR_POSITIVE,
    TEXT_INDEX,
    TEXT_PRIMARY,
)
from ..labels import html_cell, html_font, html_row, html_table, html_text


def bar_chart_html(
    values: list[float], labels: list[str], max_height_px: int = 160
) -> str:
    if not values:
        return html_table(
            html_row(html_cell("∅")), border="1", cellborder="1", cellspacing="0"
        )

    max_abs = max(abs(value) for value in values) or 1.0
    columns: list[str] = []
    for label, value in zip(labels, values, strict=False):
        height = max(24, int(max_height_px * (abs(value) / max_abs)))
        gap = max(0, max_height_px - height)
        color = FILL_BAR_POSITIVE if value >= 0 else FILL_BAR_NEGATIVE
        value_text = int(value) if float(value).is_integer() else round(value, 2)
        inner = html_table(
            html_row(html_cell("", height=gap)),
            html_row(html_cell("", bgcolor=color, width="34", height=height)),
            html_row(
                html_cell(
                    html_font(
                        str(value_text),
                        {"point-size": BODY_FONT_SIZE, "color": TEXT_PRIMARY},
                    ),
                    align="center",
                )
            ),
            html_row(
                html_cell(
                    html_font(html_text(label), {"point-size": 9, "color": TEXT_INDEX}),
                    align="center",
                )
            ),
            border="0",
            cellborder="0",
            cellspacing="0",
            cellpadding="0",
        )
        columns.append(html_cell(inner, valign="bottom"))
    return html_table(html_row(*columns), border="0", cellborder="0", cellspacing="10")
