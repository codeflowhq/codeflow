import importlib
import json
import sys
from pathlib import Path

_RUNTIME_ROOT = Path("/code_visualizer_runtime")
if str(_RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(_RUNTIME_ROOT))


def _require_browser_dependencies():
    diagnostics = []
    checks = [
        ("step_tracer", "import step_tracer"),
        ("step_tracer.StepTracer", "from step_tracer import StepTracer"),
        ("query_engine", "import query_engine"),
        ("query_engine.QueryEngine", "from query_engine import QueryEngine"),
    ]
    for label, statement in checks:
        try:
            exec(statement, globals())
        except Exception as exc:
            diagnostics.append(f"{label}: {exc!r}")
    if diagnostics:
        raise RuntimeError("Browser dependency import failed. Please reload the page.")


_require_browser_dependencies()

from code_visualizer import visualize_algorithm
from code_visualizer.shared import ViewKind, default_visualizer_config


def _resolve_converter(spec: str):
    module_name, _, attr_name = spec.partition(":")
    if not module_name or not attr_name:
        raise ValueError(f"Invalid converter spec: {spec}")
    module = importlib.import_module(module_name)
    converter = getattr(module, attr_name)
    if not callable(converter):
        raise TypeError(f"Converter is not callable: {spec}")
    return converter


def run_visualization(payload_json: str):
    payload = json.loads(payload_json)
    config_payload = payload.get("config") or {}
    config = default_visualizer_config()

    step_limit = config_payload.get("step_limit")
    if step_limit is not None:
        config.trace_step_limit_default = step_limit

    output_format = config_payload.get("output_format")
    if output_format:
        config.output_format = output_format

    max_depth = config_payload.get("max_depth")
    if max_depth is not None:
        config.max_depth = max_depth

    max_items_per_view = config_payload.get("max_items_per_view")
    if max_items_per_view is not None:
        config.max_items_per_view = max_items_per_view

    recursion_depth_default = config_payload.get("recursion_depth_default")
    if recursion_depth_default is not None:
        config.recursion_depth_default = recursion_depth_default

    auto_recursion_depth_cap = config_payload.get("auto_recursion_depth_cap")
    if auto_recursion_depth_cap is not None:
        config.auto_recursion_depth_cap = auto_recursion_depth_cap

    show_titles = config_payload.get("show_titles")
    if show_titles is not None:
        config.show_titles = bool(show_titles)

    custom_converters = config_payload.get("custom_converters") or []
    if custom_converters:
        converters = tuple(_resolve_converter(spec) for spec in custom_converters)
        config = config.with_converters(*converters)

    type_view_defaults = config_payload.get("type_view_defaults") or {}
    for type_pattern, view_kind in type_view_defaults.items():
        if view_kind and view_kind != "auto":
            config.view_type_map[type_pattern] = ViewKind(view_kind)

    variable_configs = config_payload.get("variable_configs") or {}
    for variable_name, variable_config in variable_configs.items():
        view_kind = variable_config.get("view_kind")
        if view_kind and view_kind != "auto":
            config.view_name_map[variable_name] = ViewKind(view_kind)
        depth = variable_config.get("depth")
        if depth is not None:
            config.recursion_depth_map[variable_name] = depth
        view_options = variable_config.get("view_options") or {}
        accent_color = view_options.get("color") or view_options.get("barColor")
        if accent_color:
            config.view_color_map[variable_name] = accent_color

    result = visualize_algorithm(
        payload["snippet"],
        watch_variables=payload.get("watch"),
        config=config,
        max_steps=step_limit,
        output="manifest",
        payload=True,
    )
    return json.dumps(result)
