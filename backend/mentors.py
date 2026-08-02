
"""Curated mentors & experiences matched to the user's profile.

Data source: static seed catalog (backend/data/mentors_catalog.json).
Recommendations are real curated records, ranked by overlap with the user's
aspirations, focus, and stated identity — not live people search or booking.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from config.settings import BASE_DIR

CATALOG_PATH = BASE_DIR / "backend" / "data" / "mentors_catalog.json"
MAX_RESULTS = 6


def _load_catalog() -> list[dict[str, Any]]:
    if not CATALOG_PATH.exists():
        return []
    try:
        payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    return payload if isinstance(payload, list) else []


def _tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {word for word in words if len(word) >= 3}


def _profile_keywords(profile: dict[str, Any], settings: dict[str, Any]) -> set[str]:
    parts: list[str] = []
    parts.append(profile.get("who_now") or "")
    parts.extend(profile.get("aspirations") or [])
    parts.extend(profile.get("habits") or [])
    focus = settings.get("focus") or ""
    if focus:
        parts.append(focus)
    tokens: set[str] = set()
    for part in parts:
        tokens |= _tokenize(str(part))
    return tokens


def _score_entry(entry: dict[str, Any], keywords: set[str]) -> int:
    tags = {tag.lower() for tag in entry.get("focus_tags") or []}
    if not keywords:
        return 0
    overlap = keywords & tags
    partial = sum(1 for kw in keywords for tag in tags if kw in tag or tag in kw)
    return len(overlap) * 3 + partial


def _build_why(entry: dict[str, Any], score: int, has_keywords: bool) -> str:
    template = entry.get("why_template") or entry.get("context") or ""
    if score > 0 and has_keywords:
        return template
    return (
        f"{template} (Broad match — add more specific aspirations on Journey "
        "to sharpen these picks.)"
        if template
        else "Curated pick from the seed catalog."
    )


def list_mentors(profile: dict[str, Any], settings: dict[str, Any] | None = None) -> dict[str, Any]:
    catalog = _load_catalog()
    if not catalog:
        return {
            "stub": True,
            "note": "Mentor catalog file is missing or empty.",
            "contact_stub": True,
            "contact_note": "Connect and booking are not wired yet.",
            "items": [],
        }
    settings = settings or {}
    keywords = _profile_keywords(profile, settings)
    has_keywords = bool(keywords)

    scored: list[tuple[int, dict[str, Any]]] = []
    for entry in catalog:
        score = _score_entry(entry, keywords)
        scored.append((score, entry))

    scored.sort(key=lambda pair: pair[0], reverse=True)

    if has_keywords and scored and scored[0][0] > 0:
        selected = [entry for score, entry in scored if score > 0][:MAX_RESULTS]
        note = (
            f"Matched {len(selected)} curated pick(s) to your stated focus "
            f"({len(keywords)} keyword(s) from profile)."
        )
    else:
        # Diverse fallback when profile is sparse — still real catalog entries.
        kinds_seen: set[str] = set()
        selected: list[dict[str, Any]] = []
        for _score, entry in scored:
            kind = entry.get("kind") or "person"
            if kind in kinds_seen and len(selected) >= 3:
                continue
            selected.append(entry)
            kinds_seen.add(kind)
            if len(selected) >= MAX_RESULTS:
                break
        if len(selected) < 3:
            selected = [entry for _score, entry in scored[:MAX_RESULTS]]
        note = (
            "Showing a diverse sample from the curated catalog — add aspirations on "
            "Journey to get sharper matches."
        )

    items = []
    for entry in selected:
        score = _score_entry(entry, keywords)
        items.append(
            {
                "id": entry["id"],
                "kind": entry.get("kind", "person"),
                "name": entry["name"],
                "focus_area": entry.get("focus_area") or "Growth",
                "context": entry.get("context") or "",
                "why": _build_why(entry, score, has_keywords),
                "stub": False,
            }
        )

    return {
        "stub": False,
        "note": note,
        "contact_stub": True,
        "contact_note": "Connect and booking are not wired yet — matches are curated, not live scheduling.",
        "items": items,
    }
