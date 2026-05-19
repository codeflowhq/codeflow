from __future__ import annotations

from collections import defaultdict
from collections.abc import Callable, Iterable, Mapping, Sequence
from typing import Any

from ..pipeline.pipeline import visualize
from ..shared.config import VisualizerConfig, default_visualizer_config
from ..shared.models import Artifact, Frame, Trace
from .filtering import format_trace_slot_name
from .types import RenderedTraceFrame, VariableTraceEvent


def build_traces(
    events: Sequence[VariableTraceEvent],
    *,
    name_factory: Callable[[str], str] | None = None,
) -> dict[str, Trace]:
    """Group trace events by variable name and convert them to Trace objects."""

    grouped: dict[str, list[Frame]] = defaultdict(list)
    for event in events:
        grouped[event.variable].append(
            Frame(
                step=event.execution_id,
                value=event.value,
                note=event.note(),
                meta={
                    "var_id": event.var_id,
                    "access_path": event.access_path,
                    "access_paths": list(event.access_paths or (event.access_path,)),
                    "scope_id": event.scope_id,
                    "line_number": event.line_number,
                    "execution_id": event.execution_id,
                    "order": event.order,
                },
            )
        )

    traces: dict[str, Trace] = {}
    for variable, frames in grouped.items():
        trace_name = name_factory(variable) if name_factory else variable
        traces[variable] = Trace(name=trace_name, frames=frames)
    return traces


def _focus_path_from_frame_meta(meta: Mapping[str, Any]) -> str | None:
    access_paths = [
        path for path in meta.get("access_paths", []) if isinstance(path, str)
    ]
    if access_paths:
        return max(access_paths, key=len)
    access_path = meta.get("access_path")
    return access_path if isinstance(access_path, str) else None


def visualize_trace(
    trace: Trace,
    *,
    config: VisualizerConfig | None = None,
    max_steps: int | None = None,
) -> list[Artifact]:
    """Render each trace step via the main visualize() helper."""

    cfg = config.copy() if config is not None else default_visualizer_config()
    artifacts: list[Artifact] = []
    limit = cfg.step_limit_for(trace.name, override=max_steps)
    selected_steps = trace.frames if limit is None else trace.frames[:limit]
    for frame in selected_steps:
        slot_name = format_trace_slot_name(trace.name, frame.step)
        base_override = cfg.view_name_map.get(trace.name)
        if base_override is not None and slot_name not in cfg.view_name_map:
            cfg.view_name_map[slot_name] = base_override
        focus_path = _focus_path_from_frame_meta(frame.meta)
        if focus_path:
            cfg.focus_path_map[slot_name] = focus_path
        else:
            cfg.focus_path_map.pop(slot_name, None)
        artifacts.append(visualize(frame.value, name=slot_name, config=cfg))
    return artifacts


def visualize_traces(
    traces: Iterable[Trace],
    *,
    config: VisualizerConfig | None = None,
    max_steps: int | None = None,
) -> dict[str, list[RenderedTraceFrame]]:
    """Render multiple traces at once while preserving each frame's global step."""

    cfg = config.copy() if config is not None else default_visualizer_config()
    rendered: dict[str, list[RenderedTraceFrame]] = {}
    for trace in traces:
        limit = cfg.step_limit_for(trace.name, override=max_steps)
        selected_steps = trace.frames if limit is None else trace.frames[:limit]
        artifacts = visualize_trace(trace, config=cfg, max_steps=max_steps)
        rendered[trace.name] = [
            RenderedTraceFrame(
                step=frame.step, artifact=artifact, meta=dict(frame.meta)
            )
            for frame, artifact in zip(selected_steps, artifacts, strict=False)
        ]
    return rendered
