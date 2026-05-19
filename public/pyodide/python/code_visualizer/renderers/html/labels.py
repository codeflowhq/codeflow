from __future__ import annotations

from collections.abc import Mapping
from html import escape as html_escape


def html_attrs(
    attrs: Mapping[str, object | None] | None = None, /, **kwargs: object | None
) -> str:
    merged: dict[str, object | None] = {}
    if attrs:
        merged.update(attrs)
    merged.update(kwargs)
    parts = [f" {key}='{value}'" for key, value in merged.items() if value is not None]
    return "".join(parts)


def html_tag(
    tag: str,
    content: str,
    attrs: Mapping[str, object | None] | None = None,
    /,
    **kwargs: object | None,
) -> str:
    return f"<{tag}{html_attrs(attrs, **kwargs)}>{content}</{tag}>"


def html_table(
    *rows: str,
    attrs: Mapping[str, object | None] | None = None,
    **kwargs: object | None,
) -> str:
    return html_tag("table", "".join(rows), attrs, **kwargs)


def html_row(
    *cells: str,
    attrs: Mapping[str, object | None] | None = None,
    **kwargs: object | None,
) -> str:
    return html_tag("tr", "".join(cells), attrs, **kwargs)


def html_cell(
    content: str,
    attrs: Mapping[str, object | None] | None = None,
    /,
    **kwargs: object | None,
) -> str:
    return html_tag("td", content, attrs, **kwargs)


def html_font(
    content: str,
    attrs: Mapping[str, object | None] | None = None,
    /,
    **kwargs: object | None,
) -> str:
    return html_tag("font", content, attrs, **kwargs)


def html_img(
    src: str,
    attrs: Mapping[str, object | None] | None = None,
    /,
    **kwargs: object | None,
) -> str:
    merged: dict[str, object | None] = {"SRC": html_escape(src, quote=True)}
    if attrs:
        merged.update(attrs)
    merged.update(kwargs)
    return f"<IMG{html_attrs(merged)}/>"


def html_single_cell_table(
    content: str,
    *,
    table_attrs: Mapping[str, object | None] | None = None,
    cell_attrs: Mapping[str, object | None] | None = None,
    **cell_kwargs: object | None,
) -> str:
    return html_table(
        html_row(html_cell(content, cell_attrs, **cell_kwargs)),
        attrs=table_attrs,
    )


def html_bold_text(text: object) -> str:
    return html_tag("b", html_escape(str(text)))


def html_text(text: object) -> str:
    return html_escape(str(text))
