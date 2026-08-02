"use client";

import Link from "next/link";
import { Bookmark, Check, EyeOff, Feather } from "lucide-react";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useProgress } from "@/hooks/useApi";
import { formatDate } from "@/lib/utils";

export default function ProgressPage() {
  const { data, isLoading } = useProgress();

  return (
    <div>
      <SectionHeading sub="Log of your engagement over time. No streaks or scores.">
        Progress and reflection
      </SectionHeading>

      {isLoading ? <div className="h-56 animate-pulse rounded-2xl border border-white/10 bg-card" /> : null}

      {data ? (
        <div className="space-y-8">
          {data.reflection_prompts.length > 0 ? (
            /* Restrained editorial quote surface */
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
              <p className="mono-label flex items-center gap-2 text-amber-700 text-xs font-semibold">
                <Feather size={14} strokeWidth={1.8} /> Quiet reflection prompt
              </p>
              <blockquote className="mt-4 font-serif text-xl md:text-2xl text-neutral-900 font-normal leading-relaxed italic">
                &ldquo;{data.reflection_prompts[0]}&rdquo;
              </blockquote>
              <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                {data.reflection_prompts.slice(1).map((prompt) => (
                  <p key={prompt} className="text-xs text-neutral-600 leading-relaxed">
                    · {prompt}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mono-label mb-3 text-neutral-500">Engaged over time</h2>
            {data.engaged.length === 0 ? (
              <HardCard className="p-5 text-sm italic text-neutral-500">
                Nothing engaged yet. Save or mark &ldquo;already did this&rdquo; on the feed and it will appear here —
                not as a score, just as a record.
              </HardCard>
            ) : (
              <ul className="space-y-2.5">
                {data.engaged.map((entry) => (
                  <li key={`${entry.item_id}-${entry.at}`}>
                    <Link
                      href={`/item/${entry.item_id}`}
                      className="flex items-start gap-3.5 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:bg-neutral-50 shadow-xs"
                    >
                      {entry.action === "saved" ? (
                        <Bookmark size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      ) : (
                        <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-neutral-900">{entry.title || "Untitled pick"}</span>
                        <span className="text-xs text-neutral-500">
                          {entry.action === "saved" ? "Saved for later" : "Marked as engaged"} · {formatDate(entry.at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mono-label mb-3 text-neutral-500">Dismissals</h2>
            <HardCard className="flex items-center gap-3 p-4">
              <EyeOff size={16} className="text-neutral-500" />
              <p className="text-sm text-neutral-700">
                {data.dismissed_count} pick{data.dismissed_count === 1 ? "" : "s"} dismissed — each one is a signal
                about what isn&rsquo;t for you.
              </p>
            </HardCard>
          </section>

          <p className="text-xs italic text-neutral-500">{data.note}</p>
        </div>
      ) : null}
    </div>
  );
}
