"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { HardCard } from "@/components/ui/HardCard";
import { resolveEntryChanges } from "@/lib/journeyDelta";
import { cn, formatDate } from "@/lib/utils";
import type { JourneyChanges, JourneyEntry } from "@/lib/types";

function WhoNowDelta({ before, after }: { before: string; after: string }) {
  const b = before.trim();
  const a = after.trim();

  if (a.startsWith(b)) {
    const added = a.slice(b.length).trim();
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 font-sans text-xs leading-relaxed text-neutral-900 shadow-xs">
        <span>{b}</span>{" "}
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-900 text-xs shadow-xs">
          + {added}
        </span>
      </div>
    );
  }

  if (b.startsWith(a)) {
    const removed = b.slice(a.length).trim();
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 font-sans text-xs leading-relaxed text-neutral-900 shadow-xs">
        <span>{a}</span>{" "}
        <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-red-700 text-xs line-through">
          - {removed}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 font-sans text-xs leading-relaxed text-neutral-600">
        <span className="mono-label block mb-1.5 text-[10px] text-neutral-500 uppercase tracking-wider">Previous</span>
        <span>{b || "(empty)"}</span>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 font-sans text-xs leading-relaxed text-emerald-950 font-medium">
        <span className="mono-label block mb-1.5 text-[10px] text-emerald-700 uppercase tracking-wider">Updated</span>
        <span>{a || "(empty)"}</span>
      </div>
    </div>
  );
}

function DeltaBlock({ changes }: { changes: JourneyChanges }) {
  return (
    <div className="space-y-4 text-xs leading-relaxed text-neutral-600">
      {changes.who_now ? (
        <div>
          <p className="mono-label mb-2 text-neutral-900 font-semibold">Who I am now</p>
          <WhoNowDelta before={changes.who_now.before} after={changes.who_now.after} />
        </div>
      ) : null}

      {changes.aspirations ? (
        <div>
          <p className="mono-label mb-2 text-neutral-900 font-semibold">Who I&rsquo;m becoming</p>
          <div className="flex flex-wrap gap-2">
            {changes.aspirations.added.map((item, idx) => (
              <span
                key={`add-asp-${idx}`}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-sans text-xs text-emerald-800 font-medium"
              >
                + {item}
              </span>
            ))}
            {changes.aspirations.removed.map((item, idx) => (
              <span
                key={`rem-asp-${idx}`}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 font-sans text-xs text-red-700 line-through"
              >
                - {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {changes.habits ? (
        <div>
          <p className="mono-label mb-2 text-neutral-900 font-semibold">Habits in motion</p>
          <div className="flex flex-wrap gap-2">
            {changes.habits.added.map((item, idx) => (
              <span
                key={`add-hab-${idx}`}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-sans text-xs text-emerald-800 font-medium"
              >
                + {item}
              </span>
            ))}
            {changes.habits.removed.map((item, idx) => (
              <span
                key={`rem-hab-${idx}`}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 font-sans text-xs text-red-700 line-through"
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
          "absolute -left-[31px] top-[18px] h-2.5 w-2.5 rounded-full transition-all duration-200",
          milestone ? "bg-neutral-900 ring-4 ring-neutral-200" : "bg-neutral-300",
        )}
        aria-hidden
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-left transition-all hover:border-neutral-300 hover:bg-neutral-50 shadow-xs"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-neutral-900">
            {entry.note}
            <ChevronDown
              size={14}
              className={cn("text-neutral-500 transition-transform duration-200", open && "rotate-180")}
            />
          </p>
          <span className="shrink-0 text-xs font-semibold text-neutral-600">{formatDate(entry.date)}</span>
        </div>
        {!open && changes ? (
          <p className="mt-1.5 line-clamp-2 text-xs font-medium text-neutral-600">
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
        <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5">
          {isOnboarding ? (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
              <Sparkles size={13} strokeWidth={2} />
              Compass set — starting point
            </p>
          ) : null}
          {changes ? (
            <DeltaBlock changes={changes} />
          ) : (
            <div className="space-y-3 text-sm text-neutral-800">
              <div>
                <p className="mono-label mb-1 text-neutral-900 font-semibold">Who I am now</p>
                <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm leading-[1.5] text-neutral-900 font-medium">
                  {entry.snapshot.who_now || <i>(unwritten)</i>}
                </div>
              </div>
              {entry.snapshot.aspirations.length ? (
                <div>
                  <p className="mono-label mb-1 text-neutral-900 font-semibold">Who I&rsquo;m becoming</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.snapshot.aspirations.map((a, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-2.5 py-1 font-sans text-xs text-neutral-800 font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {entry.snapshot.habits.length ? (
                <div>
                  <p className="mono-label mb-1 text-neutral-900 font-semibold">Habits in motion</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.snapshot.habits.map((h, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-2.5 py-1 font-sans text-xs text-neutral-800 font-medium"
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
      <HardCard className="p-5 text-sm italic text-neutral-500">
        No revisions yet. The first entry will appear here the moment you confirm your onboarding.
      </HardCard>
    );
  }

  return (
    <ol className="relative ml-2 space-y-4 border-l border-neutral-200 pl-6">
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
