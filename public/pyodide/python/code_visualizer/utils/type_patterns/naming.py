from __future__ import annotations

from collections.abc import Mapping

from ...shared.view_kinds import ViewKind


def _normalize_view_name(name: str) -> str:
    return "".join(ch for ch in name.strip() if not ch.isspace())


def _match_named_override(
    name: str, mapping: Mapping[str, ViewKind] | None
) -> ViewKind | None:
    if not mapping:
        return None
    normalized = _normalize_view_name(name)
    for raw_key, view in mapping.items():
        if isinstance(raw_key, str) and _normalize_view_name(raw_key) == normalized:
            return view
    return None
