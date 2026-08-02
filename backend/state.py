"""User-state persistence for the NextSelf frontend.

The pipeline itself has no notion of a user. This store adds the minimal
single-user state the frontend needs: onboarding profile, journey revisions,
item actions, and settings. It lives under outputs/ (gitignored) next to the
pipeline artifacts.
"""

from __future__ import annotations

import copy
import json
import threading
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from config.settings import OUTPUT_DIR

DEFAULT_MEDIA_PREFS: dict[str, bool] = {
    "reading": True,
    "video": True,
    "audio": True,
    "in_person": True,
}

DEFAULT_PROFILE: dict[str, Any] = {
    "who_now": "",
    "aspirations": [],
    "habits": [],
    "media_prefs": DEFAULT_MEDIA_PREFS,
}

DEFAULT_STATE: dict[str, Any] = {
    "onboarded": False,
    "profile": DEFAULT_PROFILE,
    "journey": [],
    "actions": [],
    "feedback_history": [],
    "notes": [],
    "flashcards": [],
    "settings": {"focus": "", "reduced_texture": False},
}


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _list_delta(before: list[Any], after: list[Any]) -> dict[str, list[str]] | None:
    before_set = {str(item) for item in before}
    after_set = {str(item) for item in after}
    added = sorted(after_set - before_set)
    removed = sorted(before_set - after_set)
    if not added and not removed:
        return None
    return {"added": added, "removed": removed}


def _compute_profile_changes(previous: dict[str, Any], current: dict[str, Any]) -> dict[str, Any] | None:
    changes: dict[str, Any] = {}
    prev_who = str(previous.get("who_now") or "")
    curr_who = str(current.get("who_now") or "")
    if prev_who.strip() != curr_who.strip():
        changes["who_now"] = {"before": prev_who, "after": curr_who}

    aspirations = _list_delta(previous.get("aspirations") or [], current.get("aspirations") or [])
    if aspirations:
        changes["aspirations"] = aspirations

    habits = _list_delta(previous.get("habits") or [], current.get("habits") or [])
    if habits:
        changes["habits"] = habits

    return changes or None


def _summarize_changes(changes: dict[str, Any] | None) -> str | None:
    if not changes:
        return None
    parts: list[str] = []
    if "who_now" in changes:
        parts.append("who you are now")
    if "aspirations" in changes:
        parts.append("who you're becoming")
    if "habits" in changes:
        parts.append("habits in motion")
    if not parts:
        return None
    if len(parts) == 1:
        return f"Updated {parts[0]}."
    return f"Updated {' and '.join(parts[:-1])} and {parts[-1]}."


def _deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged = copy.deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


class StateStore:
    """Thread-safe JSON persistence for single-user state."""

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or OUTPUT_DIR / "user_state" / "state.json"
        self._lock = threading.RLock()

    def load(self) -> dict[str, Any]:
        with self._lock:
            payload: dict[str, Any] = {}
            if self.path.exists():
                try:
                    payload = json.loads(self.path.read_text(encoding="utf-8-sig"))
                except (json.JSONDecodeError, OSError):
                    payload = {}
            if not isinstance(payload, dict):
                payload = {}
            return _deep_merge(DEFAULT_STATE, payload)

    def save(self, state: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")
            return state

    def mutate(self, fn: Any) -> dict[str, Any]:
        with self._lock:
            state = self.load()
            fn(state)
            return self.save(state)

    def record_action(self, item_id: str, action: str, item_title: str = "") -> dict[str, Any]:
        entry = {"item_id": item_id, "action": action, "title": item_title, "at": _now_iso()}
        return self.mutate(lambda state: (state["actions"].append(entry), state["feedback_history"].append(entry)))

    def record_profile_change(self, note: str, previous: dict[str, Any] | None = None) -> dict[str, Any]:
        def _apply(state: dict[str, Any]) -> None:
            snapshot = {
                "who_now": state["profile"].get("who_now", ""),
                "aspirations": list(state["profile"].get("aspirations", [])),
                "habits": list(state["profile"].get("habits", [])),
            }
            changes = _compute_profile_changes(previous, state["profile"]) if previous else None
            entry: dict[str, Any] = {
                "date": _now_iso(),
                "note": _summarize_changes(changes) or note,
                "snapshot": snapshot,
            }
            if changes:
                entry["changes"] = changes
            state["journey"].append(entry)

        return self.mutate(_apply)

    def add_note(self, title: str, content: str, linked_item_ids: list[str] = None, 
                 tags: list[str] = None, source_type: str = "manual") -> dict[str, Any]:
        """Add a new note to the user's collection."""
        if linked_item_ids is None:
            linked_item_ids = []
        if tags is None:
            tags = []
            
        note = {
            "id": f"note_{int(datetime.now(UTC).timestamp() * 1000)}",
            "title": title,
            "content": content,
            "linked_item_ids": linked_item_ids,
            "tags": tags,
            "source_type": source_type,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        
        return self.mutate(lambda state: state["notes"].append(note))

    def update_note(self, note_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        """Update an existing note."""
        def _apply(state: dict[str, Any]) -> None:
            for note in state["notes"]:
                if note["id"] == note_id:
                    note.update(updates)
                    note["updated_at"] = _now_iso()
                    break
        
        return self.mutate(_apply)

    def delete_note(self, note_id: str) -> dict[str, Any]:
        """Delete a note."""
        def _apply(state: dict[str, Any]) -> None:
            state["notes"] = [note for note in state["notes"] if note["id"] != note_id]

        return self.mutate(_apply)

    def add_flashcard_set(self, note_id: str, flashcards: list[dict[str, str]]) -> dict[str, Any]:
        """Add flashcards generated from a note."""
        flashcard_set = {
            "id": f"flashcard_{int(datetime.now(UTC).timestamp() * 1000)}",
            "note_id": note_id,
            "cards": flashcards,
            "created_at": _now_iso(),
            "last_reviewed": None,
            "due_date": _now_iso(),  # Due immediately
        }
        
        return self.mutate(lambda state: state["flashcards"].append(flashcard_set))
