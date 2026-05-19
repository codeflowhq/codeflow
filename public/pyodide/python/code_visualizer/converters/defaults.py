"""Built-in value converter utilities for heterogeneous data inputs."""

from __future__ import annotations

from collections import deque
from collections.abc import Sequence
from typing import Any

from .pipeline import ConverterPipeline
from .types import ConverterResult, ValueConverter

try:  # pragma: no cover - optional dependency
    import numpy as _np  # type: ignore
except Exception:  # pragma: no cover - numpy optional
    _np = None  # type: ignore

try:  # pragma: no cover - optional dependency
    import pandas as _pd  # type: ignore
except Exception:  # pragma: no cover - pandas optional
    _pd = None  # type: ignore


def numpy_array_converter(value: Any) -> ConverterResult:
    if _np is not None and isinstance(value, _np.ndarray):  # type: ignore[has-type]
        return True, value.tolist()
    return False, value


def pandas_converter(value: Any) -> ConverterResult:
    if _pd is None:
        return False, value
    if isinstance(value, _pd.DataFrame):  # type: ignore[has-type]
        return True, value.to_dict(orient="list")
    if isinstance(value, _pd.Series):  # type: ignore[has-type]
        return True, value.to_dict()
    return False, value


def deque_converter(value: Any) -> ConverterResult:
    if isinstance(value, deque):
        return True, list(value)
    return False, value


def identity_converter(value: Any) -> ConverterResult:
    return False, value


def apply_converter_pipeline(
    value: Any, converters: Sequence[ValueConverter]
) -> tuple[Any, bool]:
    return ConverterPipeline(tuple(converters)).coerce(value)


DEFAULT_CONVERTERS: tuple[ValueConverter, ...] = (
    numpy_array_converter,
    pandas_converter,
    deque_converter,
    identity_converter,
)


def default_converter_pipeline() -> ConverterPipeline:
    return ConverterPipeline(DEFAULT_CONVERTERS)


__all__ = [
    "DEFAULT_CONVERTERS",
    "apply_converter_pipeline",
    "default_converter_pipeline",
    "deque_converter",
    "identity_converter",
    "numpy_array_converter",
    "pandas_converter",
]
