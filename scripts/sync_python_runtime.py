from __future__ import annotations

from pathlib import Path
import json

REPO_ROOT = Path(__file__).resolve().parents[1]
PYODIDE_ROOT = REPO_ROOT / "public" / "pyodide"
RUNTIME_CONFIG_PATH = PYODIDE_ROOT / "runtime-config.json"
RUNTIME_WHEEL_SOURCES_PATH = PYODIDE_ROOT / "runtime-wheel-sources.json"


def _remove_legacy_python_sources() -> None:
    legacy_python_root = PYODIDE_ROOT / "python"
    if legacy_python_root.exists():
        for path in sorted(legacy_python_root.rglob("*"), reverse=True):
            if path.is_file():
                path.unlink()
            elif path.is_dir():
                path.rmdir()
        legacy_python_root.rmdir()


def _update_runtime_config(wheel_names: list[str]) -> None:
    config = json.loads(RUNTIME_CONFIG_PATH.read_text(encoding="utf-8"))
    config["wheelUrls"] = wheel_names
    RUNTIME_CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    print(f"updated {RUNTIME_CONFIG_PATH.relative_to(REPO_ROOT)}")


def _load_runtime_wheel_sources() -> list[str]:
    config = json.loads(RUNTIME_WHEEL_SOURCES_PATH.read_text(encoding="utf-8"))
    wheel_urls = config.get("wheelUrls")
    if not isinstance(wheel_urls, list) or not wheel_urls:
        raise SystemExit(
            f"Missing wheelUrls list in {RUNTIME_WHEEL_SOURCES_PATH.relative_to(REPO_ROOT)}."
        )
    normalized = [str(url).strip() for url in wheel_urls if str(url).strip()]
    if not normalized:
        raise SystemExit(
            f"No valid wheel URLs found in {RUNTIME_WHEEL_SOURCES_PATH.relative_to(REPO_ROOT)}."
        )
    return normalized


def main() -> None:
    _remove_legacy_python_sources()
    wheel_urls = _load_runtime_wheel_sources()
    _update_runtime_config(wheel_urls)
    print(f"done: registered browser wheel sources: {', '.join(wheel_urls)}")


if __name__ == "__main__":
    main()
