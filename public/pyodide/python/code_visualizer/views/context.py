from __future__ import annotations

from collections.abc import Callable, Iterator
from dataclasses import dataclass, replace
from typing import Any

from ..shared.models import VisualGraph
from ..shared.view_kinds import ViewKind

ViewResolver = Callable[[str, Any, Any], tuple[ViewKind, bool]]
ValueCoercer = Callable[[Any], Any]


@dataclass(frozen=True, slots=True)
class ViewBuildContext:
    graph: VisualGraph
    item_limit: int
    coerce: ValueCoercer
    resolver: ViewResolver | None
    focus_path: str | None
    counter: Iterator[int]
    show_titles: bool

    def with_resolver(self, resolver: ViewResolver | None) -> ViewBuildContext:
        return replace(self, resolver=resolver)
