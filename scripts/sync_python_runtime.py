from __future__ import annotations

from pathlib import Path
import json
import re
import shutil
import subprocess
import tempfile

REPO_ROOT = Path(__file__).resolve().parents[1]


def _resolve_library_root() -> Path:
    candidates = (
        REPO_ROOT.parents[1] / "codeflow-py" / "src" / "code_visualizer",
        REPO_ROOT.parents[1] / "code-visualizer" / "src" / "code_visualizer",
    )
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


LIB_ROOT = _resolve_library_root()
PYODIDE_ROOT = REPO_ROOT / "public" / "pyodide"
PYODIDE_PYTHON_ROOT = PYODIDE_ROOT / "python"
PYODIDE_WHEEL_ROOT = PYODIDE_ROOT / "wheels"
RUNTIME_ROOT = PYODIDE_PYTHON_ROOT / "code_visualizer"
RUNTIME_CONFIG_PATH = PYODIDE_ROOT / "runtime-config.json"
DEPENDENCY_LOCK_PATH = REPO_ROOT / "scripts" / "browser_dependency_lock.json"


def _load_browser_dependency_specs() -> dict[str, dict[str, str]]:
    specs = json.loads(DEPENDENCY_LOCK_PATH.read_text(encoding="utf-8"))
    if not isinstance(specs, dict) or not specs:
        raise SystemExit(f"Expected pinned browser dependency specs in {DEPENDENCY_LOCK_PATH}")
    for package_name, spec in specs.items():
        if not isinstance(spec, dict) or not spec.get("repo") or not spec.get("ref"):
            raise SystemExit(f"Dependency {package_name} in {DEPENDENCY_LOCK_PATH} must define repo and ref")
    return specs


def _sync_code_visualizer_package() -> int:
    if not LIB_ROOT.exists():
        raise SystemExit(f"Missing library source directory: {LIB_ROOT}")

    if RUNTIME_ROOT.exists():
        shutil.rmtree(RUNTIME_ROOT)
    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)

    copied = 0
    for source in sorted(LIB_ROOT.rglob("*.py")):
        relative_path = source.relative_to(LIB_ROOT)
        target = RUNTIME_ROOT / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        copied += 1
        print(f"synced {relative_path}")
    return copied


def _strip_browser_dependencies(pyproject_text: str) -> str:
    dependency_block = re.compile(
        r"dependencies\s*=\s*\[(?:.|\n)*?\]\n",
        flags=re.MULTILINE,
    )
    stripped = dependency_block.sub("dependencies = []\n", pyproject_text, count=1)
    if stripped == pyproject_text:
        raise SystemExit("Failed to strip dependencies from pyproject.toml for browser wheel build")
    return stripped



def _clean_wheels(prefixes: tuple[str, ...]) -> None:
    PYODIDE_WHEEL_ROOT.mkdir(parents=True, exist_ok=True)
    for prefix in prefixes:
        for existing in PYODIDE_WHEEL_ROOT.glob(f"{prefix}-*.whl"):
            existing.unlink()


def _build_code_visualizer_wheel() -> str:
    _clean_wheels(("codeflow_py",))

    repo_root = LIB_ROOT.parents[1]
    with tempfile.TemporaryDirectory(prefix="codeflow_py_browser_build_") as tmp_dir:
        tmp_root = Path(tmp_dir)
        shutil.copytree(repo_root / "src", tmp_root / "src")
        shutil.copyfile(repo_root / "README.md", tmp_root / "README.md")
        pyproject_text = (repo_root / "pyproject.toml").read_text(encoding="utf-8")
        (tmp_root / "pyproject.toml").write_text(_strip_browser_dependencies(pyproject_text), encoding="utf-8")

        subprocess.run(
            [
                "uv",
                "build",
                "--wheel",
                "--out-dir",
                str(PYODIDE_WHEEL_ROOT),
            ],
            cwd=tmp_root,
            check=True,
        )
    wheels = sorted(PYODIDE_WHEEL_ROOT.glob("codeflow_py-*.whl"))
    if not wheels:
        raise SystemExit("Failed to build codeflow-py wheel")
    return wheels[-1].name


def _build_browser_dependency_wheels() -> list[str]:
    browser_dependency_specs = _load_browser_dependency_specs()
    _clean_wheels(tuple(browser_dependency_specs))
    built_wheels: list[str] = []
    with tempfile.TemporaryDirectory(prefix="codeflow_browser_deps_") as tmp_dir:
        tmp_root = Path(tmp_dir)
        for package_name, spec in browser_dependency_specs.items():
            clone_dir = tmp_root / package_name
            subprocess.run(
                ["git", "clone", "--depth", "1", spec["repo"], str(clone_dir)],
                check=True,
            )
            subprocess.run(
                ["git", "checkout", "--detach", spec["ref"]],
                cwd=clone_dir,
                check=True,
            )
            subprocess.run(
                ["uv", "build", "--wheel", "--out-dir", str(PYODIDE_WHEEL_ROOT)],
                cwd=clone_dir,
                check=True,
            )
            wheels = sorted(PYODIDE_WHEEL_ROOT.glob(f"{package_name}-*.whl"))
            if not wheels:
                raise SystemExit(f"Failed to build {package_name} wheel")
            built_wheels.append(wheels[-1].name)
    return built_wheels


def _remove_legacy_python_sources() -> None:
    for package_name in _load_browser_dependency_specs():
        package_root = PYODIDE_PYTHON_ROOT / package_name
        if package_root.exists():
            shutil.rmtree(package_root)


def _update_runtime_config(wheel_names: list[str]) -> None:
    config = json.loads(RUNTIME_CONFIG_PATH.read_text(encoding="utf-8"))
    config["pythonSources"] = []
    config["wheelUrls"] = [f"pyodide/wheels/{wheel_name}" for wheel_name in wheel_names]
    RUNTIME_CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    print(f"updated {RUNTIME_CONFIG_PATH.relative_to(REPO_ROOT)}")


def main() -> None:
    copied = _sync_code_visualizer_package()
    _remove_legacy_python_sources()
    dependency_wheels = _build_browser_dependency_wheels()
    wheel_name = _build_code_visualizer_wheel()
    wheel_names = [*dependency_wheels, wheel_name]
    _update_runtime_config(wheel_names)
    print(f"done: synced {copied} Python files to {RUNTIME_ROOT} and built browser wheels: {', '.join(wheel_names)}")


if __name__ == "__main__":
    main()
