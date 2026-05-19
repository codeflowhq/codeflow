from __future__ import annotations

import ast
import json
from collections import deque
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from .filtering import WatchFilter, trace_access_path_matches
from .types import VariableTraceEvent


@dataclass(frozen=True, slots=True)
class PopMutation:
    receiver: str
    method: str
    argument: Any = None
    has_argument: bool = False


_MISSING = object()


def _literal_arg(node: ast.AST | None) -> tuple[bool, Any]:
    if isinstance(node, ast.Constant):
        return True, node.value
    return False, None


def _pop_mutation_receivers(source_code: str) -> dict[int, PopMutation]:
    """Map assignment lines such as `node = queue.popleft()` to mutated containers."""

    try:
        tree = ast.parse(source_code)
    except SyntaxError:
        return {}

    receivers: dict[int, PopMutation] = {}
    for node in ast.walk(tree):
        if not isinstance(node, ast.Assign | ast.AnnAssign):
            continue
        value = node.value
        if not isinstance(value, ast.Call) or not isinstance(value.func, ast.Attribute):
            continue
        receiver = value.func.value
        if not isinstance(receiver, ast.Name):
            continue
        method = value.func.attr
        if method == "popleft":
            receivers[node.lineno] = PopMutation(receiver=receiver.id, method=method)
            continue
        if method == "pop":
            has_argument, argument = _literal_arg(value.args[0] if value.args else None)
            receivers[node.lineno] = PopMutation(
                receiver=receiver.id,
                method=method,
                argument=argument,
                has_argument=has_argument,
            )
    return receivers


def _is_watched_name(name: str, filters: Sequence[WatchFilter]) -> bool:
    if not filters:
        return True
    return any(rule.name == name and rule.access_path is None for rule in filters)


def _extract_access_path_value(root_value: Any, expression: str, root_name: str) -> Any:  # noqa: C901
    try:
        parsed = ast.parse(expression, mode="eval").body
    except SyntaxError:
        return _MISSING
    if not isinstance(parsed, ast.Name | ast.Subscript | ast.Attribute):
        return _MISSING

    def walk(node: ast.AST, value: Any) -> Any:
        if isinstance(node, ast.Name):
            return value if node.id == root_name else _MISSING
        if isinstance(node, ast.Subscript):
            base = walk(node.value, value)
            if base is _MISSING:
                return _MISSING
            key_node = node.slice
            if not isinstance(key_node, ast.Constant):
                return _MISSING
            try:
                return base[key_node.value]
            except (KeyError, IndexError, TypeError):
                return _MISSING
        if isinstance(node, ast.Attribute):
            base = walk(node.value, value)
            if base is _MISSING:
                return _MISSING
            if isinstance(base, dict):
                return base.get(node.attr, _MISSING)
            return getattr(base, node.attr, _MISSING)
        return _MISSING

    return walk(parsed, root_value)


def _project_expression_watch_events(
    events: Sequence[VariableTraceEvent],
    filters: Sequence[WatchFilter],
) -> list[VariableTraceEvent]:
    if not filters:
        return list(events)

    expression_rules = [rule for rule in filters if rule.name and rule.access_path]
    root_names = {
        rule.name for rule in filters if rule.name and rule.access_path is None
    }
    if not expression_rules:
        return list(events)

    updated: list[VariableTraceEvent] = []
    for event in events:
        if event.variable in root_names:
            updated.append(event)
        for rule in expression_rules:
            if rule.access_path is None:
                continue
            trace_name = rule.trace_name or rule.access_path
            if rule.name is None or event.variable not in {rule.name, trace_name}:
                continue
            projected_value = _extract_access_path_value(
                event.value, rule.access_path, rule.name
            )
            if projected_value is _MISSING:
                continue
            focus_path = (
                event.access_path
                if trace_access_path_matches(rule.access_path, event.access_path)
                else rule.access_path
            )
            access_paths = tuple(
                dict.fromkeys(
                    path
                    for path in (focus_path, *event.access_paths)
                    if path is not None and trace_access_path_matches(rule.access_path, path)
                )
            )
            updated.append(
                VariableTraceEvent(
                    variable=trace_name,
                    value=projected_value,
                    line_number=event.line_number,
                    scope_id=event.scope_id,
                    execution_id=event.execution_id,
                    var_id=event.var_id,
                    access_path=focus_path,
                    order=event.order,
                    access_paths=access_paths or (focus_path,),
                )
            )
    return updated


def _pop_index(mutation: PopMutation) -> int:
    return (
        mutation.argument
        if mutation.has_argument and isinstance(mutation.argument, int)
        else -1
    )


def _simulate_sequence_pop(value: list[Any], mutation: PopMutation) -> list[Any]:
    next_value = list(value)
    if not next_value:
        return next_value
    try:
        next_value.pop(_pop_index(mutation))
    except IndexError:
        pass
    return next_value


def _simulate_pop_value(value: Any, mutation: PopMutation, popped_value: Any) -> Any:
    if isinstance(value, deque):
        deque_value = deque(value)
        if deque_value:
            if mutation.method == "popleft":
                deque_value.popleft()
            else:
                deque_value.pop()
        return deque_value
    if isinstance(value, list):
        return _simulate_sequence_pop(value, mutation)
    if isinstance(value, tuple):
        return tuple(_simulate_sequence_pop(list(value), mutation))
    if isinstance(value, dict):
        dict_value = dict(value)
        if mutation.has_argument:
            dict_value.pop(mutation.argument, None)
        return dict_value
    if isinstance(value, set):
        set_value = set(value)
        set_value.discard(popped_value)
        return set_value
    if isinstance(value, frozenset):
        set_value = set(value)
        set_value.discard(popped_value)
        return frozenset(set_value)
    return value


def _stable_value_key(value: Any) -> str:
    try:
        return json.dumps(value, sort_keys=True, default=repr)
    except TypeError:
        return repr(value)


def _merge_duplicate_root_events(
    events: Sequence[VariableTraceEvent],
) -> list[VariableTraceEvent]:
    merged: list[VariableTraceEvent] = []
    index_by_key: dict[tuple[str, int, int, str], int] = {}
    for event in events:
        key = (
            event.variable,
            event.execution_id,
            event.line_number,
            _stable_value_key(event.value),
        )
        existing_index = index_by_key.get(key)
        if existing_index is None:
            access_paths = event.access_paths or (event.access_path,)
            index_by_key[key] = len(merged)
            merged.append(
                VariableTraceEvent(
                    variable=event.variable,
                    value=event.value,
                    line_number=event.line_number,
                    scope_id=event.scope_id,
                    execution_id=event.execution_id,
                    var_id=event.var_id,
                    access_path=event.access_path,
                    order=event.order,
                    access_paths=access_paths,
                )
            )
            continue

        existing = merged[existing_index]
        access_paths = tuple(
            dict.fromkeys(
                (*existing.access_paths, event.access_path, *event.access_paths)
            )
        )
        merged[existing_index] = VariableTraceEvent(
            variable=existing.variable,
            value=existing.value,
            line_number=existing.line_number,
            scope_id=existing.scope_id,
            execution_id=existing.execution_id,
            var_id=existing.var_id,
            access_path=existing.access_path,
            order=existing.order,
            access_paths=access_paths,
        )
    return merged


def _compact_event_orders(
    events: Sequence[VariableTraceEvent],
) -> list[VariableTraceEvent]:
    order_by_execution: dict[tuple[int, int], int] = {}
    next_order = 1
    compacted: list[VariableTraceEvent] = []
    for event in events:
        key = (event.execution_id, event.line_number)
        order = order_by_execution.get(key)
        if order is None:
            order = next_order
            order_by_execution[key] = order
            next_order += 1
        compacted.append(
            VariableTraceEvent(
                variable=event.variable,
                value=event.value,
                line_number=event.line_number,
                scope_id=event.scope_id,
                execution_id=event.execution_id,
                var_id=event.var_id,
                access_path=event.access_path,
                order=order,
                access_paths=event.access_paths,
            )
        )
    return compacted


def _augment_pop_mutation_events(
    events: Sequence[VariableTraceEvent],
    source_code: str,
    filters: Sequence[WatchFilter],
) -> list[VariableTraceEvent]:
    mutation_lines = _pop_mutation_receivers(source_code)
    if not mutation_lines:
        return list(events)

    augmented: list[VariableTraceEvent] = []
    last_values: dict[str, Any] = {}
    next_var_id = max((event.var_id for event in events), default=0) + 1
    for event in events:
        mutation = mutation_lines.get(event.line_number)
        if mutation is not None:
            receiver_name = mutation.receiver
            if receiver_name in last_values and _is_watched_name(
                receiver_name, filters
            ):
                synthetic_value = _simulate_pop_value(
                    last_values[receiver_name], mutation, event.value
                )
                augmented.append(
                    VariableTraceEvent(
                        variable=receiver_name,
                        value=synthetic_value,
                        line_number=event.line_number,
                        scope_id=event.scope_id,
                        execution_id=event.execution_id,
                        var_id=next_var_id,
                        access_path=receiver_name,
                        order=event.order,
                        access_paths=(receiver_name,),
                    )
                )
                last_values[receiver_name] = synthetic_value
                next_var_id += 1
        augmented.append(event)
        last_values[event.variable] = event.value
    return augmented
