"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { MediaPrefsPicker } from "@/components/ui/MediaPrefsPicker";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StringListEditor } from "@/components/ui/StringListEditor";
import { Toggle } from "@/components/ui/Toggle";
import { useDigestInfo, useRunStatus, useSettings, useStartRun, useUpdateSettings } from "@/hooks/useApi";
import { formatDate } from "@/lib/utils";
import type { Profile, Settings } from "@/lib/types";

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const [ack, setAck] = useState<string | null>(null);

  if (isLoading || !data) return <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-card" />;

  const { profile, settings, feedback_history } = data;

  function flash(message: string) {
    setAck(message);
    window.setTimeout(() => setAck(null), 4000);
  }

  function saveProfile(next: Partial<Profile>) {
    update.mutate(
      { ...next },
      {
        onSuccess: (res) => flash(res.ack),
        onError: (err) => flash(err.message),
      },
    );
  }

  function saveSettings(next: Partial<Settings>) {
    update.mutate(
      { ...next },
      {
        onSuccess: (res) => flash(res.ack),
        onError: (err) => flash(err.message),
      },
    );
  }

  return (
    <div>
      <SectionHeading sub="Manage goals, habits, media preferences, and feedback history.">
        Settings
      </SectionHeading>

      <div className="space-y-6">
        <HardCard className="p-6">
          <h2 className="font-serif text-xl font-normal text-neutral-900">Stated goals &amp; habits</h2>
          <div className="mt-4 space-y-5">
            <div>
              <p className="mono-label text-neutral-500">Who I am now</p>
              <textarea
                defaultValue={profile.who_now}
                onBlur={(e) => e.target.value.trim() !== profile.who_now && saveProfile({ who_now: e.target.value.trim() })}
                rows={2}
                className="hard-input mt-1.5 resize-none"
              />
            </div>
            <div>
              <p className="mono-label text-neutral-500">Aspirations</p>
              <div className="mt-1.5">
                <StringListEditor values={profile.aspirations} onChange={(next) => saveProfile({ aspirations: next })} light />
              </div>
            </div>
            <div>
              <p className="mono-label text-neutral-500">Habits</p>
              <div className="mt-1.5">
                <StringListEditor values={profile.habits} onChange={(next) => saveProfile({ habits: next })} light />
              </div>
            </div>
          </div>
        </HardCard>

        <HardCard className="p-6">
          <h2 className="font-serif text-xl font-normal text-neutral-900">Media preferences</h2>
          <p className="mt-1 text-sm text-neutral-600">The feed is filtered by these — a real filter over real item metadata.</p>
          <div className="mt-4">
            <MediaPrefsPicker
              prefs={profile.media_prefs}
              onChange={(media_prefs) => saveProfile({ media_prefs })}
              light
            />
          </div>
        </HardCard>

        <HardCard className="p-6">
          <h2 className="font-serif text-xl font-normal text-neutral-900">Curator settings</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mono-label text-neutral-500">This week&rsquo;s focus</span>
              <input
                defaultValue={settings.focus}
                onBlur={(e) => e.target.value.trim() !== settings.focus && saveSettings({ focus: e.target.value.trim() })}
                placeholder="e.g. public speaking"
                className="hard-input mt-1.5"
              />
              <span className="mt-1 block text-xs text-neutral-500">
                Shown in the top bar and the onboarding context. Set by you — not yet derived by the agent.
              </span>
            </label>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">Reduced texture mode</p>
                <p className="text-xs text-neutral-500">Removes mesh dots, glitch edges, and heavy shadows for a calmer view.</p>
              </div>
              <Toggle
                checked={settings.reduced_texture}
                onChange={(reduced_texture) => saveSettings({ reduced_texture })}
                label="Reduced texture mode"
              />
            </div>
          </div>
        </HardCard>

        <HardCard className="p-6">
          <h2 className="font-serif text-xl font-normal text-neutral-900">Feedback history</h2>
          <p className="mt-1 text-sm text-neutral-600">Everything you&rsquo;ve told NextSelf, in one place.</p>
          {feedback_history.length === 0 ? (
            <p className="mt-3 text-sm italic text-neutral-500">No feedback recorded yet.</p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {feedback_history
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={`${entry.item_id}-${entry.at}`} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-600">
                    <span className="font-medium capitalize text-neutral-900">{entry.action.replaceAll("_", " ")}</span>
                    {" — "}
                    {entry.title || entry.item_id}
                    <span className="ml-1 text-neutral-500">· {formatDate(entry.at)}</span>
                  </li>
                ))}
            </ul>
          )}
        </HardCard>

        <RunPanel onAck={flash} />

        {ack ? (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-800">{ack}</p>
        ) : null}
      </div>
    </div>
  );
}

function RunPanel({ onAck }: { onAck: (msg: string) => void }) {
  const { data: status } = useRunStatus(true);
  const { data: digest } = useDigestInfo();
  const start = useStartRun();
  const running = Boolean(status?.running);

  return (
    <HardCard className="p-6">
      <h2 className="font-serif text-xl font-normal text-neutral-900">Fresh curation</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Runs the real agent pipeline (fetch → score → cluster → digest). Takes a few minutes; it&rsquo;s a subprocess,
        so this page stays responsive.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PrimaryButton
          size="sm"
          onClick={() => start.mutate(undefined, { onSuccess: () => onAck("Curation started in the background.") })}
          disabled={running || start.isPending}
        >
          <Play size={14} /> {running ? "Curation in progress…" : "Run curation"}
        </PrimaryButton>
        {digest?.html_url ? (
          <a
            href={digest.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            <ExternalLink size={14} /> View current digest{digest.digest_date ? ` (${formatDate(digest.digest_date)})` : ""}
          </a>
        ) : null}
      </div>
      {status?.finished_at && !running ? (
        <p className="mt-3 text-xs text-neutral-500">
          Last run finished {formatDate(status.finished_at)}
          {status.exit_code === 0 ? " — success." : status.exit_code != null ? ` — exit code ${status.exit_code}.` : ""}
        </p>
      ) : null}
    </HardCard>
  );
}
