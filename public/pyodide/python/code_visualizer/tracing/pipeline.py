from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from typing import Any, Literal, cast

from ..shared.config import VisualizerConfig
from .filtering import (
    WatchFilter,
    WatchTarget,
    normalize_trace_watch_filters,
    watch_filter_conditions,
)
from .manifest import build_trace_manifest, serialize_trace_manifest_payload
from .processing import (
    _augment_pop_mutation_events,
    _compact_event_orders,
    _merge_duplicate_root_events,
    _project_expression_watch_events,
)
from .rendering import (
    _focus_path_from_frame_meta,
    build_traces,
    visualize_trace,
    visualize_traces,
)
from .types import (
    RenderedTraceFrame,
    TraceManifest,
    VariableTraceEvent,
)

try:  # pragma: no cover - soft dependency
    from step_tracer import StepTracer  # type: ignore
except Exception:  # pragma: no cover - tracer optional
    StepTracer = None  # type: ignore[misc, assignment]

try:  # pragma: no cover - optional dependency
    from query_engine import QueryEngine  # type: ignore
except Exception:  # pragma: no cover - query engine optional
    QueryEngine = None  # type: ignore[misc, assignment]

__all__ = [
    "StepTracerUnavailableError",
    "_focus_path_from_frame_meta",
    "_project_expression_watch_events",
    "build_traces",
    "trace_algorithm",
    "visualize_algorithm",
    "visualize_trace",
    "visualize_traces",
]

TraceOutputMode = Literal["frames", "manifest"]


class StepTracerUnavailableError(RuntimeError):
    """Raised when step-tracer is not installed but required."""


def _ensure_tracer(instance: StepTracer | None) -> StepTracer:
    if instance is not None:
        return instance
    if StepTracer is None or QueryEngine is None:
        raise StepTracerUnavailableError(
            "step-tracer or query-engine is missing. Install both via "
            "`pip install git+https://github.com/edcraft-org/step-tracer.git` "
            "and `pip install git+https://github.com/edcraft-org/query-engine.git`."
        )
    return StepTracer()


def _query_variable_snapshots(
    execution_context: Any, filters: Sequence[WatchFilter]
) -> list[Any]:
    if QueryEngine is None:
        raise StepTracerUnavailableError(
            "query-engine is missing. Install it via "
            "`pip install git+https://github.com/edcraft-org/query-engine.git`."
        )

    query_engine = QueryEngine(execution_context)
    base_condition = ("__class__.__name__", "==", "VariableSnapshot")

    def build_query() -> Any:
        return query_engine.create_query().where(base_condition)

    if not filters:
        snapshots = build_query().order_by("execution_id").execute()
    else:
        snapshots = []
        for rule in filters:
            query = build_query()
            for field, op, value in watch_filter_conditions(rule):
                query.where((field, op, value))
            snapshots.extend(query.order_by("execution_id").execute())

    deduped: list[Any] = []
    seen: set[tuple[Any, Any, Any, Any]] = set()
    for snapshot in snapshots:
        if not hasattr(snapshot, "name") or not hasattr(snapshot, "value"):
            continue
        identity = (
            getattr(snapshot, "execution_id", None),
            getattr(snapshot, "scope_id", None),
            getattr(snapshot, "line_number", None),
            getattr(snapshot, "access_path", None),
        )
        if identity in seen:
            continue
        seen.add(identity)
        deduped.append(snapshot)
    deduped.sort(
        key=lambda snapshot: (
            getattr(snapshot, "execution_id", 0),
            getattr(snapshot, "line_number", 0),
        )
    )
    return deduped


def trace_algorithm(
    source_code: str,
    watch_variables: Sequence[WatchTarget] | None = None,
    *,
    tracer: StepTracer | None = None,
    globals_dict: Mapping[str, Any] | None = None,
    max_events: int | None = None,
) -> list[VariableTraceEvent]:
    """Execute `source_code` via StepTracer and collect variable snapshots."""

    engine = _ensure_tracer(tracer)
    transformed = engine.transform_code(source_code)
    globals_env = dict(globals_dict or {})
    exec_ctx = engine.execute_transformed_code(transformed, globals_env)

    filters = normalize_trace_watch_filters(watch_variables)
    snapshots = _query_variable_snapshots(exec_ctx, filters)
    if max_events is None:
        limited = snapshots
    else:
        limit = max(0, max_events)
        limited = []
        seen_execution_ids: set[Any] = set()
        for snapshot in snapshots:
            execution_id = getattr(snapshot, "execution_id", None)
            seen_execution_ids.add(execution_id)
            if len(seen_execution_ids) > limit:
                break
            limited.append(snapshot)
    watched_roots = {
        rule.name for rule in filters if rule.name and rule.access_path is None
    }

    events: list[VariableTraceEvent] = []
    for index, snapshot in enumerate(limited, start=1):
        trace_name = snapshot.name
        for rule in filters:
            if not rule.matches(snapshot):
                continue
            if rule.access_path is not None and snapshot.name in watched_roots:
                continue
            trace_name = (
                rule.trace_name or rule.access_path or rule.name or snapshot.name
            )
            break
        events.append(
            VariableTraceEvent(
                variable=trace_name,
                value=snapshot.value,
                line_number=snapshot.line_number,
                scope_id=snapshot.scope_id,
                execution_id=snapshot.execution_id,
                var_id=snapshot.var_id,
                access_path=snapshot.access_path,
                order=index,
            )
        )

    events = _augment_pop_mutation_events(events, source_code, filters)
    events = _project_expression_watch_events(events, filters)
    events = _merge_duplicate_root_events(events)
    return _compact_event_orders(events)


def _normalize_max_steps(max_steps: int | None) -> int | None:
    if max_steps is None:
        return None
    return max(0, int(max_steps))


def _normalize_trace_output_mode(output: str) -> TraceOutputMode:
    if output not in {"frames", "manifest"}:
        raise ValueError(f"Unsupported trace output mode: {output!r}")
    return cast(TraceOutputMode, output)


def _validate_trace_payload_mode(output: TraceOutputMode, payload: bool) -> None:
    if payload and output != "manifest":
        raise ValueError("payload=True requires output='manifest'")


def visualize_algorithm(
    source_code: str,
    *,
    watch_variables: Sequence[WatchTarget] | None = None,
    config: VisualizerConfig | None = None,
    max_steps: int | None = None,
    tracer: StepTracer | None = None,
    globals_dict: Mapping[str, Any] | None = None,
    name_factory: Callable[[str], str] | None = None,
    output: TraceOutputMode = "frames",
    payload: bool = False,
) -> dict[str, list[RenderedTraceFrame]] | TraceManifest | dict[str, Any]:
    """Run StepTracer and render traces while preserving global execution steps."""

    normalized_output = _normalize_trace_output_mode(output)
    _validate_trace_payload_mode(normalized_output, payload)
    normalized_max_steps = _normalize_max_steps(max_steps)
    events = trace_algorithm(
        source_code,
        watch_variables,
        tracer=tracer,
        globals_dict=globals_dict,
        max_events=normalized_max_steps,
    )
    traces = build_traces(events, name_factory=name_factory)
    rendered = visualize_traces(
        traces.values(),
        config=config,
        max_steps=normalized_max_steps,
    )
    if normalized_output == "frames":
        return rendered
    manifest = build_trace_manifest(traces, rendered)
    if payload:
        return serialize_trace_manifest_payload(manifest)
    return manifest
