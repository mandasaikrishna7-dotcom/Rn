"use client";

import { useState } from "react";
import { ChevronDown, Pencil, X } from "lucide-react";
import { OutlineButton, PrimaryButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StringListEditor } from "@/components/ui/StringListEditor";
import { useJourney, useUpdateProfile } from "@/hooks/useApi";
import { cn, formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function JourneyPage() {
  const { data, isLoading } = useJourney();
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [ack, setAck] = useState<string | null>(null);

  if (isLoading || !data) {
    return <div className="hard-card h-72 animate-pulse !shadow-none" />;
  }
  const journeyData = data;

  const profile = draft ?? journeyData.profile;

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(journeyData.profile)) as Profile);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }

  function save() {
    if (!draft) return;
    update.mutate(draft, {
      onSuccess: (res) => {
        setEditing(false);
        setDraft(null);
        setAck(res.ack);
        window.setTimeout(() => setAck(null), 5000);
      },
    });
  }

  return (
    <div>
      <SectionHeading sub="Your identity is not a static bio — it's a course. This page is where it changes.">
        Journey &amp; Identity
      </SectionHeading>

      {/* Seed profile card — hard edge, halftone fills where fields are empty */}
      <HardCard className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="mono-label text-ink">Seed profile</p>
          {!editing ? (
            <OutlineButton size="sm" onClick={startEdit}>
              <Pencil size={13} /> Edit
            </OutlineButton>
          ) : null}
        </div>

        {!editing ? (
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <p className="mono-label text-muted">Who I am now</p>
              <p className="mt-1 leading-relaxed text-ink">
                {profile.who_now || <span className="hard-card--mesh block border-2 border-dashed border-ink px-3 py-2 italic text-muted">Not written yet</span>}
              </p>
            </div>
            <div>
              <p className="mono-label text-muted">Who I&rsquo;m becoming</p>
              {profile.aspirations.length ? (
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {profile.aspirations.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="hard-card--mesh mt-1 border-2 border-dashed border-ink px-3 py-2 italic text-muted">
                  No aspirations listed
                </p>
              )}
            </div>
            <div>
              <p className="mono-label text-muted">Habits in motion</p>
              {profile.habits.length ? (
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {profile.habits.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="hard-card--mesh mt-1 border-2 border-dashed border-ink px-3 py-2 italic text-muted">
                  No habits listed
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mono-label text-muted">Who I am now</span>
              <textarea
                value={profile.who_now}
                onChange={(e) => setDraft({ ...profile, who_now: e.target.value })}
                rows={3}
                className="hard-input mt-1.5 resize-none"
              />
            </label>
            <div>
              <span className="mono-label text-muted">Who I&rsquo;m becoming</span>
              <div className="mt-1.5">
                <StringListEditor
                  values={profile.aspirations}
                  onChange={(next) => setDraft({ ...profile, aspirations: next })}
                  placeholder="Add an aspiration…"
                />
              </div>
            </div>
            <div>
              <span className="mono-label text-muted">Habits in motion</span>
              <div className="mt-1.5">
                <StringListEditor
                  values={profile.habits}
                  onChange={(next) => setDraft({ ...profile, habits: next })}
                  placeholder="Add a habit…"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PrimaryButton size="sm" onClick={save} disabled={update.isPending}>
                {update.isPending ? "Saving…" : "Save changes"}
              </PrimaryButton>
              <OutlineButton size="sm" onClick={cancelEdit}>
                <X size={13} /> Cancel
              </OutlineButton>
            </div>
          </div>
        )}

        {ack ? (
          <p className="mt-4 border-2 border-cobalt bg-cobalt/5 px-3 py-2 text-xs font-medium text-cobalt-dark">{ack}</p>
        ) : null}
      </HardCard>

      {/* Timeline of how the profile has evolved */}
      <section className="mt-12">
        <SectionHeading sub="Every confirmation becomes an entry">How your compass has turned</SectionHeading>
        {journeyData.journey.length === 0 ? (
          <HardCard mesh className="p-5 text-sm italic text-muted">
            No revisions yet. The first entry will appear here the moment you confirm your onboarding.
          </HardCard>
        ) : (
          <ol className="relative ml-2 space-y-5 border-l-[3px] border-ink pl-6">
            {journeyData.journey.map((entry, idx) => (
              <TimelineEntry key={`${entry.date}-${idx}`} {...entry} last={idx === journeyData.journey.length - 1} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function TimelineEntry({
  date,
  note,
  snapshot,
  last,
}: {
  date: string;
  note: string;
  snapshot: { who_now: string; aspirations: string[]; habits: string[] };
  last: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="relative">
      <span
        className={cn(
          "milestone-diamond absolute -left-[34px] top-1 h-4 w-4",
          last && "glitch",
        )}
        aria-hidden
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="block w-full border-2 border-ink bg-card px-4 py-3 text-left shadow-[2px_2px_0_#0a0a0f] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#0a0a0f]"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            {note}
            <ChevronDown
              size={14}
              className={cn("text-cobalt transition-transform", open && "rotate-180")}
            />
          </p>
          <span className="mono-label shrink-0 !text-[10px] text-muted">{formatDate(date)}</span>
        </div>
      </button>
      {open && !last ? (
        <div className="mt-2 border-2 border-dashed border-ink bg-paper px-4 py-3 text-xs text-muted">
          <p>
            <b className="font-semibold text-ink">Now:</b>{" "}
            {snapshot.who_now || <i className="text-muted">(unwritten)</i>}
          </p>
          {snapshot.aspirations.length ? (
            <p className="mt-1">
              <b className="font-semibold text-ink">Becoming:</b> {snapshot.aspirations.join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
