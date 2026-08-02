"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

/** Spline public embed URL — iframe embed (no SDK needed) */
const SPLINE_URL = "https://my.spline.design/reactiveorb-Rn4hWvHJ2IloIXyKvjkczzoF/";

const DEFAULT_PREFS: MediaPrefs = {
  reading: true,
  video: true,
  audio: true,
  in_person: true,
};

const STEP_HEADINGS = [
  { title: "Who are you, today?",               hint: "A few honest lines — the seed of your journal." },
  { title: "Who do you want to become?",        hint: "The person you're walking toward. Add as many as you hold." },
  { title: "What are your current habits?",     hint: "The routines already in motion — good or noisy, they matter." },
  { title: "What media belongs on the journey?", hint: "These shape which picks reach your feed." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: bootstrap } = useBootstrap();
  const onboard = useOnboard();

  const existing = bootstrap?.profile;
  const [step, setStep]               = useState(0);
  const [whoNow, setWhoNow]           = useState(existing?.who_now ?? "");
  const [aspirations, setAspirations] = useState<string[]>(existing?.aspirations ?? []);
  const [habits, setHabits]           = useState<string[]>(existing?.habits ?? []);
  const [prefs, setPrefs]             = useState<MediaPrefs>(existing?.media_prefs ?? DEFAULT_PREFS);
  const [error, setError]             = useState<string | null>(null);

  /* ── Scroll to top on mount + disable browser scroll-restore ─── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  const canProceed = step === 0 ? whoNow.trim().length > 0 : true;

  function submit() {
    const profile: Profile = {
      who_now: whoNow.trim(),
      aspirations,
      habits,
      media_prefs: prefs,
    };
    onboard.mutate(profile, {
      onSuccess: () => router.push("/"),
      onError: (err) =>
        setError(
          err instanceof Error
            ? err.message.includes("500") || err.message.includes("ECONNREFUSED")
              ? "Backend is not running. Start it with: cd backend && python main.py"
              : err.message
            : "Could not save. Please make sure the backend is running."
        ),
    });
  }

  return (
    <main style={{ backgroundColor: "#FAF9F6", minHeight: "100vh" }}>
      {/* ─── Hero: Spline orb full-bleed background ─────────────── */}
      <OnboardingHero />

      {/* ─── Form section: slides over the sticky hero ──────────── */}
      <section
        className="form-section-top container-narrow relative z-10 pb-24 pt-10"
        style={{
          backgroundColor: "#FFFFFF",
          marginTop: "-80px",
          borderRadius: "28px",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Header */}
        <div className="mb-8 flex flex-col items-start gap-5">
          {/* Compass icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "#171717",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Compass size={22} color="#FFFFFF" strokeWidth={2} />
          </div>

          <div>
            <h1 className="serif-heading text-4xl" style={{ color: "#111111" }}>
              Set your compass
            </h1>
            <p
              className="mono-label mt-3 max-w-md"
              style={{ color: "#525252", lineHeight: 1.75, textTransform: "none", letterSpacing: 0 }}
            >
              Four small questions. NextSelf uses this as your seed profile — you can edit any of
              it before beginning, and anytime after.
            </p>
          </div>

          <StepDots steps={STEP_COUNT} current={step} light />
        </div>

        {/* Step card */}
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-7 sm:p-9 shadow-xs">
          <div key={step} className="settle">
            <p className="mono-label text-xs font-semibold text-neutral-900">
              Step {step + 1} / {STEP_COUNT}
            </p>

            <h2 className="mt-2 font-serif text-2xl font-normal text-neutral-900">
              {STEP_HEADINGS[step].title}
            </h2>

            <p className="mt-1.5 text-sm text-neutral-600">
              {STEP_HEADINGS[step].hint}
            </p>

            <div className="mt-6">
              {step === 0 && (
                <textarea
                  value={whoNow}
                  onChange={(e) => setWhoNow(e.target.value)}
                  rows={4}
                  placeholder="e.g. A product engineer who reads mostly for work, curious about AI systems, often skips things that feel like homework…"
                  className="w-full rounded-xl border border-neutral-300 bg-white p-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all resize-none"
                  autoFocus
                />
              )}
              {step === 1 && (
                <StringListEditor
                  values={aspirations}
                  onChange={setAspirations}
                  placeholder="e.g. Lead technical decisions with confidence"
                  light
                />
              )}
              {step === 2 && (
                <StringListEditor
                  values={habits}
                  onChange={setHabits}
                  placeholder="e.g. Morning reading, weekly long walk"
                  light
                />
              )}
              {step === 3 && <MediaPrefsPicker prefs={prefs} onChange={setPrefs} light />}
            </div>
          </div>

          {error && (
            <div
              className="mt-4 rounded-lg p-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#DC2626",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <OutlineButton
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              variant="light"
            >
              <ArrowLeft size={15} /> Back
            </OutlineButton>

            {step < STEP_COUNT - 1 ? (
              <PrimaryButton
                onClick={() => canProceed && setStep((s) => s + 1)}
                disabled={!canProceed}
                variant="light"
              >
                Continue <ArrowRight size={15} />
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={submit} disabled={onboard.isPending} variant="light">
                {onboard.isPending ? "Setting…" : "Review your compass"}{" "}
                <ArrowRight size={15} />
              </PrimaryButton>
            )}
          </div>
        </div>

        {step === STEP_COUNT - 1 && (
          <SummaryCard
            whoNow={whoNow}
            aspirations={aspirations}
            habits={habits}
            onEditStep={(t) => setStep(t)}
            onConfirm={submit}
            submitting={onboard.isPending}
            error={error}
          />
        )}
      </section>
    </main>
  );
}

/* ─── OnboardingHero ─────────────────────────────────────────────── */

function OnboardingHero() {
  const heroRef       = useRef<HTMLElement>(null);
  const iframeRef     = useRef<HTMLIFrameElement>(null);
  const reduce        = useReducedMotion();

  /* Parallax on headline text only */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const textY       = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "38%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    function onWheel(e: WheelEvent) {
      window.scrollBy({ top: e.deltaY, left: 0 });
    }

    hero.addEventListener("wheel", onWheel, { passive: true });
    return () => hero.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-clip sticky top-0 z-0"
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF9F6",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        src={SPLINE_URL}
        title="NextSelf reactive orb"
        allow="autoplay"
        style={{
          position: "absolute",
          top:    "-6%",
          left:   "-6%",
          width:  "112%",
          height: "112%",
          border: "none",
          zIndex: 0,
          display: "block",
        }}
      />

      {/* ── Crisp top-to-bottom white gradient overlay ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background:
            "linear-gradient(to bottom, #FAF9F6 0%, rgba(250,249,246,0.85) 30%, rgba(250,249,246,0.4) 60%, rgba(255,255,255,0.95) 90%, #FFFFFF 100%)",
        }}
      />

      {/* ── Text scrim for maximum contrast behind copy ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(250,249,246,0.8) 65%, transparent 100%)",
        }}
      />

      {/* ── Bottom gradient — smooth transition into form ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "180px", zIndex: 3, pointerEvents: "none",
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9) 80%, #FFFFFF)",
        }}
      />

      {/* ── NextSelf brand badge — bottom-right ── */}
      <div
        aria-label="NextSelf"
        style={{
          position: "absolute",
          bottom: 18,
          right:  18,
          zIndex: 10,
          pointerEvents: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 0.9rem",
          background: "rgba(255, 255, 255, 0.90)",
          border: "1px solid rgba(0, 0, 0, 0.10)",
          borderRadius: 8,
          backdropFilter: "blur(14px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <span
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 5,
            background: "#171717",
            fontSize: 11, fontWeight: 900, color: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          N
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "#525252",
            fontWeight: 600,
          }}
        >
          nextself
        </span>
      </div>

      {/* ── Top-left brand badge ── */}
      <Link
        href="/"
        aria-label="NextSelf Home"
        className="absolute top-5 left-5 z-30 flex items-center gap-2.5 rounded-xl border border-neutral-300/80 bg-white/90 px-3.5 py-2 shadow-xs transition-all hover:border-neutral-400 hover:bg-white hover:shadow-md active:scale-95 cursor-pointer"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-[11px] font-bold text-white shadow-xs">
          N
        </span>
        <span className="text-xs font-bold tracking-tight text-neutral-900 uppercase">
          NextSelf
        </span>
      </Link>

      {/* ── Headline — parallax, z-10 above everything ───────────── */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
          position: "relative",
          zIndex: 10,
          pointerEvents: "none",
        }}
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "#171717",
            marginBottom: "1.25rem",
            display: "block",
          }}
        >
          Your growth compass · step one of four
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="serif-heading"
          style={{
            fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
            color: "#111111",
            maxWidth: 760,
            lineHeight: 1.12,
          }}
        >
          Draw your compass
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: "1.25rem",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "#525252",
            maxWidth: 400,
          }}
        >
          Four steps. Your seed profile.
          <br />
          The journey starts here.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="scroll-cue"
          style={{ marginTop: "3.5rem", color: "#171717" }}
        >
          <ChevronDown size={26} strokeWidth={1.8} />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── SummaryCard ────────────────────────────────────────────────── */

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
    <div className="settle mt-6">
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-7 sm:p-9 shadow-md">
        <p className="mono-label text-xs font-semibold text-neutral-900">
          First page of your journal
        </p>
        <p
          className="mt-2 font-serif text-xl font-normal text-neutral-900 italic"
        >
          &ldquo;The self I am, the self I&rsquo;m becoming&rdquo;
        </p>

        <dl className="mt-6 space-y-6 text-sm">
          {[
            { label: "Who I am now",         content: whoNow,       step: 0 },
            { label: "Who I want to become", content: aspirations,  step: 1 },
            { label: "Habits in motion",     content: habits,       step: 2 },
          ].map(({ label, content, step }) => (
            <div key={label}>
              <dt
                className="mono-label flex items-center justify-between text-neutral-500"
              >
                {label}
                <EditJump onClick={() => onEditStep(step)} />
              </dt>
              <dd className="mt-1.5 text-neutral-900 font-medium">
                {Array.isArray(content) ? (
                  content.length ? (
                    <ul className="list-inside list-disc space-y-0.5">
                      {content.map((v) => <li key={v}>{v}</li>)}
                    </ul>
                  ) : (
                    <span className="italic text-neutral-400 font-normal">None listed</span>
                  )
                ) : content ? (
                  content
                ) : (
                  <span className="italic text-neutral-400 font-normal">Not written yet</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {error && (
          <div
            className="mt-4 rounded-lg p-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#DC2626",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <PrimaryButton size="lg" onClick={onConfirm} disabled={submitting}>
            <Compass size={17} />
            {submitting ? "Setting compass…" : "Begin"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function EditJump({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-800 transition-all hover:bg-neutral-200"
    >
      Edit
    </button>
  );
}
