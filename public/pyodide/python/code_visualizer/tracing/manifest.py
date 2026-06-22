from __future__ import annotations

from collections.abc import Mapping
from dataclasses import asdict
from typing import Any

from ..pipeline.resolver import compatible_views
from ..shared.models import ArtifactKind, Trace
from .types import (
    RenderedTraceFrame,
    TraceManifest,
    TraceManifestEntry,
    TraceManifestStep,
)


def build_manifest_step(frame: RenderedTraceFrame) -> TraceManifestStep:
    meta = dict(frame.meta)
    execution_id = meta.get("execution_id")
    order = meta.get("order")
    timeline_key = (
        f"{execution_id if execution_id is not None else frame.step}:"
        f"{order if order is not None else 0}"
    )
    step_id = f"step {order if order is not None else frame.step}"
    kind = "dot" if frame.artifact.kind == ArtifactKind.GRAPHVIZ else "svg"
    return TraceManifestStep(
        step_id=step_id,
        timeline_key=timeline_key,
        index=frame.step,
        execution_id=execution_id,
        order=order,
        title=frame.artifact.title,
        meta=meta,
        kind=kind,
        dot=frame.artifact.content if kind == "dot" else None,
        svg=frame.artifact.content if kind == "svg" else None,
    )


def build_trace_manifest(
    traces: Mapping[str, Trace],
    rendered: Mapping[str, list[RenderedTraceFrame]],
) -> TraceManifest:
    manifest: list[TraceManifestEntry] = []
    for variable, frames in rendered.items():
        steps = [build_manifest_step(frame) for frame in frames]
        kind = steps[0].kind if steps else "dot"
        trace = traces.get(variable)
        sample_value = trace.frames[-1].value if trace and trace.frames else None
        compatible_view_kinds = (
            [view.value for view in compatible_views(sample_value)]
            if sample_value is not None
            else ["auto"]
        )
        manifest.append(
            TraceManifestEntry(
                variable=variable,
                kind=kind,
                compatible_view_kinds=compatible_view_kinds,
                steps=steps,
            )
        )
    return TraceManifest(manifest=manifest)


def serialize_trace_manifest_payload(manifest: TraceManifest) -> dict[str, Any]:
    return {"manifest": [asdict(entry) for entry in manifest.manifest]}
