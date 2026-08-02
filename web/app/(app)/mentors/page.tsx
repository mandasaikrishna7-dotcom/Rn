"use client";

import { useState } from "react";
import { User, Users, CalendarDays, Sparkles } from "lucide-react";
import { BackendGap } from "@/components/ui/BackendGap";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useMentors } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { Mentor } from "@/lib/types";

const KIND_META: Record<Mentor["kind"], { label: string; Icon: typeof User }> = {
  person: { label: "Person", Icon: User },
  community: { label: "Community", Icon: Users },
  event: { label: "Experience", Icon: CalendarDays },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function MentorCard({ mentor, index }: { mentor: Mentor; index: number }) {
  const [whyOpen, setWhyOpen] = useState(false);
  const meta = KIND_META[mentor.kind] ?? KIND_META.person;
  const Icon = meta.Icon;
  const isStub = mentor.stub;

  return (
    <HardCard
      dashed={isStub}
      mesh={isStub}
      className={cn("flex flex-col p-5 settle", `stagger-${Math.min(index + 1, 4)}`)}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink font-display text-sm text-ink",
            isStub ? "bg-halftone/20" : "bg-cobalt/10",
          )}
        >
          {isStub ? <Icon size={18} strokeWidth={2} className="text-cobalt-dark" /> : initials(mentor.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="mono-label text-muted">{meta.label}</p>
          <h3 className="font-display text-base text-ink">{mentor.name}</h3>
          <p className="mono-label mt-1 !text-[10px] text-cobalt-dark">{mentor.focus_area}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{mentor.context}</p>

      <button
        onClick={() => setWhyOpen((o) => !o)}
        aria-expanded={whyOpen}
        className="mt-4 flex w-full items-center gap-2 border-2 border-ink bg-paper px-3 py-2 text-left transition-colors hover:bg-halftone/10"
      >
        <Sparkles size={13} className="shrink-0 text-magenta" strokeWidth={2.4} />
        <span className="mono-label flex-1 !tracking-[0.05em] text-ink">
          Why this pick {whyOpen ? "▴" : "▾"}
        </span>
      </button>
      {whyOpen ? (
        <p className="mono-label mt-2 !text-[11px] !normal-case !leading-relaxed !tracking-[0.02em] border-l-2 border-magenta bg-magenta/5 px-3 py-2 text-muted">
          {mentor.why}
        </p>
      ) : null}

      {isStub ? (
        <span className="mono-label mt-3 w-fit border-2 border-dashed border-ink bg-paper px-2 py-1 !text-[10px] !tracking-[0.06em] text-muted">
          Placeholder — no data source yet
        </span>
      ) : (
        <span className="mono-label mt-3 w-fit border-2 border-ink bg-paper px-2 py-1 !text-[10px] !tracking-[0.06em] text-muted">
          Curated match — connect not wired yet
        </span>
      )}
    </HardCard>
  );
}

export default function MentorsPage() {
  const { data, isLoading, error } = useMentors();

  return (
    <div>
      <SectionHeading sub="People, communities, and experiences aligned with who you're becoming.">
        Mentors &amp; Experiences
      </SectionHeading>

      {data?.stub ? (
        <BackendGap className="mb-6">
          <b>Backend gap:</b> {data.note} The cards below are clearly-labeled placeholders — nothing here is
          pretending to be a real recommendation.
        </BackendGap>
      ) : data?.note ? (
        <p className="mb-6 border-2 border-ink bg-cobalt/5 px-4 py-3 text-sm text-cobalt-dark">{data.note}</p>
      ) : null}

      {data?.contact_stub ? (
        <BackendGap className="mb-6">
          <b>Still stubbed:</b> {data.contact_note}
        </BackendGap>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="hard-card h-48 animate-pulse !shadow-none" />
          <div className="hard-card h-48 animate-pulse !shadow-none" />
        </div>
      ) : null}

      {error ? (
        <HardCard className="p-6 text-center">
          <p className="font-semibold text-ink">Could not load mentors: {error.message}</p>
          <p className="mt-2 text-sm text-muted">Check that the backend is running on port 8000.</p>
        </HardCard>
      ) : null}

      {data && !error ? (
        data.items.length === 0 ? (
          <HardCard mesh className="p-5 text-sm italic text-muted">
            No mentor matches available right now. Check back after updating your aspirations on Journey.
          </HardCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((mentor, index) => (
              <MentorCard key={mentor.id} mentor={mentor} index={index} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
