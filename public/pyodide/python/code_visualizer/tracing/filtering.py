from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class WatchFilter:
    """Filter rules for selecting which snapshots to keep."""

    name: str | None = None
    access_path: str | None = None
    trace_name: str | None = None
    scope_id: int | None = None
    line_number: int | None = None

    def matches(self, snapshot: Any) -> bool:
        if self.name is not None and getattr(snapshot, "name", None) != self.name:
            return False
        if not trace_access_path_matches(
            self.access_path, getattr(snapshot, "access_path", None)
        ):
            return False
        if (
            self.scope_id is not None
            and getattr(snapshot, "scope_id", None) != self.scope_id
        ):
            return False
        if (
            self.line_number is not None
            and getattr(snapshot, "line_number", None) != self.line_number
        ):
            return False
        return True


WatchTarget = str | WatchFilter | Mapping[str, Any]


def normalize_trace_access_path(path: str | None) -> str | None:
    if path is None:
        return None
    return path.replace('"', "'")


def trace_access_path_matches(expected: str | None, actual: str | None) -> bool:
    if expected is None:
        return True
    normalized_expected = normalize_trace_access_path(expected)
    normalized_actual = normalize_trace_access_path(actual)
    if normalized_expected is None or normalized_actual is None:
        return False
    if normalized_actual == normalized_expected:
        return True
    return normalized_actual.startswith(
        normalized_expected + "["
    ) or normalized_actual.startswith(normalized_expected + ".")


def normalize_trace_watch_filters(
    watch_variables: Sequence[WatchTarget] | None,
) -> list[WatchFilter]:
    filters: list[WatchFilter] = []
    if not watch_variables:
        return filters
    for raw in watch_variables:
        if isinstance(raw, WatchFilter):
            filters.append(raw)
        elif isinstance(raw, str):
            if "[" in raw or "." in raw:
                root_name = raw.split("[", 1)[0].split(".", 1)[0]
                filters.append(
                    WatchFilter(name=root_name, access_path=raw, trace_name=raw)
                )
            else:
                filters.append(WatchFilter(name=raw))
        elif isinstance(raw, Mapping):
            filters.append(
                WatchFilter(
                    name=raw.get("name"),
                    access_path=raw.get("access_path"),
                    trace_name=raw.get("trace_name"),
                    scope_id=raw.get("scope_id"),
                    line_number=raw.get("line_number"),
                )
            )
        else:
            raise TypeError(f"Unsupported watch target type: {type(raw)!r}")
    filters.sort(key=lambda rule: (rule.access_path is None, rule.name or ""))
    return filters


def format_trace_slot_name(base_name: str, step: int) -> str:
    name = base_name or "trace"
    return f"{name} [step {step}]"


def watch_filter_conditions(rule: WatchFilter) -> list[tuple[str, str, Any]]:
    conditions: list[tuple[str, str, Any]] = []
    if rule.name:
        conditions.append(("name", "==", rule.name))
    if rule.scope_id is not None:
        conditions.append(("scope_id", "==", rule.scope_id))
    if rule.line_number is not None:
        conditions.append(("line_number", "==", rule.line_number))
    return conditions


normalize_access_path = normalize_trace_access_path
access_path_matches = trace_access_path_matches
normalize_watch_filters = normalize_trace_watch_filters
_normalize_access_path = normalize_trace_access_path
