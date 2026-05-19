from __future__ import annotations

from typing import Any

from ....utils.image_sources import _detect_image_source, _image_html
from ....utils.value_formatting import format_container_stub as _format_container_stub
from ....utils.value_formatting import format_scalar_html as _format_scalar_html
from ....utils.value_shapes import _is_matrix_value, _is_scalar_value
from .array_table import sequence_html
from .contracts import NestedRenderer
from .dict_table import dict_html
from .matrix_table import matrix_html


def format_nested_value(
    value: Any,
    depth_remaining: int,
    max_items: int,
    nested_renderer: NestedRenderer | None = None,
    slot_name: str = "value",
) -> str:
    if nested_renderer is not None:
        nested_html = nested_renderer(value, slot_name, depth_remaining)
        if nested_html is not None:
            return nested_html

    image_source = _detect_image_source(value)
    if image_source is not None:
        return _image_html(image_source)

    inline_html = format_inline_collection(
        value,
        depth_remaining,
        max_items,
        nested_renderer,
        slot_name,
    )
    if inline_html is not None:
        return inline_html
    if not _is_scalar_value(value):
        return _format_container_stub(value)
    return _format_scalar_html(value)


def format_inline_collection(
    value: Any,
    depth_remaining: int,
    max_items: int,
    nested_renderer: NestedRenderer | None,
    slot_name: str,
) -> str | None:
    if depth_remaining <= 0:
        return None

    next_depth = depth_remaining - 1
    if _is_matrix_value(value):
        rows = [list(row) for row in value]  # type: ignore[arg-type]
        return matrix_html(
            rows,
            next_depth,
            max_items,
            nested_renderer=nested_renderer,
            slot_name=slot_name,
            row_limit=max_items,
            col_limit=max_items,
            format_nested_value=format_nested_value,
        )

    sequence = normalize_sequence(value)
    if sequence is not None:
        return sequence_html(
            sequence,
            next_depth,
            max_items,
            nested_renderer,
            slot_name,
            format_nested_value,
        )

    if isinstance(value, dict):
        return dict_html(
            value,
            next_depth,
            max_items,
            nested_renderer,
            slot_name,
            format_nested_value,
        )
    return None


def normalize_sequence(value: Any) -> list[Any] | None:
    if isinstance(value, (list, tuple)):
        return list(value)
    if isinstance(value, (set, frozenset)):
        return sorted(value, key=str)
    return None


def format_matrix_html(
    rows: list[list[object]],
    depth_remaining: int,
    max_items: int,
    *,
    include_headers: bool = False,
    row_limit: int | None = None,
    col_limit: int | None = None,
    nested_renderer: NestedRenderer | None = None,
    slot_name: str = "matrix",
) -> str:
    return matrix_html(
        rows,
        depth_remaining,
        max_items,
        include_headers=include_headers,
        row_limit=row_limit,
        col_limit=col_limit,
        nested_renderer=nested_renderer,
        slot_name=slot_name,
        format_nested_value=format_nested_value,
    )


def format_value_label(
    value: Any,
    nested_depth: int,
    max_items: int,
    nested_renderer: NestedRenderer | None = None,
    slot_name: str = "value",
) -> tuple[str, bool]:
    image_source = _detect_image_source(value)
    if image_source is not None:
        return _image_html(image_source), True

    html_depth: int | None = None
    depth = max(0, nested_depth)
    if (
        depth > 0
        or _is_matrix_value(value)
        or isinstance(value, (list, tuple, set, frozenset, dict))
    ):
        html_depth = max(depth, 1)
    if html_depth is None:
        return str(value), False
    return format_nested_value(
        value, html_depth, max_items, nested_renderer, slot_name
    ), True
