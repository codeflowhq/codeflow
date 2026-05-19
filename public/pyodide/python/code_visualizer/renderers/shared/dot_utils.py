from __future__ import annotations

from graphviz import Digraph  # type: ignore[import-untyped]


def _digraph_edge(dot: Digraph, tail: str, head: str, **attrs: str) -> None:
    if ":" not in tail and ":" not in head:
        dot.edge(tail, head, **attrs)
        return

    attr_text = ""
    if attrs:
        attr_parts = " ".join(f'{key}="{value}"' for key, value in attrs.items())
        attr_text = f" [{attr_parts}]"
    dot.body.append(f"  {tail} -> {head}{attr_text};")
