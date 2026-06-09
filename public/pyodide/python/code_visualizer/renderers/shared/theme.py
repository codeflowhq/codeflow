from __future__ import annotations

FONT_FAMILY = "Helvetica"

TEXT_PRIMARY = "#0f172a"
TEXT_MUTED = "#94a3b8"
TEXT_SECONDARY = "#475569"
TEXT_INDEX = "#dc2626"
TEXT_WARNING = "#b45309"
ELLIPSIS_TEXT = "#64748b"

BORDER_DEFAULT = "#cbd5e1"
BORDER_MUTED = "#e2e8f0"
BORDER_DARK = "#4b5563"
BORDER_CHAIN = "#6b7280"
BORDER_FOCUS = "#60a5fa"
BORDER_STRONG = "#2563eb"
BORDER_TREE = "#1f2933"
BORDER_ROW_HEADER = "#f8dca3"
BORDER_CELL_FOCUS = "#f59e0b"

BG_SURFACE = "#ffffff"
BG_PANEL = "#f8fafc"
BG_HEADER = "#e5e7eb"
BG_HEADER_MUTED = "#f3f4f6"
BG_FOCUS = "#dbeafe"
BG_FOCUS_SOFT = "#eff6ff"
BG_PREVIEW = "#eef2ff"
BG_ROW_HEADER = "#fef3c7"
BG_ROW_HEADER_FOCUS = "#fde68a"
BG_CELL_FOCUS = "#fff7ed"
BG_BAR_POSITIVE_SOFT = "#bae6fd"
BG_BAR_NEGATIVE_SOFT = "#fecaca"

FILL_BAR_POSITIVE = "#2563eb"
FILL_BAR_NEGATIVE = "#dc2626"

TITLE_FONT_SIZE = 16
SUBTITLE_FONT_SIZE = 10
BODY_FONT_SIZE = 11
INDEX_FONT_SIZE = 12

TEXT_NULL = "#9ca3af"


def normalize_hex_color(value: str | None) -> str | None:
    if not value:
        return None
    candidate = value.strip()
    if not candidate.startswith("#"):
        candidate = f"#{candidate}"
    hex_part = candidate[1:]
    if len(hex_part) == 3 and all(ch in "0123456789abcdefABCDEF" for ch in hex_part):
        hex_part = "".join(ch * 2 for ch in hex_part)
    if len(hex_part) != 6 or any(ch not in "0123456789abcdefABCDEF" for ch in hex_part):
        return None
    return f"#{hex_part.lower()}"


def blend_hex_colors(color: str, base: str, ratio: float) -> str:
    normalized_color = normalize_hex_color(color)
    normalized_base = normalize_hex_color(base)
    if normalized_color is None or normalized_base is None:
        return normalized_base or normalized_color or base
    clamped_ratio = max(0.0, min(1.0, ratio))

    def _channels(hex_color: str) -> tuple[int, int, int]:
        return (
            int(hex_color[1:3], 16),
            int(hex_color[3:5], 16),
            int(hex_color[5:7], 16),
        )

    color_channels = _channels(normalized_color)
    base_channels = _channels(normalized_base)
    mixed = tuple(
        round((channel * clamped_ratio) + (base_channel * (1.0 - clamped_ratio)))
        for channel, base_channel in zip(color_channels, base_channels, strict=True)
    )
    return "#" + "".join(f"{channel:02x}" for channel in mixed)
