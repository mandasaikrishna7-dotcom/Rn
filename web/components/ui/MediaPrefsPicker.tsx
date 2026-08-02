"use client";

import { BookOpen, Video, Headphones, Users } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";
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
  light = false,
}: {
  prefs: MediaPrefs;
  onChange: (next: MediaPrefs) => void;
  light?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MEDIA_OPTIONS.map(({ key, label, hint, Icon }) => (
        <div
          key={key}
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-colors",
            light
              ? "border border-neutral-200 bg-white shadow-xs hover:border-neutral-300"
              : "border border-white/10 bg-card hover:border-white/20",
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} className={light ? "text-neutral-700" : "text-white/80"} strokeWidth={1.8} />
            <div>
              <p className={cn("text-sm font-medium", light ? "text-neutral-900" : "text-white")}>{label}</p>
              <p className={cn("mono-label mt-0.5 text-[11px]", light ? "text-neutral-500" : "text-muted")}>{hint}</p>
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
