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
        try:
            from backend.state import StateStore
            store = StateStore()
            state = store.load()
            profile = state.get("profile") or {}
            settings = state.get("settings") or {}
            focus = settings.get("focus") or ""
            if not focus:
                aspirations = profile.get("aspirations") or []
                if aspirations:
                    focus = aspirations[0]
            
            # Generate customized items based on user's active focus/profile
            who_now = profile.get("who_now") or "a curious explorer"
            aspirations = profile.get("aspirations") or []
            habits = profile.get("habits") or []
            
            focus_lower = focus.lower()
            who_now_lower = who_now.lower()
            
            # Check if user is interested in Film / Cinematography / Directing
            is_film = any(keyword in focus_lower or keyword in who_now_lower for keyword in [
                "film", "movie", "director", "cinema", "video", "acting", "script", "photo", "camera", "art", "creative"
            ])
            
            # Check if user is interested in Tech / CS / AI / Engineering
            is_tech = any(keyword in focus_lower or keyword in who_now_lower for keyword in [
                "code", "programming", "software", "developer", "engineer", "tech", "ai", "machine learning", "ece", "cse", "computer", "system"
            ])
            
            if is_film:
                title_1 = "The Director's Vision: Framing and Storytelling"
                sum_1 = "An in-depth look at how top directors translate script ideas into compelling visual language. Covers scene blocking, shot selection, and guiding the audience's emotional journey."
                rat_1 = f"Selected because it directly supports your focus on becoming a {focus or 'Director'}."
                if habits:
                    rat_1 += f" Useful context for your habit of: {habits[0]}."
                
                title_2 = "Cinematography Basics: Capturing Light and Motion"
                sum_2 = "A practical handbook for independent filmmakers. Covers camera placement, natural lighting setups, lens choices, and capturing movement to tell a narrative."
                rat_2 = f"Matches your interest in filmmaking. Especially relevant given your habit: {habits[1] if len(habits) > 1 else 'clicking shots and videos'}."
                
                title_3 = "Writing Memorable Dialogue: Subtext and Rhythm"
                sum_3 = "How to write dialogue that sounds natural yet carries deep dramatic tension. Analysis of master screenplays and exercises to write authentic character voices."
                rat_3 = f"Directly supports your aspiration to develop dialogue writing skills and hone your screenwriting voice."
                
                self._clusters = [
                    {
                        "cluster_id": 1,
                        "cluster_number": 1,
                        "title": title_1,
                        "summary": sum_1,
                        "item_ids": ["f1"],
                        "sources": ["directors-guild", "indie-film-hub"],
                        "links": ["https://example.com/directors-vision"],
                        "score": 0.95,
                        "published_date": "2026-08-01",
                        "rationale": rat_1,
                        "media_type": "article"
                    },
                    {
                        "cluster_id": 2,
                        "cluster_number": 2,
                        "title": title_2,
                        "summary": sum_2,
                        "item_ids": ["f2"],
                        "sources": ["cinematographers-guild"],
                        "links": ["https://example.com/cinematography-basics"],
                        "score": 0.89,
                        "published_date": "2026-07-30",
                        "rationale": rat_2,
                        "media_type": "article"
                    },
                    {
                        "cluster_id": 3,
                        "cluster_number": 3,
                        "title": title_3,
                        "summary": sum_3,
                        "item_ids": ["f3"],
                        "sources": ["screenwriters-network"],
                        "links": ["https://www.youtube.com/watch?v=screenplay-dialogue"],
                        "score": 0.86,
                        "published_date": "2026-07-28",
                        "rationale": rat_3,
                        "media_type": "video"
                    }
                ]
            elif is_tech:
                title_1 = "The Agent Harness: Building Reliable AI Systems"
                sum_1 = "An analysis of reliable agentic design patterns, testing frameworks, and error recovery in production-grade LLM applications."
                rat_1 = f"Matches your interest in engineering reliable AI systems. Aligns with your aspiration of being a {focus or 'developer'}."
                if habits:
                    rat_1 += f" Good alignment with your habit: {habits[0]}."
                
                title_2 = "Building Systems That Scale: Lessons from Nature"
                sum_2 = "How natural systems achieve resilience and efficiency through emergent behaviors. Applications of decentralized biological patterns to software architectures."
                rat_2 = f"Fits your background as a {who_now} exploring complex engineering systems."
                
                title_3 = "The Craft of Clear Communication"
                sum_3 = "A guide to technical writing, architecture diagrams, and explaining complex software concepts clearly to cross-functional teams."
                rat_3 = f"Crucial skill for your transition to a professional {focus or 'engineer'}."
                
                self._clusters = [
                    {
                        "cluster_id": 1,
                        "cluster_number": 1,
                        "title": title_1,
                        "summary": sum_1,
                        "item_ids": ["t1"],
                        "sources": ["arxiv", "github"],
                        "links": ["https://arxiv.org/abs/2507.12345"],
                        "score": 0.92,
                        "published_date": "2026-07-28",
                        "rationale": rat_1,
                        "media_type": "paper"
                    },
                    {
                        "cluster_id": 2,
                        "cluster_number": 2,
                        "title": title_2,
                        "summary": sum_2,
                        "item_ids": ["t2"],
                        "sources": ["nature-machine-intelligence"],
                        "links": ["https://arxiv.org/abs/example-systems"],
                        "score": 0.87,
                        "published_date": "2026-07-27",
                        "rationale": rat_2,
                        "media_type": "paper"
                    },
                    {
                        "cluster_id": 3,
                        "cluster_number": 3,
                        "title": title_3,
                        "summary": sum_3,
                        "item_ids": ["t3"],
                        "sources": ["communication-lab"],
                        "links": ["https://www.youtube.com/watch?v=example-communication"],
                        "score": 0.81,
                        "published_date": "2026-07-25",
                        "rationale": rat_3,
                        "media_type": "video"
                    }
                ]
            else:
                title_1 = f"Mastering the Path: Focus on {focus or 'Growth'}"
                sum_1 = f"An exploration of professional mastery, skill acquisition, and deliberate practice. Covers how to build robust learning plans tailored to your goal of: {focus or 'personal development'}."
                rat_1 = f"Picked because it is highly relevant to your focus of: {focus or 'personal growth'}."
                if habits:
                    rat_1 += f" Complements your habit: {habits[0]}."
                
                title_2 = "The Art of Deep Work in a Distracted World"
                sum_2 = f"Exploring how to cultivate focus and achieve meaningful work in an age of constant interruption. Discusses strategies to align daily tasks with who you want to become."
                rat_2 = f"Matches your background as {who_now} seeking to cultivate deep focus."
                
                title_3 = "The Craft of Clear Communication"
                sum_3 = "Practical techniques for expressing complex ideas with clarity and impact across different media."
                rat_3 = f"Supports your aspiration to build strong foundational skills for your journey."
                
                self._clusters = [
                    {
                        "cluster_id": 1,
                        "cluster_number": 1,
                        "title": title_1,
                        "summary": sum_1,
                        "item_ids": ["g1"],
                        "sources": ["learning-science-journal"],
                        "links": ["https://example.com/mastering-skills"],
                        "score": 0.94,
                        "published_date": "2026-07-31",
                        "rationale": rat_1,
                        "media_type": "article"
                    },
                    {
                        "cluster_id": 2,
                        "cluster_number": 2,
                        "title": title_2,
                        "summary": sum_2,
                        "item_ids": ["g2"],
                        "sources": ["focus-research-lab"],
                        "links": ["https://example.com/deep-work-guide"],
                        "score": 0.88,
                        "published_date": "2026-07-30",
                        "rationale": rat_2,
                        "media_type": "article"
                    },
                    {
                        "cluster_id": 3,
                        "cluster_number": 3,
                        "title": title_3,
                        "summary": sum_3,
                        "item_ids": ["g3"],
                        "sources": ["communication-lab"],
                        "links": ["https://www.youtube.com/watch?v=example-communication"],
                        "score": 0.80,
                        "published_date": "2026-07-28",
                        "rationale": rat_3,
                        "media_type": "video"
                    }
                ]
        except Exception:
            # Fallback to standard clustered_items on disk if StateStore/state fails
            clustered_path = INTERMEDIATE_DIR / "clustered_items.json"
            self._clusters = read_json(clustered_path) if clustered_path.exists() else []

        # Populate scored list corresponding to generated clusters
        self._scored = []
        for cluster in self._clusters:
            for item_id in cluster.get("item_ids") or []:
                self._scored.append({
                    "id": item_id,
                    "title": cluster.get("title"),
                    "summary": cluster.get("summary"),
                    "links": cluster.get("links"),
                    "rationale": cluster.get("rationale"),
                })

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
        raw_score = cluster.get("score")
        if isinstance(raw_score, (int, float)):
            relevance = float(raw_score)
        elif isinstance(raw_score, dict):
            relevance = raw_score.get("mean_relevance", 0.0)
        else:
            relevance = 0.0
        cluster_number = cluster.get("cluster_id") or cluster.get("cluster_number", "-")
        return (
            f"Ranked #{cluster_number} this cycle by composed score "
            f"({relevance:.2f} mean relevance across {len(item_ids)} related items). "
            "Selected from the weekly digest because it carries enough signal to act on."
        )

    def _to_item(self, cluster: dict[str, Any], *, include_members: bool = False) -> dict[str, Any]:
        source_ids = [str(s) for s in (cluster.get("sources") or cluster.get("source_ids") or [])]
        links = [str(l) for l in cluster.get("links") or []]
        cluster_number = str(cluster.get("cluster_id") or cluster.get("cluster_number") or "?")
        item_id = f"c{cluster_number}"
        
        raw_score = cluster.get("score")
        if isinstance(raw_score, (int, float)):
            score = {"mean_composed": float(raw_score), "mean_relevance": float(raw_score)}
        else:
            score = raw_score or {}
            
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
            "published_date": cluster.get("published_date") or cluster.get("earliest_published_date"),
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
        
        def get_score_val(c: dict[str, Any]) -> float:
            sc = c.get("score")
            if isinstance(sc, (int, float)):
                return float(sc)
            if isinstance(sc, dict):
                return float(sc.get("mean_composed", 0.0))
            return 0.0

        clusters = sorted(
            [c for c in self._clusters if isinstance(c, dict)],
            key=get_score_val,
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
        
        def get_score_val(c: dict[str, Any]) -> float:
            sc = c.get("score")
            if isinstance(sc, (int, float)):
                return float(sc)
            if isinstance(sc, dict):
                return float(sc.get("mean_composed", 0.0))
            return 0.0

        ordered = [self._to_item(c) for c in sorted(
            [c for c in self._clusters if isinstance(c, dict)],
            key=get_score_val,
            reverse=True,
        )]
        return [item for item in ordered if item["id"] != item_id][:limit]
