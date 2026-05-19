from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Any

from .types import ValueConverter


@dataclass(frozen=True, slots=True)
class ConverterPipeline:
    """Composable one-shot converter pipeline that runs per recursion layer."""

    converters: tuple[ValueConverter, ...]

    def coerce(self, value: Any) -> tuple[Any, bool]:
        for converter in self.converters:
            handled, converted = converter(value)
            if handled:
                return converted, True
        return value, False

    def with_converters(
        self, *extra: ValueConverter, prepend: bool = False
    ) -> ConverterPipeline:
        if not extra:
            return self
        if prepend:
            return ConverterPipeline(tuple(extra) + self.converters)
        return ConverterPipeline(self.converters + tuple(extra))

    def extend(
        self, converters: Iterable[ValueConverter], *, prepend: bool = False
    ) -> ConverterPipeline:
        additions = tuple(converters)
        if not additions:
            return self
        if prepend:
            return ConverterPipeline(additions + self.converters)
        return ConverterPipeline(self.converters + additions)


__all__ = ["ConverterPipeline"]
