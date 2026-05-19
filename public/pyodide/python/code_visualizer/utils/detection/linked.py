from __future__ import annotations

from typing import Any


def _extract_node_value(value: Any) -> Any:
    if hasattr(value, "val"):
        return value.val
    if hasattr(value, "value"):
        return value.value
    return value


def _collect_linked_list_labels(
    value: Any, max_nodes: int
) -> tuple[list[Any], bool] | None:
    if value is None:
        return [], False
    if not hasattr(value, "next"):
        return None

    labels: list[Any] = []
    seen: set[int] = set()
    current = value
    truncated = False
    while current is not None and len(labels) < max_nodes:
        object_id = id(current)
        if object_id in seen:
            truncated = True
            break
        seen.add(object_id)
        labels.append(_extract_node_value(current))
        current = getattr(current, "next", None)
    if current is not None:
        truncated = True
    return labels, truncated


def _looks_like_hash_table(value: Any) -> bool:
    if not isinstance(value, list):
        return False

    saw_bucket = False
    saw_empty = False
    for bucket in value:
        if bucket is None:
            saw_empty = True
            continue
        if hasattr(bucket, "next"):
            return True
        if isinstance(bucket, (dict, set)):
            saw_bucket = True
            continue
        if isinstance(bucket, (list, tuple)):
            if not bucket:
                saw_empty = True
                continue
            has_pointer = any(hasattr(entry, "next") for entry in bucket)
            has_pairs = any(
                isinstance(entry, (tuple, list)) and len(entry) == 2 for entry in bucket
            )
            if has_pointer or has_pairs:
                saw_bucket = True
    return saw_bucket and saw_empty


def _hash_bucket_entries(bucket: Any, max_items: int) -> tuple[list[Any], bool]:
    if bucket is None:
        return [], False

    truncated = False
    if isinstance(bucket, dict):
        entries: list[Any] = [f"{key}:{bucket[key]}" for key in bucket]
    elif isinstance(bucket, set):
        entries = sorted(bucket, key=str)
    elif isinstance(bucket, (list, tuple)):
        entries = list(bucket)
    elif hasattr(bucket, "next"):
        linked = _collect_linked_list_labels(bucket, max_items)
        entries = [bucket] if linked is None else linked[0]
        truncated = False if linked is None else linked[1]
    else:
        entries = [bucket]

    if len(entries) > max_items:
        truncated = True
        entries = entries[:max_items]
    return entries, truncated
