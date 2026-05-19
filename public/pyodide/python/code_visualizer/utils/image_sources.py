from __future__ import annotations

import base64
import io
import tempfile
from pathlib import Path
from typing import Any
from urllib.parse import unquote_to_bytes, urlparse
from urllib.request import Request, urlopen
from uuid import uuid4

from graphviz import Source  # type: ignore[import-untyped]

from ..renderers.html.labels import html_img, html_single_cell_table

_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}
_DATA_URI_SUFFIX = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
}
_MIME_TO_SUFFIX = _DATA_URI_SUFFIX
_ASCII_TMP_ROOT = Path(tempfile.gettempdir())
if any(ord(ch) > 127 for ch in str(_ASCII_TMP_ROOT)):
    _ASCII_TMP_ROOT = Path("/tmp")  # noqa: S108
_IMAGE_CACHE_DIR = (_ASCII_TMP_ROOT / "code_visualizer_images").resolve()
_IMAGE_CACHE_DIR.mkdir(parents=True, exist_ok=True)


class VisualizationImageError(RuntimeError):
    """Raised when image inputs for visualization are invalid."""


def _is_image_path(candidate: str) -> bool:
    lower = candidate.lower()
    return any(lower.endswith(ext) for ext in _IMAGE_EXTENSIONS)


def _looks_like_image_candidate(value: Any) -> bool:
    if isinstance(value, str):
        candidate = value.strip()
        if not candidate:
            return False
        lower = candidate.lower()
        if lower.startswith("data:image/"):
            return True
        if (
            lower.startswith("http://") or lower.startswith("https://")
        ) and _is_image_path(candidate):
            return True
        if _is_image_path(candidate):
            return True
        try:
            suffix = Path(candidate).suffix
        except Exception:
            return False
        return _is_image_path(suffix)
    if isinstance(value, Path):
        return _is_image_path(value.suffix)
    return False


def _is_pyodide_runtime() -> bool:
    try:
        import sys

        return sys.platform == "emscripten"
    except Exception:
        return False


def _remote_url_suffix(url: str) -> str:
    path_suffix = Path(urlparse(url).path).suffix.lower()
    return path_suffix if path_suffix in _IMAGE_EXTENSIONS else ""


def _assert_ascii_path(path: Path) -> None:
    path_str = str(path)
    if any(ord(ch) > 127 for ch in path_str):
        raise ValueError(
            f"Graphviz image paths must be ASCII-only; got non-ASCII path: {path_str}"
        )


def _write_cached_image(data: bytes, suffix: str) -> str:
    safe_suffix = suffix if suffix in _IMAGE_EXTENSIONS else ".img"
    target = _IMAGE_CACHE_DIR / f"img_{uuid4().hex}{safe_suffix}"
    target.write_bytes(data)
    return str(target)


def _materialize_data_uri(data_uri: str) -> str | None:
    header, sep, payload = data_uri.partition(",")
    if sep == "" or not header.startswith("data:image/"):
        return None
    mime_part = header[len("data:") :]
    parts = mime_part.split(";")
    mime = parts[0]
    is_base64 = any(part == "base64" for part in parts[1:])
    suffix = _DATA_URI_SUFFIX.get(mime, ".img")
    try:
        data = base64.b64decode(payload) if is_base64 else unquote_to_bytes(payload)
    except Exception:
        return None
    return _write_cached_image(data, suffix)


def _download_remote_image(url: str) -> tuple[str | None, str | None]:
    try:
        request = Request(url, headers={"User-Agent": "CodeFlow/0.1 image visualizer"})  # noqa: S310
        with urlopen(request, timeout=5) as resp:  # noqa: S310
            data = resp.read()
            content_type = (
                resp.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
            )
    except Exception as exc:
        return None, f"{type(exc).__name__}: {exc}"
    suffix = _remote_url_suffix(url)
    if suffix not in _IMAGE_EXTENSIONS:
        suffix = _MIME_TO_SUFFIX.get(content_type, ".png")
    return _write_cached_image(data, suffix), None


def _materialize_matplotlib_image(value: Any) -> str | None:
    try:
        from matplotlib.artist import Artist  # type: ignore
        from matplotlib.axes import Axes  # type: ignore
        from matplotlib.figure import Figure  # type: ignore
    except Exception:
        return None

    fig: Any = None
    if isinstance(value, Figure):
        fig = value
    elif isinstance(value, Axes):
        fig = value.figure
    elif isinstance(value, Artist):
        fig = getattr(value, "figure", None)
        if fig is None:
            axes = getattr(value, "axes", None)
            if axes is not None:
                fig = getattr(axes, "figure", None)

    if fig is None:
        return None

    buffer = io.BytesIO()
    try:
        fig.savefig(buffer, format="png", bbox_inches="tight")
    except Exception:
        return None
    data = buffer.getvalue()
    if not data:
        return None
    return _write_cached_image(data, ".png")


def _materialize_pil_image(value: Any) -> str | None:
    try:
        from PIL import Image  # type: ignore
    except Exception:
        return None
    if not isinstance(value, Image.Image):
        return None
    buffer = io.BytesIO()
    fmt = (value.format or "PNG").upper()
    try:
        value.save(buffer, format=fmt)
    except Exception:
        return None
    data = buffer.getvalue()
    if not data:
        return None
    suffix = f".{fmt.lower()}" if f".{fmt.lower()}" in _IMAGE_EXTENSIONS else ".png"
    return _write_cached_image(data, suffix)


def _detect_image_source(value: Any, *, strict: bool = False) -> str | None:  # noqa: C901
    def _fail(detail: str) -> str | None:
        if strict:
            raise VisualizationImageError(detail)
        return None

    if isinstance(value, str):
        candidate = value.strip()
        if not candidate:
            return _fail("Empty image path or URI")
        lower = candidate.lower()
        if lower.startswith("data:image"):
            cached = _materialize_data_uri(candidate)
            return cached if cached is not None else _fail("Invalid data URI for image")
        if lower.startswith(("http://", "https://")):
            if _is_pyodide_runtime():
                return candidate
            cached, error = _download_remote_image(candidate)
            if cached is not None:
                return cached
            if strict:
                # Keep external URLs usable in browser/SVG renderers when servers block
                # Python-side downloads or require hotlink-style image loading.
                return candidate
            return _fail(f"Failed to download remote image: {error or 'unknown error'}")
        if not _is_image_path(candidate):
            return _fail("String does not look like an image path")
        path = Path(candidate)
        if not path.exists() or not path.is_file():
            return _fail(f"Image file not found: {candidate}")
        if not _is_image_path(path.suffix):
            return _fail(f"Unsupported image extension: {path.suffix}")
        resolved = path.resolve()
        try:
            data = resolved.read_bytes()
        except OSError:
            return _fail(f"Failed to read image file: {candidate}")
        try:
            _assert_ascii_path(resolved)
            return str(resolved)
        except ValueError:
            return _write_cached_image(data, resolved.suffix.lower())

    if isinstance(value, Path):
        if not value.exists() or not value.is_file():
            return _fail(f"Image file not found: {value}")
        if not _is_image_path(value.suffix):
            return _fail(f"Unsupported image extension: {value.suffix}")
        resolved = value.resolve()
        try:
            data = resolved.read_bytes()
        except OSError:
            return _fail(f"Failed to read image file: {value}")
        try:
            _assert_ascii_path(resolved)
            return str(resolved)
        except ValueError:
            return _write_cached_image(data, resolved.suffix.lower())

    fig_src = _materialize_matplotlib_image(value)
    if fig_src is not None:
        return fig_src
    pil_src = _materialize_pil_image(value)
    if pil_src is not None:
        return pil_src
    return _fail(f"Unsupported image value type: {type(value).__name__}")


def _image_html(src: str) -> str:
    return html_single_cell_table(
        html_img(src, SCALE="true"),
        table_attrs={
            "border": "0",
            "cellborder": "0",
            "cellspacing": "0",
            "cellpadding": "0",
        },
    )


def _render_dot_to_image(dot_source: str, fmt: str = "png") -> str | None:
    fmt_normalized = fmt.lower()
    if fmt_normalized == "jpeg":
        fmt_normalized = "jpg"
    if fmt_normalized not in {"png", "svg", "jpg"}:
        fmt_normalized = "png"
    try:
        src = Source(dot_source)
        src.format = fmt_normalized
        base = _IMAGE_CACHE_DIR / f"inline_{uuid4().hex}"
        rendered = Path(
            src.render(
                filename=base.name, directory=str(_IMAGE_CACHE_DIR), cleanup=True
            )
        )
        return str(rendered.with_suffix(f".{fmt_normalized}"))
    except Exception:
        return None
