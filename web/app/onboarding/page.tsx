"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { OutlineButton, PrimaryButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { MediaPrefsPicker } from "@/components/ui/MediaPrefsPicker";
import { StepDots } from "@/components/ui/StepDots";
import { StringListEditor } from "@/components/ui/StringListEditor";
import { useBootstrap, useOnboard } from "@/hooks/useApi";
import type { MediaPrefs, Profile } from "@/lib/types";

const STEP_COUNT = 4;

const DEFAULT_PREFS: MediaPrefs = { reading: true, video: true, audio: true, in_person: true };

const STEP_HEADINGS = [
  { title: "Who are you, today?", hint: "A few honest lines — the seed of your journal." },
  { title: "Who do you want to become?", hint: "The person you're walking toward. Add as many as you hold." },
  { title: "What are your current habits?", hint: "The routines already in motion — good or noisy, they matter." },
  { title: "What kinds of media belong on the journey?", hint: "These shape which picks reach your feed." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: bootstrap } = useBootstrap();
  const onboard = useOnboard();

  const existing = bootstrap?.profile;
  const [step, setStep] = useState(0);
  const [whoNow, setWhoNow] = useState(existing?.who_now ?? "");
  const [aspirations, setAspirations] = useState<string[]>(existing?.aspirations ?? []);
  const [habits, setHabits] = useState<string[]>(existing?.habits ?? []);
  const [prefs, setPrefs] = useState<MediaPrefs>(existing?.media_prefs ?? DEFAULT_PREFS);
  const [error, setError] = useState<string | null>(null);

  const canProceed = step === 0 ? whoNow.trim().length > 0 : true;

  function submit() {
    const profile: Profile = { who_now: whoNow.trim(), aspirations, habits, media_prefs: prefs };
    onboard.mutate(profile, {
      onSuccess: () => router.push("/"),
      onError: (err) => setError(err instanceof Error ? err.message : "Could not save. Is the backend running?"),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-cobalt shadow-[4px_4px_0_#0a0a0f]">
          <Compass size={24} className="text-white" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="display text-4xl text-ink">Draw your compass</h1>
          <p className="mono-label mt-3 max-w-md leading-relaxed text-muted">
            Four small questions. NextSelf uses this as your seed profile — you can edit any of it before
            beginning, and anytime after.
          </p>
        </div>
        <StepDots steps={STEP_COUNT} current={step} />
      </div>

      <HardCard grain={false} className="p-7">
        <div key={step} className="settle">
          <p className="mono-label text-cobalt-dark">Step {step + 1} / {STEP_COUNT}</p>
          <h2 className="mt-2 font-display text-2xl text-ink">{STEP_HEADINGS[step].title}</h2>
          <p className="mono-label mt-2 !text-[11px] !normal-case text-muted">{STEP_HEADINGS[step].hint}</p>

          <div className="mt-6">
            {step === 0 && (
              <textarea
                value={whoNow}
                onChange={(e) => setWhoNow(e.target.value)}
                rows={4}
                placeholder="e.g. A product engineer who reads mostly for work, curious about AI systems, often skips things that feel like homework…"
                className="hard-input resize-none"
                autoFocus
              />
            )}
            {step === 1 && (
              <StringListEditor
                values={aspirations}
                onChange={setAspirations}
                placeholder="e.g. Lead technical decisions with confidence"
              />
            )}
            {step === 2 && (
              <StringListEditor values={habits} onChange={setHabits} placeholder="e.g. Morning reading, weekly long walk" />
            )}
            {step === 3 && <MediaPrefsPicker prefs={prefs} onChange={setPrefs} />}
          </div>
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-magenta">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <OutlineButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={15} /> Back
          </OutlineButton>
          {step < STEP_COUNT - 1 ? (
            <PrimaryButton onClick={() => canProceed && setStep((s) => s + 1)} disabled={!canProceed}>
              Continue <ArrowRight size={15} />
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={submit} disabled={onboard.isPending}>
              {onboard.isPending ? "Setting…" : "Review your compass"} <ArrowRight size={15} />
            </PrimaryButton>
          )}
        </div>
      </HardCard>

      {step === STEP_COUNT - 1 ? (
        <SummaryCard
          whoNow={whoNow}
          aspirations={aspirations}
          habits={habits}
          onEditStep={(target) => setStep(target)}
          onConfirm={submit}
          submitting={onboard.isPending}
          error={error}
        />
      ) : null}
    </main>
  );
}

/**
 * Final onboarding screen: the editable summary card — the journal's
 * first page. Edits jump back to the relevant step.
 */
function SummaryCard({
  whoNow,
  aspirations,
  habits,
  onEditStep,
  onConfirm,
  submitting,
  error,
}: {
  whoNow: string;
  aspirations: string[];
  habits: string[];
  onEditStep: (step: number) => void;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className="settle mt-8">
      <HardCard className="p-7">
        <p className="mono-label text-cobalt-dark">First page of your journal</p>
        <p className="mt-2 font-display text-xl text-ink">&ldquo;The self I am, the self I&rsquo;m becoming&rdquo;</p>

        <dl className="mt-6 space-y-6 text-sm">
          <div>
            <dt className="mono-label flex items-center justify-between text-muted">
              Who I am now
              <EditJump onClick={() => onEditStep(0)} />
            </dt>
            <dd className="mt-1.5 text-ink">{whoNow || <span className="italic text-muted">Not written yet</span>}</dd>
          </div>
          <div>
            <dt className="mono-label flex items-center justify-between text-muted">
              Who I want to become
              <EditJump onClick={() => onEditStep(1)} />
            </dt>
            <dd className="mt-1.5">
              {aspirations.length ? (
                <ul className="list-inside list-disc space-y-0.5">{aspirations.map((a) => <li key={a}>{a}</li>)}</ul>
              ) : (
                <span className="italic text-muted">None listed</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="mono-label flex items-center justify-between text-muted">
              Habits in motion
              <EditJump onClick={() => onEditStep(2)} />
            </dt>
            <dd className="mt-1.5">
              {habits.length ? (
                <ul className="list-inside list-disc space-y-0.5">{habits.map((h) => <li key={h}>{h}</li>)}</ul>
              ) : (
                <span className="italic text-muted">None listed</span>
              )}
            </dd>
          </div>
        </dl>

        {error ? <p className="mt-5 text-sm font-semibold text-magenta">{error}</p> : null}

        <div className="mt-8 flex justify-center">
          <PrimaryButton size="lg" onClick={onConfirm} disabled={submitting}>
            <Compass size={17} />
            {submitting ? "Setting compass…" : "Begin"}
          </PrimaryButton>
        </div>
      </HardCard>
    </div>
  );
}

function EditJump({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mono-label border-2 border-ink bg-paper px-2 py-1 text-ink transition-colors hover:bg-halftone/15"
    >
      Edit
    </button>
  );
}
