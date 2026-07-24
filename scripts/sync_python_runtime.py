from __future__ import annotations

from pathlib import Path
import json

REPO_ROOT = Path(__file__).resolve().parents[1]
PYODIDE_ROOT = REPO_ROOT / "public" / "pyodide"
PYODIDE_WHEEL_ROOT = PYODIDE_ROOT / "wheels"
RUNTIME_CONFIG_PATH = PYODIDE_ROOT / "runtime-config.json"

REQUIRED_WHEEL_PREFIXES = (
    "step_tracer",
    "query_engine",
    "codeflow_py",
)


def _resolve_latest_wheel(prefix: str) -> str:
    matches = sorted(PYODIDE_WHEEL_ROOT.glob(f"{prefix}-*.whl"))
    if not matches:
        raise SystemExit(
            f"Missing required browser wheel for {prefix!r} in {PYODIDE_WHEEL_ROOT}. "
            "Download or build the wheel in its source repository first, then run this script again."
        )
    return matches[-1].name


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
    config["wheelUrls"] = [f"pyodide/wheels/{wheel_name}" for wheel_name in wheel_names]
    RUNTIME_CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    print(f"updated {RUNTIME_CONFIG_PATH.relative_to(REPO_ROOT)}")


def main() -> None:
    _remove_legacy_python_sources()
    wheel_names = [_resolve_latest_wheel(prefix) for prefix in REQUIRED_WHEEL_PREFIXES]
    _update_runtime_config(wheel_names)
    print(f"done: registered browser wheels: {', '.join(wheel_names)}")


if __name__ == "__main__":
    main()
