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
      <SectionHeading sub="A journal of engagement — what you've given time to, and what's shifting. No streaks, no scores.">
        Progress &amp; Reflection
      </SectionHeading>

      {isLoading ? <div className="hard-card h-56 animate-pulse !shadow-none" /> : null}

      {data ? (
        <div className="space-y-6">
          {data.reflection_prompts.length > 0 ? (
            /* The most restrained surface on the site — no mesh, no borders */
            <section className="quiet-quote">
              <p className="mono-label flex items-center gap-2 text-muted">
                <Feather size={14} className="text-magenta" strokeWidth={2.2} /> A quiet prompt
              </p>
              <blockquote className="mt-4">
                &ldquo;{data.reflection_prompts[0]}&rdquo;
              </blockquote>
              <div className="mt-4 space-y-1.5">
                {data.reflection_prompts.slice(1).map((prompt) => (
                  <p key={prompt} className="text-sm text-muted">
                    · {prompt}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mono-label mb-3 text-ink">Engaged over time</h2>
            {data.engaged.length === 0 ? (
              <HardCard mesh className="p-5 text-sm italic text-muted">
                Nothing engaged yet. Save or mark &ldquo;already did this&rdquo; on the feed and it will appear here —
                not as a score, just as a record.
              </HardCard>
            ) : (
              <ul className="space-y-2.5">
                {data.engaged.map((entry) => (
                  <li key={`${entry.item_id}-${entry.at}`}>
                    <Link
                      href={`/item/${entry.item_id}`}
                      className="flex items-start gap-3 border-2 border-ink bg-card px-4 py-3 shadow-[2px_2px_0_#0a0a0f] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0a0a0f]"
                    >
                      {entry.action === "saved" ? (
                        <Bookmark size={15} className="mt-0.5 shrink-0 text-cobalt" />
                      ) : (
                        <Check size={15} className="mt-0.5 shrink-0 text-cobalt" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{entry.title || "Untitled pick"}</span>
                        <span className="text-xs text-muted">
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
            <h2 className="mono-label mb-3 text-ink">Dismissals</h2>
            <HardCard mesh className="flex items-center gap-3 p-4">
              <EyeOff size={16} className="text-magenta" />
              <p className="text-sm text-muted">
                {data.dismissed_count} pick{data.dismissed_count === 1 ? "" : "s"} dismissed — each one is a signal
                about what isn&rsquo;t for you.
              </p>
            </HardCard>
          </section>

          <p className="text-xs italic text-muted">{data.note}</p>
        </div>
      ) : null}
    </div>
  );
}
