from __future__ import annotations

from collections.abc import Callable, Mapping
from pathlib import Path
from typing import Any

from ...shared.view_kinds import ViewKind
from ..detection.linked import _collect_linked_list_labels
from ..detection.tree import _tree_children
from ..image_sources import _looks_like_image_candidate
from .parser import _TypePattern, _TypePatternParser

_TYPE_PATTERN_SAMPLE = 8
_TYPE_PATTERN_CACHE: dict[str, _TypePattern] = {}


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _compile_type_pattern(spec: str) -> _TypePattern:
    key = spec.strip()
    if not key:
        raise ValueError("type pattern cannot be empty")
    cached = _TYPE_PATTERN_CACHE.get(key)
    if cached is not None:
        return cached
    pattern = _TypePatternParser(key).parse()
    _TYPE_PATTERN_CACHE[key] = pattern
    return pattern


def _sample_iterable(value: Any, limit: int) -> list[Any]:
    if limit <= 0:
        return []
    if isinstance(value, list):
        return value[:limit]
    if isinstance(value, tuple):
        return list(value[:limit])
    sample: list[Any] = []
    for item in value:
        sample.append(item)
        if len(sample) >= limit:
            break
    return sample


def _matches_type_pattern(value: Any, pattern: _TypePattern) -> bool:
    kind = pattern.kind
    scalar_matchers: dict[str, Callable[[Any], bool]] = {
        "any": lambda current: True,
        "object": lambda current: True,
        "none": lambda current: current is None,
        "bool": lambda current: isinstance(current, bool),
        "int": lambda current: (
            isinstance(current, int) and not isinstance(current, bool)
        ),
        "float": lambda current: isinstance(current, float),
        "number": _is_number,
        "str": lambda current: isinstance(current, str),
        "bytes": lambda current: isinstance(current, (bytes, bytearray)),
        "path": lambda current: isinstance(current, Path),
        "linked_list": lambda current: (
            _collect_linked_list_labels(current, max_nodes=2) is not None
        ),
        "tree": lambda current: _tree_children(current) is not None,
    }
    if kind in scalar_matchers:
        return scalar_matchers[kind](value)
    if kind == "list":
        return isinstance(value, list) and _matches_sequence_args(value, pattern.args)
    if kind == "tuple":
        return isinstance(value, tuple) and _matches_tuple_args(value, pattern.args)
    if kind == "set":
        return isinstance(value, set) and _matches_sequence_args(value, pattern.args)
    if kind == "frozenset":
        return isinstance(value, frozenset) and _matches_sequence_args(
            value, pattern.args
        )
    if kind == "dict":
        return isinstance(value, dict) and _matches_dict_args(value, pattern.args)
    return False


def _matches_sequence_args(value: Any, args: tuple[_TypePattern, ...]) -> bool:
    if not args:
        return True
    child = args[0]
    return all(
        _matches_type_pattern(item, child)
        for item in _sample_iterable(value, _TYPE_PATTERN_SAMPLE)
    )


def _matches_tuple_args(value: tuple[Any, ...], args: tuple[_TypePattern, ...]) -> bool:
    if not args:
        return True
    if len(args) == len(value) and len(args) > 1:
        return all(
            _matches_type_pattern(item, sub)
            for item, sub in zip(value, args, strict=False)
        )
    child = args[0]
    return all(
        _matches_type_pattern(item, child)
        for item in _sample_iterable(value, _TYPE_PATTERN_SAMPLE)
    )


def _matches_dict_args(value: dict[Any, Any], args: tuple[_TypePattern, ...]) -> bool:
    if not args:
        return True
    sampled_items = _sample_iterable(value.items(), _TYPE_PATTERN_SAMPLE)
    if len(args) == 1:
        return all(
            _matches_type_pattern(item_value, args[0])
            for _, item_value in sampled_items
        )
    key_pattern, value_pattern = args[0], args[1]
    return all(
        _matches_type_pattern(key, key_pattern)
        and _matches_type_pattern(item_value, value_pattern)
        for key, item_value in sampled_items
    )


def _match_type_pattern_override(
    value: Any, mapping: Mapping[str, ViewKind] | None
) -> ViewKind | None:
    if not mapping or _looks_like_image_candidate(value):
        return None
    for pattern_text, view in mapping.items():
        try:
            pattern = _compile_type_pattern(pattern_text)
        except ValueError as exc:
            raise ValueError(
                f"Invalid DEFAULT_VIEW_TYPE_MAP entry '{pattern_text}': {exc}"
            ) from exc
        if _matches_type_pattern(value, pattern):
            return view
    return None
