"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { HardCard } from "@/components/ui/HardCard";
import { resolveEntryChanges } from "@/lib/journeyDelta";
import { cn, formatDate } from "@/lib/utils";
import type { JourneyChanges, JourneyEntry } from "@/lib/types";

function DeltaBlock({ changes }: { changes: JourneyChanges }) {
  return (
    <div className="space-y-4 text-xs leading-relaxed text-muted">
      {changes.who_now ? (
        <div>
          <p className="mono-label mb-2 text-ink">Who I am now</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="border border-magenta/25 bg-magenta/5 p-3 font-sans text-muted/80 line-through shadow-[1px_1px_0_var(--color-magenta)]">
              {changes.who_now.before || "(empty)"}
            </div>
            <div className="border border-orb-core/30 bg-orb-core/5 p-3 font-sans text-ink font-medium shadow-[1px_1px_0_var(--color-orb-core)]">
              {changes.who_now.after || "(empty)"}
            </div>
          </div>
        </div>
      ) : null}

      {changes.aspirations ? (
        <div>
          <p className="mono-label mb-2 text-ink">Who I&rsquo;m becoming</p>
          <div className="flex flex-wrap gap-2">
            {changes.aspirations.added.map((item, idx) => (
              <span
                key={`add-asp-${idx}`}
                className="inline-flex items-center gap-1 border border-orb-core/30 bg-orb-core/5 px-2.5 py-1 font-sans text-xs text-orb-core shadow-[1px_1px_0_var(--color-orb-core)]"
              >
                + {item}
              </span>
            ))}
            {changes.aspirations.removed.map((item, idx) => (
              <span
                key={`rem-asp-${idx}`}
                className="inline-flex items-center gap-1 border border-magenta/25 bg-magenta/5 px-2.5 py-1 font-sans text-xs text-magenta/70 line-through shadow-[1px_1px_0_var(--color-magenta)]"
              >
                - {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {changes.habits ? (
        <div>
          <p className="mono-label mb-2 text-ink">Habits in motion</p>
          <div className="flex flex-wrap gap-2">
            {changes.habits.added.map((item, idx) => (
              <span
                key={`add-hab-${idx}`}
                className="inline-flex items-center gap-1 border border-orb-core/30 bg-orb-core/5 px-2.5 py-1 font-sans text-xs text-orb-core shadow-[1px_1px_0_var(--color-orb-core)]"
              >
                + {item}
              </span>
            ))}
            {changes.habits.removed.map((item, idx) => (
              <span
                key={`rem-hab-${idx}`}
                className="inline-flex items-center gap-1 border border-magenta/25 bg-magenta/5 px-2.5 py-1 font-sans text-xs text-magenta/70 line-through shadow-[1px_1px_0_var(--color-magenta)]"
              >
                - {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TimelineEntry({
  entry,
  index,
  journey,
  milestone,
}: {
  entry: JourneyEntry;
  index: number;
  journey: JourneyEntry[];
  milestone: boolean;
}) {
  const [open, setOpen] = useState(index === journey.length - 1);
  const changes = resolveEntryChanges(entry, index, journey);
  const isOnboarding = index === 0;

  return (
    <li className={cn("relative settle", `stagger-${Math.min(index + 1, 4)}`)}>
      <span
        className={cn(
          "milestone-diamond absolute -left-[34px] top-[14px] !w-3.5 !h-3.5 transition-all duration-150 hover:scale-125",
          milestone ? "!bg-magenta shadow-[0_0_8px_var(--color-magenta)]" : "!bg-orb-core shadow-[0_0_8px_var(--color-orb-core)]",
        )}
        aria-hidden
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="block w-full border-2 border-ink bg-card px-4 py-3 text-left shadow-[2px_2px_0_#0a0a0f] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0a0a0f] press"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            {entry.note}
            <ChevronDown
              size={14}
              className={cn("text-cobalt transition-transform", open && "rotate-180")}
            />
          </p>
          <span className="mono-label shrink-0 !text-[10px] text-muted">{formatDate(entry.date)}</span>
        </div>
        {!open && changes ? (
          <p className="mt-2 line-clamp-2 text-xs text-muted">
            {changes.who_now
              ? "Identity shifted"
              : changes.aspirations
                ? "Aspirations updated"
                : changes.habits
                  ? "Habits updated"
                  : "Profile snapshot"}
          </p>
        ) : null}
      </button>
      {open ? (
        <div className="mt-2 border-2 border-ink bg-paper hard-card--mesh px-4 py-3">
          {isOnboarding ? (
            <p className="mono-label mb-3 flex items-center gap-2 !text-[10px] text-magenta">
              <Sparkles size={12} strokeWidth={2.4} />
              Compass set — your starting point
            </p>
          ) : null}
          {changes ? (
            <DeltaBlock changes={changes} />
          ) : (
            <div className="space-y-3 text-xs text-muted">
              <div>
                <p className="mono-label mb-1 text-ink">Who I am now</p>
                <div className="border border-ink/15 bg-card p-3 font-sans text-ink">
                  {entry.snapshot.who_now || <i>(unwritten)</i>}
                </div>
              </div>
              {entry.snapshot.aspirations.length ? (
                <div>
                  <p className="mono-label mb-1 text-ink">Who I&rsquo;m becoming</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.snapshot.aspirations.map((a, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center border border-ink/15 bg-card px-2.5 py-1 font-sans text-xs text-ink"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {entry.snapshot.habits.length ? (
                <div>
                  <p className="mono-label mb-1 text-ink">Habits in motion</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.snapshot.habits.map((h, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center border border-ink/15 bg-card px-2.5 py-1 font-sans text-xs text-ink"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function CompassTimeline({ journey }: { journey: JourneyEntry[] }) {
  if (journey.length === 0) {
    return (
      <HardCard mesh className="p-5 text-sm italic text-muted">
        No revisions yet. The first entry will appear here the moment you confirm your onboarding.
      </HardCard>
    );
  }

  return (
    <ol className="relative ml-2 space-y-5 border-l-[3px] border-ink pl-6">
      {journey.map((entry, idx) => (
        <TimelineEntry
          key={`${entry.date}-${idx}`}
          entry={entry}
          index={idx}
          journey={journey}
          milestone={idx === 0 || idx === journey.length - 1}
        />
      ))}
    </ol>
  );
}
