from __future__ import annotations

from collections.abc import Callable
from typing import Any

NestedRenderer = Callable[[Any, str, int], str | None]
