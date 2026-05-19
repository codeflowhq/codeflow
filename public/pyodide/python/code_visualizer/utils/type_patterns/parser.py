from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class _TypePattern:
    kind: str
    args: tuple[_TypePattern, ...] = ()


class _TypePatternParser:
    def __init__(self, text: str):
        self.text = text
        self.length = len(text)
        self.pos = 0

    def parse(self) -> _TypePattern:
        node = self._parse_pattern()
        self._skip_ws()
        if self.pos != self.length:
            raise ValueError(f"unexpected trailing characters at position {self.pos}")
        return node

    def _parse_pattern(self) -> _TypePattern:
        identifier = self._parse_identifier()
        args: list[_TypePattern] = []
        self._skip_ws()
        if self._peek() != "[":
            return _TypePattern(kind=identifier)

        self.pos += 1
        while True:
            self._skip_ws()
            if self._peek() == "]":
                self.pos += 1
                break
            args.append(self._parse_pattern())
            self._skip_ws()
            current = self._peek()
            if current == ",":
                self.pos += 1
                continue
            if current == "]":
                self.pos += 1
                break
            raise ValueError(f"expected ',' or ']' at position {self.pos}")
        return _TypePattern(kind=identifier, args=tuple(args))

    def _parse_identifier(self) -> str:
        self._skip_ws()
        start = self.pos
        while self.pos < self.length and (
            self.text[self.pos].isalnum() or self.text[self.pos] in {"_", "."}
        ):
            self.pos += 1
        if start == self.pos:
            raise ValueError(f"expected identifier at position {self.pos}")
        return self.text[start : self.pos].lower()

    def _skip_ws(self) -> None:
        while self.pos < self.length and self.text[self.pos].isspace():
            self.pos += 1

    def _peek(self) -> str | None:
        if self.pos >= self.length:
            return None
        return self.text[self.pos]
