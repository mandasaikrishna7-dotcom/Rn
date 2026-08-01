"use client";

import { BookOpen, Video, Headphones, Users } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import type { MediaPrefs } from "@/lib/types";

const MEDIA_OPTIONS: { key: keyof MediaPrefs; label: string; hint: string; Icon: typeof BookOpen }[] = [
  { key: "reading", label: "Reading", hint: "Articles & research papers", Icon: BookOpen },
  { key: "video", label: "Video", hint: "Talks & deep-dives", Icon: Video },
  { key: "audio", label: "Audio", hint: "Podcasts & audio notes", Icon: Headphones },
  { key: "in_person", label: "In person", hint: "Events, communities, challenges", Icon: Users },
];

/**
 * Media-type preference picker. Real effect: the backend filters the feed
 * by the media types you enable (metadata-based, no pretending).
 */
export function MediaPrefsPicker({
  prefs,
  onChange,
}: {
  prefs: MediaPrefs;
  onChange: (next: MediaPrefs) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MEDIA_OPTIONS.map(({ key, label, hint, Icon }) => (
        <div
          key={key}
          className="flex items-center justify-between gap-3 border-2 border-ink bg-card px-4 py-3 shadow-[2px_2px_0_#0a0a0f]"
        >
          <div className="flex items-center gap-3">
            <Icon size={18} className="text-cobalt" strokeWidth={2} />
            <div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="mono-label mt-0.5 !text-[10px] !tracking-[0.06em] text-muted">{hint}</p>
            </div>
          </div>
          <Toggle
            checked={prefs[key]}
            onChange={(next) => onChange({ ...prefs, [key]: next })}
            label={`${label} preference`}
          />
        </div>
      ))}
    </div>
  );
}
