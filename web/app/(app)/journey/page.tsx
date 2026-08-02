"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { CompassTimeline } from "@/components/CompassTimeline";
import { OutlineButton, PrimaryButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StringListEditor } from "@/components/ui/StringListEditor";
import { useJourney, useUpdateProfile } from "@/hooks/useApi";
import type { Profile } from "@/lib/types";

export default function JourneyPage() {
  const { data, isLoading, error } = useJourney();
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [ack, setAck] = useState<string | null>(null);

  if (isLoading || !data) {
    return <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-card" />;
  }
  if (error) {
    return (
      <HardCard className="p-6 text-center">
        <p className="font-medium text-white">Could not load journey: {error.message}</p>
        <p className="mt-2 text-sm text-muted">Check that the backend is running on port 8000.</p>
      </HardCard>
    );
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
      <SectionHeading sub="Track how your goals, habits, and profile evolve over time.">
        Journey and identity
      </SectionHeading>

      {/* Seed profile card — editorial surface */}
      <HardCard className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="mono-label text-neutral-500">Current profile</p>
          {!editing ? (
            <OutlineButton size="sm" onClick={startEdit}>
              <Pencil size={13} /> Edit
            </OutlineButton>
          ) : null}
        </div>

        {!editing ? (
          <div className="mt-5 space-y-5 text-sm">
            <div>
              <p className="mono-label text-neutral-500">Who I am now</p>
              <p className="mt-1.5 leading-[1.45] text-neutral-900 font-normal">
                {profile.who_now || <span className="block rounded-xl border border-neutral-200 bg-neutral-50 p-3 italic text-neutral-500 text-xs font-normal">Not written yet</span>}
              </p>
            </div>
            <div>
              <p className="mono-label text-neutral-500">Who I&rsquo;m becoming</p>
              {profile.aspirations.length ? (
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-neutral-900 font-normal">
                  {profile.aspirations.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 italic text-neutral-500 text-xs">
                  No aspirations listed
                </p>
              )}
            </div>
            <div>
              <p className="mono-label text-neutral-500">Habits in motion</p>
              {profile.habits.length ? (
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-neutral-900 font-normal">
                  {profile.habits.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 italic text-neutral-500 text-xs">
                  No habits listed
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mono-label text-neutral-500">Who I am now</span>
              <textarea
                value={profile.who_now}
                onChange={(e) => setDraft({ ...profile, who_now: e.target.value })}
                rows={3}
                className="hard-input mt-1.5 resize-none"
              />
            </label>
            <div>
              <span className="mono-label text-neutral-500">Who I&rsquo;m becoming</span>
              <div className="mt-1.5">
                <StringListEditor
                  values={profile.aspirations}
                  onChange={(next) => setDraft({ ...profile, aspirations: next })}
                  placeholder="Add an aspiration…"
                />
              </div>
            </div>
            <div>
              <span className="mono-label text-neutral-500">Habits in motion</span>
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
          <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-800">{ack}</p>
        ) : null}
      </HardCard>

      {/* Timeline of how the profile has evolved */}
      <section className="mt-12">
        <SectionHeading sub="Every edit creates an entry showing your progression.">
          How your compass has turned
        </SectionHeading>
        <CompassTimeline journey={journeyData.journey} />
      </section>
    </div>
  );
}
