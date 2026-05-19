from __future__ import annotations

from typing import Any, Literal

from ..shared.config import VisualizerConfig, default_visualizer_config
from ..shared.models import Artifact
from ..shared.view_kinds import ViewKind
from ..utils.value_shapes import _is_scalar_value
from .render_dispatch import (
    render_fallback_nodelink_artifact,
    render_scalar_artifact,
    render_structured_artifact,
)
from .resolver import determine_view, make_value_coercer, resolve_recursion_depth

DirectionLiteral = Literal["LR", "TD"]
render_structured_view = render_structured_artifact


def visualize(
    value: Any, *, name: str = "x", config: VisualizerConfig | None = None
) -> Artifact:
    cfg = config.copy() if config is not None else default_visualizer_config()
    resolved_direction: DirectionLiteral = "TD" if cfg.graph_direction == "TB" else "LR"
    value_coercer = make_value_coercer(cfg)

    original_value = value
    coerced_value = value_coercer(value)

    def resolver(slot: str, raw: Any, coerced: Any) -> tuple[ViewKind, bool]:
        return determine_view(slot, raw, coerced, cfg)

    view, configured_view = determine_view(name, original_value, coerced_value, cfg)
    recursion_budget = resolve_recursion_depth(name, original_value, cfg)
    focus_path = cfg.focus_path_map.get(name)

    artifact, handled = render_structured_view(
        view=view,
        name=name,
        value=coerced_value,
        direction=resolved_direction,
        recursion_budget=recursion_budget,
        item_limit=cfg.max_items_per_view,
        configured_view=configured_view,
        value_coercer=value_coercer,
        view_resolver=resolver,
        focus_path=focus_path,
        show_titles=cfg.show_titles,
    )
    if artifact is not None:
        return artifact
    if handled:
        view = ViewKind.NODE_LINK

    if _is_scalar_value(coerced_value):
        return render_scalar_artifact(
            name, coerced_value, resolved_direction, show_titles=cfg.show_titles
        )

    return render_fallback_nodelink_artifact(
        value=coerced_value,
        name=name,
        direction=resolved_direction,
        max_depth=cfg.max_depth,
        max_items=cfg.max_items_per_view,
        value_coercer=value_coercer,
        show_titles=cfg.show_titles,
    )
