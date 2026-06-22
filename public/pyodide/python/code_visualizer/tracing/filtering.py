from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

_WATCH_ROOT_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*")


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
    normalized = path.strip().replace('"', "'")
    return normalized or None


def _normalize_watch_name(name: str | None) -> str | None:
    if name is None:
        return None
    normalized = name.strip()
    return normalized or None


def _coerce_optional_int(value: Any, field_name: str) -> int | None:
    if value is None:
        return None
    if isinstance(value, bool):
        raise TypeError(f"{field_name} must be an integer or None")
    if isinstance(value, int):
        return value
    raise TypeError(f"{field_name} must be an integer or None")


def _root_name_from_expression(expression: str) -> str:
    match = _WATCH_ROOT_PATTERN.match(expression)
    if match is None:
        raise ValueError(f"Unsupported watch expression: {expression!r}")
    return match.group(0)


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
            name = _normalize_watch_name(raw.name)
            access_path = normalize_trace_access_path(raw.access_path)
            filters.append(
                WatchFilter(
                    name=name or (_root_name_from_expression(access_path) if access_path else None),
                    access_path=access_path,
                    trace_name=_normalize_watch_name(raw.trace_name) or access_path,
                    scope_id=_coerce_optional_int(raw.scope_id, "scope_id"),
                    line_number=_coerce_optional_int(raw.line_number, "line_number"),
                )
            )
        elif isinstance(raw, str):
            normalized = raw.strip()
            if not normalized:
                raise ValueError("Watch targets must not be empty strings")
            if "[" in normalized or "." in normalized:
                root_name = _root_name_from_expression(normalized)
                filters.append(
                    WatchFilter(
                        name=root_name,
                        access_path=normalize_trace_access_path(normalized),
                        trace_name=normalized,
                    )
                )
            else:
                filters.append(WatchFilter(name=normalized))
        elif isinstance(raw, Mapping):
            access_path = normalize_trace_access_path(raw.get("access_path"))
            name = _normalize_watch_name(raw.get("name"))
            trace_name = _normalize_watch_name(raw.get("trace_name")) or access_path
            if name is None and access_path is not None:
                name = _root_name_from_expression(access_path)
            if (
                name is None
                and access_path is None
                and raw.get("scope_id") is None
                and raw.get("line_number") is None
            ):
                raise ValueError("Watch filter mappings must include at least one selector")
            filters.append(
                WatchFilter(
                    name=name,
                    access_path=access_path,
                    trace_name=trace_name,
                    scope_id=_coerce_optional_int(raw.get("scope_id"), "scope_id"),
                    line_number=_coerce_optional_int(raw.get("line_number"), "line_number"),
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
