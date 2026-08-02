# NextSelf — Frontend

A **blue neo-brutalist** frontend for the NextSelf personal-growth compass: a
void-sidebar compass companion for a personal-growth journey, styled as a
hard-edged field journal (void/cobalt/halftone/magenta tokens, hard borders + flat shadows, comic mesh accents).
Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**,
React Query for server state, Lucide for line icons.

## Running it

Two processes, both on this machine:

```bash
# 1. Backend (repo root) — FastAPI wrapper around the pipeline
cd ..
.venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 2. Frontend
cd web
npm install
npm run dev            # http://localhost:3000
```

`next.config.ts` proxies `/api/*` and `/outputs/*` to `http://127.0.0.1:8000`,
so no extra config is needed. To point at a deployed backend, set
`NEXT_PUBLIC_API_URL`.

On first load you'll be sent to `/onboarding` ("Draw your compass") — the
single-user session gate. Confirm the summary card to reach the feed.

## What the backend is

The repo has **no HTTP API of its own** — it was a CLI pipeline
(`run_pipeline.py`). A minimal **FastAPI layer was added at `/backend`
(repo root)** which:

- serves real pipeline artifacts (`outputs/intermediate/*.json`) as a feed,
- adds a tiny single-user state store (`outputs/user_state/state.json`) for
  profile, journey revisions, item actions, and settings,
- runs the real pipeline as a background subprocess (`POST /api/run`),
- mounts `outputs/` statically at `/outputs`.

## API endpoints (all `/api/*`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/bootstrap` | onboarding state, profile, settings, "moment in journey" |
| GET | `/feed?limit&offset&media_filter` | curated feed from pipeline clusters |
| GET | `/feed/{id}` | item detail + members + related |
| POST | `/items/{id}/actions` | `saved \| dismissed \| done \| more_like_this` |
| GET/PUT | `/profile` | read / edit the seed profile |
| POST | `/onboard` | confirm onboarding (records first journey entry) |
| GET | `/journey` | profile + revision timeline |
| GET | `/mentors` | curated catalog matched to profile (connect stubbed) |
| GET | `/progress` | engagement log + reflection prompts |
| GET/PUT | `/settings` | goals/habits, media prefs, focus, texture toggle |
| POST/GET | `/run`, `/run/status` | trigger pipeline run / poll status |
| GET | `/digest`, `/sources` | digest link + source names |

## Real vs stubbed — be honest about it

| Feature | Status | Source |
| --- | --- | --- |
| Feed items, detail, "why this pick" | ✅ **Real** | pipeline `clustered_items.json` + `scored_items.json` (rationales are LLM output when scoring succeeded, else a clearly-labeled heuristic rationale; the feed strips model disclaimers and source boilerplate) |
| Media-type filter on feed | ✅ **Real** | preference stored in state × item metadata (article/paper/video) |
| Profile / journey history / actions / settings | ✅ **Real** | new `outputs/user_state/state.json` store |
| "Run curation" (pipeline trigger) | ✅ **Real** | subprocess of `run_pipeline.py` |
| Mentors & Experiences | ✅ **Real** (partial) | curated seed catalog matched to profile; connect/booking still stubbed |
| "How Your Compass Has Turned" (Journey timeline) | ✅ **Real** | revision history with before/after deltas from user state |
| Per-user personalized curation | 🟠 **Partial** | the pipeline curates the same feed for everyone; profile edits persist and are acknowledged but don't re-rank picks yet |
| Onboarding → feed "shaping" | 🟠 **Acknowledgment only** | profile edits save and are acknowledged ("next picks will be shaped by this") — no live re-training |

## Neo-brutalist component library

**Tokens** (`app/globals.css`): `--void #0B1340` (sidebar), `--cobalt #2A52F5`
(primary accent), `--halftone-cyan #00C2D1` (secondary, focus rings),
`--spider-magenta #FF2D78` (signature accents only: focus-banner diamond,
glitch edges, empty states, milestones), `--paper #F3F5FB` (page bg),
`--ink #0A0A0F` (borders, shadows, headlines), `--cobalt-dark #1B3ACC`
(text-on-white AA). Type: Archivo Black (display) / Space Grotesk (body) /
JetBrains Mono (utility labels). Spacing scale: 4/8/12/16/24/32/48/64/96.

**Rules:** 0px radius on structural elements (round only avatars + diamond),
2px ink borders everywhere, hard shadows `4px 4px 0 ink` (cards) and
`2px 2px 0 ink` (buttons), press-state collapses shadow and shifts.
Halftone mesh is rare (focus banner, empty states, milestone markers,
mentor placeholders). Magenta glitch (120ms) only on primary CTAs and the
focus banner. Comic `angle-divider` rules max 1–2 per page.

| Component | Use | Notes |
| --- | --- | --- |
| `AppSidebar` | nav rail (desktop / mobile bottom bar) | void fill, 3px ink rail, single 48px row height + active border |
| `FocusBanner` | sticky top context bar on every page | the one comic/mesh banner; sits at y=0 — content starts 32px below |
| `HardCard` | page-level cards | white, 2px ink border, 4px shadow; `dashed`/`mesh` variants for placeholders/empty states |
| `PrimaryButton` / `OutlineButton` | confirm / secondary actions | cobalt fill + glitch (primary), press collapse |
| `StepDots` | onboarding progress | square hard steps |
| `TypeBadge` | feed item type (Article/Paper/Video) | void bg, white text, halftone icon |
| `Toggle` | media prefs + reduced-texture | square hard switch |
| `StringListEditor` | aspirations/habits lists | ink chips with add/remove |
| `MediaPrefsPicker` | media preferences | hard rows with real backend effect |
| `BackendGap` | backend-gap banners (replaces StubNote) | mono callout, halftone-cyan tint, 2px ink border |
| `FeedCard` | feed items | mono meta strip, collapsed "why this pick", 4 equal-width actions |

Texture surfaces are CSS only (radial-gradient halftone, CSS grain,
hard shadows) — no image assets, no 3D libraries. **Reduced-texture mode**
(Settings) strips grain/mesh/glitch via `html[data-texture="reduced"]`.

## Design constraints honored

- No streaks, points, badges, or leaderboards (Progress is a quiet journal).
- Bounded feed with an explicit "Load more" — no infinite scroll.
- No auth: single-user session guard (`/onboarding` gate).
- Motion is subtle (cards settle, page turns slide/fade) and respects
  `prefers-reduced-motion`.
- Focus ring: 3px halftone offset 3px on every interactive element.
