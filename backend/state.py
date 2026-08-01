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
                    payload = json.loads(self.path.read_text(encoding="utf-8"))
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

    def record_profile_change(self, note: str) -> dict[str, Any]:
        def _apply(state: dict[str, Any]) -> None:
            snapshot = {
                "who_now": state["profile"].get("who_now", ""),
                "aspirations": list(state["profile"].get("aspirations", [])),
                "habits": list(state["profile"].get("habits", [])),
            }
            state["journey"].append({"date": _now_iso(), "note": note, "snapshot": snapshot})

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
