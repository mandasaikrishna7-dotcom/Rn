/**
 * Typed API client matching the FastAPI backend in /api (repo root).
 *
 * By default it talks to same-origin `/api` and `/outputs`, which the Next.js
 * dev server proxies to the backend (see next.config.ts). Set
 * NEXT_PUBLIC_API_URL to point elsewhere (e.g. a deployed backend).
 */

import type {
  AckResponse,
  ActionResponse,
  Bootstrap,
  DigestInfo,
  FeedItem,
  FeedResponse,
  ItemAction,
  JourneyResponse,
  MentorsResponse,
  Profile,
  ProgressResponse,
  RunStatus,
  SettingsResponse,
  SourcesResponse,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export const api = {
  bootstrap: () => request<Bootstrap>("/api/bootstrap"),

  feed: (limit = 12, offset = 0, mediaFilter?: string[]) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (mediaFilter?.length) params.set("media_filter", mediaFilter.join(","));
    return request<FeedResponse>(`/api/feed?${params.toString()}`);
  },

  item: (id: string) => request<FeedItem>(`/api/feed/${encodeURIComponent(id)}`),

  itemAction: (id: string, action: ItemAction) =>
    request<ActionResponse>(`/api/items/${encodeURIComponent(id)}/actions`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  journey: () => request<JourneyResponse>("/api/journey"),

  updateProfile: (profile: Partial<Profile>) =>
    request<AckResponse>("/api/profile", { method: "PUT", body: JSON.stringify(profile) }),

  onboard: (profile: Profile) =>
    request<AckResponse>("/api/onboard", { method: "POST", body: JSON.stringify(profile) }),

  mentors: () => request<MentorsResponse>("/api/mentors"),

  progress: () => request<ProgressResponse>("/api/progress"),

  settings: () => request<SettingsResponse>("/api/settings"),

  updateSettings: (payload: {
    focus?: string;
    reduced_texture?: boolean;
    who_now?: string;
    aspirations?: string[];
    habits?: string[];
    media_prefs?: Profile["media_prefs"];
  }) => request<AckResponse>("/api/settings", { method: "PUT", body: JSON.stringify(payload) }),

  runStatus: () => request<RunStatus>("/api/run/status"),

  startRun: () => request<{ status: string; started_at?: string }>("/api/run", { method: "POST" }),

  digest: () => request<DigestInfo>("/api/digest"),

  sources: () => request<SourcesResponse>("/api/sources"),
};
