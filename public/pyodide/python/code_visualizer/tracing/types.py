from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..shared.models import Artifact


@dataclass(frozen=True, slots=True)
class RenderedTraceFrame:
    """Rendered trace artifact paired with the original global execution step."""

    step: int
    artifact: Artifact
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class VariableTraceEvent:
    """Single variable snapshot produced by StepTracer."""

    variable: str
    value: Any
    line_number: int
    scope_id: int
    execution_id: int
    var_id: int
    access_path: str
    order: int
    access_paths: tuple[str, ...] = ()

    def note(self) -> str:
        return f"line {self.line_number} · exec#{self.execution_id} · scope#{self.scope_id}"


@dataclass(frozen=True, slots=True)
class TraceManifestStep:
    step_id: str
    timeline_key: str
    index: int
    execution_id: int | None
    order: int | None
    title: str | None
    meta: dict[str, Any]
    kind: str
    dot: str | None = None
    svg: str | None = None


@dataclass(frozen=True, slots=True)
class TraceManifestEntry:
    variable: str
    kind: str
    compatible_view_kinds: list[str]
    steps: list[TraceManifestStep]


@dataclass(frozen=True, slots=True)
class TraceManifest:
    manifest: list[TraceManifestEntry]
