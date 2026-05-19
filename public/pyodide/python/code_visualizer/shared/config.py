"""Configuration helpers for the visualization pipeline."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field, replace
from typing import Any, Literal

from ..converters.defaults import default_converter_pipeline
from ..converters.pipeline import ConverterPipeline
from ..converters.types import ValueConverter
from .view_kinds import ViewKind, ensure_view_kind


def _default_recursion_depth_map() -> dict[str | type[Any], int]:
    return {list: 4, tuple: 4, dict: 4}


def _default_allowed_formats() -> set[str]:
    return {"dot", "svg", "png", "jpg"}


@dataclass(slots=True)
class VisualizerConfig:
    """Runtime configuration bundle for all visualization helpers."""

    view_map: dict[str | type[Any], ViewKind] = field(default_factory=dict)
    view_name_map: dict[str, ViewKind] = field(default_factory=dict)
    view_type_map: dict[str, ViewKind] = field(default_factory=dict)
    recursion_depth_default: int = -1
    recursion_depth_map: dict[str | type[Any], int] = field(
        default_factory=_default_recursion_depth_map
    )
    auto_recursion_depth_cap: int = 6
    max_depth: int = 3
    max_items_per_view: int = 50
    output_format: str = "png"
    show_titles: bool = True
    allowed_output_formats: set[str] = field(default_factory=_default_allowed_formats)
    converter_pipeline: ConverterPipeline = field(
        default_factory=default_converter_pipeline
    )
    graph_direction: Literal["LR", "TB"] = "LR"
    trace_step_limit_default: int | None = None
    trace_step_limit_map: dict[str, int] = field(default_factory=dict)
    focus_path_map: dict[str, str] = field(default_factory=dict)

    def ensure_output_format(self, fmt: str | None) -> str:
        """Clamp requested output formats to the allowed list."""

        if not fmt:
            return self.output_format
        normalized = fmt.lower()
        if normalized == "jpeg":
            normalized = "jpg"
        if normalized not in self.allowed_output_formats:
            return self.output_format
        return normalized

    def with_converters(
        self,
        *extra: ValueConverter,
        prepend: bool = False,
    ) -> VisualizerConfig:
        """Return a cloned config with an updated converter pipeline."""

        if not extra:
            return self
        updated = self.converter_pipeline.with_converters(*extra, prepend=prepend)
        return replace(self, converter_pipeline=updated)

    def copy(self) -> VisualizerConfig:
        """Explicit shallow copy helper."""

        return replace(
            self,
            view_map=dict(self.view_map),
            view_name_map=dict(self.view_name_map),
            view_type_map=dict(self.view_type_map),
            recursion_depth_map=dict(self.recursion_depth_map),
            allowed_output_formats=set(self.allowed_output_formats),
            converter_pipeline=ConverterPipeline(self.converter_pipeline.converters),
            trace_step_limit_map=dict(self.trace_step_limit_map),
            focus_path_map=dict(self.focus_path_map),
        )

    def step_limit_for(
        self, trace_name: str, override: int | None = None
    ) -> int | None:
        """Determine how many steps to render for a given trace name."""

        limit: int | None
        if trace_name in self.trace_step_limit_map:
            limit = self.trace_step_limit_map[trace_name]
        elif override is not None:
            limit = override
        else:
            limit = self.trace_step_limit_default
        if limit is None:
            return None
        return max(0, limit)


def default_visualizer_config() -> VisualizerConfig:
    """Factory for baseline configuration – callers can mutate their copy."""

    return VisualizerConfig()


def merge_override_map(
    base: Mapping[str | type[Any], ViewKind],
    updates: Mapping[str | type[Any], ViewKind] | None,
) -> dict[str | type[Any], ViewKind]:
    """Merge override maps while normalizing ViewKind entries."""

    merged: dict[str | type[Any], ViewKind] = dict(base)
    if not updates:
        return merged
    for key, view in updates.items():
        merged[key] = ensure_view_kind(view)
    return merged


__all__ = [
    "VisualizerConfig",
    "default_visualizer_config",
    "merge_override_map",
]
