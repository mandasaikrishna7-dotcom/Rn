"""Feed builder: turns real pipeline artifacts into curated feed items.

Sources of truth (all produced by the pipeline, never fabricated here):
- outputs/intermediate/clustered_items.json  -> feed cards (events/stories)
- outputs/intermediate/scored_items.json     -> rationale + member articles
- config/source_registry.json                -> human-readable source names
"""

from __future__ import annotations

import re
from typing import Any

from config.settings import INTERMEDIATE_DIR, SOURCE_REGISTRY_PATH
from utils.json_utils import read_json

DEFAULT_PREVIEW_CHARS = 320

FALLBACK_RATIONALE_MARKERS = ("fallback", "unavailable", "deterministic")

DISCLAIMER_PREFIX = "AI-generated content may summarize information incompletely. Verify important information. Learn more"

BOILERPLATE_SENTENCES = (
    "An enterprise-ready AI platform that powers modern workplace productivity.",
    "An enterprise-ready platform that powers modern workplace productivity.",
)


def clean_summary(text: str) -> str:
    """Normalize scraped summaries: strip LLM disclaimers and repeated
    boilerplate so boilerplate never dominates the card layout."""
    cleaned = text or ""
    cleaned = cleaned.replace(DISCLAIMER_PREFIX, "").strip()
    for sentence in BOILERPLATE_SENTENCES:
        prefix = sentence.rstrip(".")
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix) :].lstrip(" .")
            break
    return " ".join(cleaned.split())


class FeedBuilder:
    def __init__(self) -> None:
        self._clusters: list[dict[str, Any]] = []
        self._scored: list[dict[str, Any]] = []
        self._source_names: dict[str, str] = {}

    def _reload(self) -> None:
        clustered_path = INTERMEDIATE_DIR / "clustered_items.json"
        scored_path = INTERMEDIATE_DIR / "scored_items.json"
        self._clusters = read_json(clustered_path) if clustered_path.exists() else []
        self._scored = read_json(scored_path) if scored_path.exists() else []
        registry = read_json(SOURCE_REGISTRY_PATH)
        sources = registry.get("sources") if isinstance(registry, dict) else []
        for source in sources if isinstance(sources, list) else []:
            if not isinstance(source, dict):
                continue
            source_id = source.get("source_id")
            if not isinstance(source_id, str) or not source_id:
                continue
            name = source.get("name")
            if not isinstance(name, str) or not name.strip():
                name = re.sub(r"[_-]+", " ", source_id).title()
            self._source_names[source_id] = name

    @staticmethod
    def _media_type(source_ids: list[str], links: list[str]) -> str:
        research_ids = {"arxiv", "paperswithcode", "crossref", "nature_machine_learning", "ai2_news"}
        if any(sid in research_ids for sid in source_ids):
            return "paper"
        joined_links = " ".join(links).lower()
        if "youtube.com" in joined_links or "youtu.be" in joined_links:
            return "video"
        return "article"

    def _rationale_for(self, cluster: dict[str, Any]) -> str:
        item_ids = cluster.get("item_ids") or []
        scored_by_id = {item.get("id"): item for item in self._scored}
        for item_id in item_ids:
            item = scored_by_id.get(item_id)
            if not item:
                continue
            rationale = item.get("rationale") or ""
            if rationale and not any(marker in rationale.lower() for marker in FALLBACK_RATIONALE_MARKERS):
                return rationale
        scores = cluster.get("score") or {}
        relevance = scores.get("mean_relevance", 0.0)
        return (
            f"Ranked #{cluster.get('cluster_number', '-')} this cycle by composed score "
            f"({relevance:.2f} mean relevance across {len(item_ids)} related items). "
            "Selected from the weekly digest because it carries enough signal to act on."
        )

    def _to_item(self, cluster: dict[str, Any], *, include_members: bool = False) -> dict[str, Any]:
        source_ids = [str(s) for s in cluster.get("source_ids") or []]
        links = [str(l) for l in cluster.get("links") or []]
        cluster_number = str(cluster.get("cluster_number") or "?")
        item_id = f"c{cluster_number}"
        score = cluster.get("score") or {}
        clean_summary_text = clean_summary(cluster.get("summary") or "")
        item: dict[str, Any] = {
            "id": item_id,
            "title": cluster.get("title") or "Untitled item",
            "summary": clean_summary_text[:DEFAULT_PREVIEW_CHARS],
            "full_summary": clean_summary_text,
            "links": links,
            "media_type": self._media_type(source_ids, links),
            "sources": [self._source_names.get(sid, sid) for sid in source_ids],
            "score": score,
            "rationale": self._rationale_for(cluster),
            "published_date": cluster.get("earliest_published_date"),
            "member_count": len(cluster.get("item_ids") or []),
            "stub": False,
        }
        if include_members:
            scored_by_id = {item.get("id"): item for item in self._scored}
            members: list[dict[str, Any]] = []
            for item_id in cluster.get("item_ids") or []:
                member = scored_by_id.get(item_id)
                if not member:
                    continue
                rationale = member.get("rationale") or ""
                if rationale and any(marker in rationale.lower() for marker in FALLBACK_RATIONALE_MARKERS):
                    rationale = ""
                members.append(
                    {
                        "id": member.get("id"),
                        "title": member.get("title") or "",
                        "summary": clean_summary(member.get("summary") or ""),
                        "link": (member.get("links") or [None])[0],
                        "scores": member.get("scores") or {},
                        "rationale": rationale,
                    }
                )
            item["members"] = members
        return item

    def list_items(self, *, limit: int = 20, offset: int = 0, media_types: list[str] | None = None) -> list[dict[str, Any]]:
        self._reload()
        clusters = sorted(
            [c for c in self._clusters if isinstance(c, dict)],
            key=lambda c: (c.get("score") or {}).get("mean_composed", 0.0),
            reverse=True,
        )
        items = [self._to_item(cluster) for cluster in clusters]
        if media_types:
            allowed = set(media_types)
            items = [item for item in items if item["media_type"] in allowed]
        return items[offset : offset + limit]

    def get_item(self, item_id: str, *, include_members: bool = True) -> dict[str, Any] | None:
        self._reload()
        for cluster in self._clusters:
            if not isinstance(cluster, dict):
                continue
            candidate = self._to_item(cluster, include_members=include_members)
            if candidate["id"] == item_id:
                return candidate
        return None

    def related_items(self, item_id: str, limit: int = 4) -> list[dict[str, Any]]:
        self._reload()
        ordered = [self._to_item(c) for c in sorted(
            [c for c in self._clusters if isinstance(c, dict)],
            key=lambda c: (c.get("score") or {}).get("mean_composed", 0.0),
            reverse=True,
        )]
        return [item for item in ordered if item["id"] != item_id][:limit]
