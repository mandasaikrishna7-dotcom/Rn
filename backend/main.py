"""Minimal FastAPI HTTP layer for the NextSelf frontend.

This API was added for the frontend deliverable. It wraps the pipeline's
on-disk artifacts (feed/digest data) and adds single-user state (profile,
journey, actions, settings). The pipeline itself remains a CLI job; POST /api/run
kicks it off as a subprocess.

Real vs stub:
- Feed, item detail, sources, digest:  real pipeline artifacts.
- Profile, journey, actions, settings: real user-state store (new, tiny).
- Mentors & experiences: STUB (no data source exists in the backend).
"""

from __future__ import annotations

import shlex
import subprocess
import sys
import threading
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse

from backend.feed import FeedBuilder
from backend.state import StateStore, _now_iso
from config.settings import BASE_DIR, OUTPUT_DIR

app = FastAPI(title="NextSelf API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

feed_builder = FeedBuilder()
store = StateStore()

app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")


# --------------------------------------------------------------------------- #
# Pipeline run (subprocess, non-blocking)
# --------------------------------------------------------------------------- #

_run_lock = threading.Lock()
_run_state: dict[str, Any] = {"running": False, "started_at": None, "finished_at": None, "exit_code": None}


def _run_pipeline_job() -> None:
    try:
        proc = subprocess.run(
            [sys.executable, "run_pipeline.py", "--stage", "all"],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=1800,
        )
        with _run_lock:
            _run_state.update(running=False, finished_at=_now_iso(), exit_code=proc.returncode)
    except Exception as exc:  # pragma: no cover - defensive
        with _run_lock:
            _run_state.update(running=False, finished_at=_now_iso(), exit_code=-1)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "nextself-api"}


@app.get("/api/run/status")
def run_status() -> dict[str, Any]:
    with _run_lock:
        return dict(_run_state)


@app.post("/api/run")
def start_run() -> dict[str, Any]:
    with _run_lock:
        if _run_state["running"]:
            raise HTTPException(status_code=409, detail="A pipeline run is already in progress.")
        _run_state.update(running=True, started_at=_now_iso(), finished_at=None, exit_code=None)
    thread = threading.Thread(target=_run_pipeline_job, daemon=True)
    thread.start()
    return {"status": "started", "started_at": _run_state["started_at"]}


# --------------------------------------------------------------------------- #
# Profile / onboarding / journey
# --------------------------------------------------------------------------- #

@app.get("/api/bootstrap")
def bootstrap() -> dict[str, Any]:
    state = store.load()
    profile = state["profile"]
    aspirations = profile.get("aspirations") or []
    habits = profile.get("habits") or []
    focus = state["settings"].get("focus") or (aspirations[0] if aspirations else "")
    moment = {
        "focus": focus,
        "label": focus or "setting your compass",
        "digest_date": _latest_digest_date(),
        "note": (
            f"Focused on: {focus}"
            if focus
            else "You haven't set a focus yet — your picks reflect the general weekly digest."
        ),
    }
    return {
        "onboarded": bool(state["onboarded"]),
        "profile": profile,
        "settings": state["settings"],
        "moment": moment,
    }


def _latest_digest_date() -> str | None:
    digest_files = sorted(OUTPUT_DIR.glob("weekly_digest_*.html"))
    if not digest_files:
        return None
    return datetime.fromtimestamp(digest_files[-1].stat().st_mtime, tz=UTC).date().isoformat()


@app.get("/api/profile")
def get_profile() -> dict[str, Any]:
    state = store.load()
    return {"onboarded": bool(state["onboarded"]), "profile": state["profile"]}


@app.put("/api/profile")
def update_profile(payload: dict[str, Any]) -> dict[str, Any]:
    allowed_keys = {"who_now", "aspirations", "habits", "media_prefs"}
    updates = {key: payload[key] for key in allowed_keys if key in payload}
    store.mutate(
        lambda state: (
            state["profile"].update(updates),
            state["profile"]["media_prefs"].update(payload.get("media_prefs") or {}),
        )[0]
    )
    if store.load().get("onboarded"):
        store.record_profile_change("Profile edited from the Journey page.")
    return {"ok": True, "ack": "Noted. Your next picks will be shaped by this."}


@app.post("/api/onboard")
def onboard(payload: dict[str, Any]) -> dict[str, Any]:
    allowed_keys = {"who_now", "aspirations", "habits", "media_prefs"}
    updates = {key: payload[key] for key in allowed_keys if key in payload}

    def _apply(state: dict[str, Any]) -> None:
        state["profile"].update(updates)
        if "media_prefs" in payload:
            state["profile"]["media_prefs"].update(payload["media_prefs"])
        if not state["onboarded"]:
            state["onboarded"] = True
            state["journey"].append(
                {
                    "date": _now_iso(),
                    "note": "Compass set — onboarding completed.",
                    "snapshot": {
                        "who_now": state["profile"].get("who_now", ""),
                        "aspirations": list(state["profile"].get("aspirations", [])),
                        "habits": list(state["profile"].get("habits", [])),
                    },
                }
            )

    store.mutate(_apply)
    return {"ok": True, "ack": "Compass set. Your daily curation now knows which way you're headed."}


@app.get("/api/journey")
def journey() -> dict[str, Any]:
    state = store.load()
    return {"journey": state.get("journey") or [], "profile": state["profile"]}


# --------------------------------------------------------------------------- #
# Feed + item actions
# --------------------------------------------------------------------------- #

def _enabled_media_types() -> list[str]:
    prefs = store.load()["profile"].get("media_prefs") or {}
    enabled: list[str] = []
    if prefs.get("reading", True):
        enabled.append("article")
        enabled.append("paper")
    if prefs.get("video", True):
        enabled.append("video")
    return enabled


@app.get("/api/feed")
def feed(
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
    media_filter: str | None = Query(None, description="comma-separated media types; defaults to profile prefs"),
) -> dict[str, Any]:
    if media_filter:
        allowed = [part.strip() for part in media_filter.split(",") if part.strip()]
    else:
        allowed = _enabled_media_types()
    items = feed_builder.list_items(limit=limit, offset=offset, media_types=allowed)
    return {
        "items": items,
        "limit": limit,
        "offset": offset,
        "count": len(items),
        "media_filter_applied": allowed,
        "note": (
            "Filtered by your media preferences (real preference filter over real feed metadata)."
            if media_filter is None
            else None
        ),
    }


@app.get("/api/feed/{item_id}")
def feed_item(item_id: str) -> dict[str, Any]:
    item = feed_builder.get_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found in current digest artifacts.")
    item["related"] = feed_builder.related_items(item_id)
    state = store.load()
    actions = [a for a in state["actions"] if a.get("item_id") == item_id]
    item["actions_history"] = actions
    return item


@app.post("/api/items/{item_id}/actions")
def item_action(item_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    action = payload.get("action")
    if action not in {"saved", "dismissed", "done", "more_like_this"}:
        raise HTTPException(status_code=422, detail=f"Unknown action '{action}'.")
    item = feed_builder.get_item(item_id, include_members=False)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found.")
    store.record_action(item_id, action, item_title=item.get("title") or "")
    ack = {
        "saved": "Saved to your journal. You can return to it whenever you like.",
        "dismissed": "Dismissed. It won't resurface in this cycle.",
        "done": "Done — noted as engaged. Progress lives in your reflection log, not a streak.",
        "more_like_this": "More like this — noted for the next curation cycle.",
    }[action]
    return {"ok": True, "action": action, "ack": ack}


# --------------------------------------------------------------------------- #
# Mentors & experiences (STUB — no backend data source)
# --------------------------------------------------------------------------- #

@app.get("/api/mentors")
def mentors() -> dict[str, Any]:
    return {
        "stub": True,
        "note": "No mentor/experience data source exists in the backend yet. These are placeholders.",
        "items": [
            {
                "id": "mentor-stub-1",
                "kind": "person",
                "name": "Placeholder: Practitioner",
                "context": "A real mentor suggestion would be derived from your aspirations once the backend can search people.",
                "why": "Stub — backend gap.",
                "stub": True,
            },
            {
                "id": "mentor-stub-2",
                "kind": "community",
                "name": "Placeholder: Community",
                "context": "A real community match would come from an events/communities data source.",
                "why": "Stub — backend gap.",
                "stub": True,
            },
            {
                "id": "mentor-stub-3",
                "kind": "event",
                "name": "Placeholder: Local experience",
                "context": "A real local event or challenge suggestion needs a geo+calendar data source.",
                "why": "Stub — backend gap.",
                "stub": True,
            },
        ],
    }


# --------------------------------------------------------------------------- #
# Progress / reflection
# --------------------------------------------------------------------------- #

REFLECTION_PROMPTS = [
    "What's shifted since you started?",
    "Which pick surprised you this week, and why?",
    "Is the 'self you imagined' still the one you're walking toward?",
    "What did you engage with that you'd normally skip?",
]


@app.get("/api/progress")
def progress() -> dict[str, Any]:
    state = store.load()
    actions = state.get("actions") or []
    engaged = [a for a in actions if a.get("action") in {"saved", "done"}]
    return {
        "engaged": engaged,
        "dismissed_count": sum(1 for a in actions if a.get("action") == "dismissed"),
        "reflection_prompts": REFLECTION_PROMPTS,
        "note": "Progress is a journal of engagement over time — no streaks, no scores.",
    }


# --------------------------------------------------------------------------- #
# Settings
# --------------------------------------------------------------------------- #

@app.get("/api/settings")
def get_settings() -> dict[str, Any]:
    state = store.load()
    return {
        "profile": state["profile"],
        "settings": state["settings"],
        "feedback_history": state.get("feedback_history") or [],
    }


@app.put("/api/settings")
def update_settings(payload: dict[str, Any]) -> dict[str, Any]:
    settings_updates = {k: v for k, v in payload.items() if k in {"focus", "reduced_texture"}}
    profile_updates = {k: v for k, v in payload.items() if k in {"who_now", "aspirations", "habits", "media_prefs"}}
    store.mutate(
        lambda state: (
            state["settings"].update(settings_updates),
            state["profile"].update(profile_updates),
            state["profile"]["media_prefs"].update(payload.get("media_prefs") or {}),
        )[0]
    )
    return {"ok": True, "ack": "Settings saved."}


# --------------------------------------------------------------------------- #
# Sources
# --------------------------------------------------------------------------- #

@app.get("/api/sources")
def sources() -> dict[str, Any]:
    feed_builder._reload()
    names = feed_builder._source_names
    return {"count": len(names), "sources": [{"source_id": sid, "name": name} for sid, name in sorted(names.items())]}


@app.get("/api/digest")
def digest_info() -> dict[str, Any]:
    latest = _latest_digest_date()
    return {
        "html_url": "/outputs/latest.html" if (OUTPUT_DIR / "latest.html").exists() else None,
        "digest_date": latest,
    }
