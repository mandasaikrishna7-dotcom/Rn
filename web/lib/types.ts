export type MediaPrefs = {
  reading: boolean;
  video: boolean;
  audio: boolean;
  in_person: boolean;
};

export type Profile = {
  who_now: string;
  aspirations: string[];
  habits: string[];
  media_prefs: MediaPrefs;
};

export type Moment = {
  focus: string;
  label: string;
  digest_date: string | null;
  note: string;
};

export type Settings = {
  focus: string;
  reduced_texture: boolean;
};

export type Bootstrap = {
  onboarded: boolean;
  profile: Profile;
  settings: Settings;
  moment: Moment;
};

export type Score = {
  mean_relevance: number;
  mean_importance: number;
  mean_novelty: number;
  mean_trust: number;
  mean_composed: number;
};

export type FeedItemMember = {
  id: string;
  title: string;
  summary: string;
  link: string | null;
  scores: Record<string, number>;
  rationale: string;
};

export type FeedItem = {
  id: string;
  title: string;
  summary: string;
  full_summary: string;
  links: string[];
  media_type: "article" | "paper" | "video";
  sources: string[];
  score: Score;
  rationale: string;
  published_date: string | null;
  member_count: number;
  stub: boolean;
  members?: FeedItemMember[];
  related?: FeedItem[];
  actions_history?: { item_id: string; action: string; title: string; at: string }[];
};

export type FeedResponse = {
  items: FeedItem[];
  limit: number;
  offset: number;
  count: number;
  media_filter_applied: string[];
  note: string | null;
};

export type ItemAction = "saved" | "dismissed" | "done" | "more_like_this";

export type ActionResponse = {
  ok: boolean;
  action: ItemAction;
  ack: string;
};

export type AckResponse = {
  ok: boolean;
  ack: string;
};

export type JourneyChanges = {
  who_now?: { before: string; after: string };
  aspirations?: { added: string[]; removed: string[] };
  habits?: { added: string[]; removed: string[] };
};

export type JourneyEntry = {
  date: string;
  note: string;
  snapshot: {
    who_now: string;
    aspirations: string[];
    habits: string[];
  };
  changes?: JourneyChanges | null;
};

export type JourneyResponse = {
  journey: JourneyEntry[];
  profile: Profile;
};

export type Mentor = {
  id: string;
  kind: "person" | "community" | "event";
  name: string;
  focus_area: string;
  context: string;
  why: string;
  stub: boolean;
};

export type MentorsResponse = {
  stub: boolean;
  note: string | null;
  contact_stub: boolean;
  contact_note: string;
  items: Mentor[];
};

export type EngagedItem = {
  item_id: string;
  action: string;
  title: string;
  at: string;
};

export type ProgressResponse = {
  engaged: EngagedItem[];
  dismissed_count: number;
  reflection_prompts: string[];
  note: string;
};

export type SettingsResponse = {
  profile: Profile;
  settings: Settings;
  feedback_history: EngagedItem[];
};

export type RunStatus = {
  running: boolean;
  started_at: string | null;
  finished_at: string | null;
  exit_code: number | null;
};

export type DigestInfo = {
  html_url: string | null;
  digest_date: string | null;
};

export type SourcesResponse = {
  count: number;
  sources: { source_id: string; name: string }[];
};
