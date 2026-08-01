"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Compass } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
    <main className="min-h-screen">
      <OnboardingHero />

      <section className="container-narrow relative z-10 -mt-16 border-t-4 border-ink bg-paper pb-16 pt-10 shadow-[0_-10px_30px_rgba(23,19,16,0.28)]">
        <div className="mb-8 flex flex-col items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-lagoon shadow-[4px_4px_0_#0a0a0f]">
            <Compass size={24} className="text-white" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="serif-heading text-4xl text-ink">Set your compass</h1>
            <p className="mono-label mt-3 max-w-md leading-relaxed text-muted">
              Four small questions. NextSelf uses this as your seed profile — you can edit any of it before
              beginning, and anytime after.
            </p>
          </div>
          <StepDots steps={STEP_COUNT} current={step} />
        </div>

        <HardCard grain={false} className="p-7">
          <div key={step} className="settle">
            <p className="mono-label text-lagoon-deep">Step {step + 1} / {STEP_COUNT}</p>
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
      </section>
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
        <p className="mono-label text-lagoon-deep">First page of your journal</p>
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

/**
 * Hero for the first step of the app flow: the Spline reactive orb
 * (embedded oversized so its bottom-right watermark sits off-screen),
 * a "nextself" brand badge over the corner, and a scroll-linked
 * parallax — the orb drifts slower than the headline as you scroll.
 * The hero is pinned (sticky) and the form section scrolls up over
 * it, so the whole intro reads as one continuous scroll.
 */
const SPLINE_URL = "https://my.spline.design/reactiveorb-Rn4hWvHJ2IloIXyKvjkczzoF/";

function OnboardingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 10]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.9], [1, reduce ? 1 : 0]);

  return (
    <section
      ref={ref}
      className="sticky top-0 z-0 overflow-hidden bg-hero-bg"
      style={{ minHeight: "88vh" }}
    >
      {/* Soft lagoon wash behind the orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 45%, rgba(15,138,134,0.22), transparent 72%)",
        }}
      />

      {/* Spline orb — parallax layer (slower than text), clipped to the
          rounded card via .spline-frame and kept behind the headline */}
      <motion.div
        aria-hidden
        style={{ x: "-50%", y: orbY, rotate: orbRotate }}
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-square w-[min(92vw,560px)]"
      >
        <div className="spline-frame h-full w-full overflow-hidden rounded-[24px]">
          <iframe
            className="spline-embed"
            src={SPLINE_URL}
            title="NextSelf reactive orb"
            allow="autoplay; fullscreen"
          />
          <div className="brand-badge">
            <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-hero-accent text-[11px] font-black text-hero-bg">
              N
            </span>
            <span className="mono-label !text-[10px] text-ink">nextself</span>
          </div>
        </div>
      </motion.div>

      {/* Scrim between orb and headline so the text always stays readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 48%, rgba(23,19,16,0.82), rgba(23,19,16,0.4) 55%, transparent 82%)",
        }}
      />

      {/* Headline — parallax layer (drifts away faster) */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 flex min-h-[88vh] flex-col items-center justify-center px-4 text-center"
      >
        <span className="mono-label mb-4 text-hero-accent">Your growth compass · step one of four</span>
        <h1 className="serif-heading max-w-2xl text-5xl leading-tight text-hero-text md:text-6xl">
          Draw your compass
        </h1>
        <div className="scroll-cue mt-12" style={{ color: "var(--color-hero-accent)" }}>
          <ChevronDown size={30} strokeWidth={2.4} />
        </div>
      </motion.div>
    </section>
  );
}
