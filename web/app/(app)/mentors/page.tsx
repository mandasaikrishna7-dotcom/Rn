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
      className={cn("flex flex-col p-5 settle", `stagger-${Math.min(index + 1, 4)}`)}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-sans text-xs text-neutral-900 font-medium",
          )}
        >
          {isStub ? <Icon size={18} strokeWidth={1.8} className="text-neutral-600" /> : initials(mentor.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="mono-label text-neutral-500">{meta.label}</p>
          <h3 className="font-serif text-lg text-neutral-900 font-normal leading-snug">{mentor.name}</h3>
          <p className="mono-label mt-1 text-[11px] text-blue-600 font-semibold">{mentor.focus_area}</p>
        </div>
      </div>

      <p className="mt-3.5 text-sm leading-relaxed text-neutral-600">{mentor.context}</p>

      <button
        onClick={() => setWhyOpen((o) => !o)}
        aria-expanded={whyOpen}
        className="mt-4 flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-100"
      >
        <Sparkles size={13} className="shrink-0 text-neutral-700" strokeWidth={1.8} />
        <span className="mono-label flex-1 text-[11px] text-neutral-800 font-medium">
          Why this pick {whyOpen ? "▴" : "▾"}
        </span>
      </button>
      {whyOpen ? (
        <p className="mono-label mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-600">
          {mentor.why}
        </p>
      ) : null}

      {isStub ? (
        <span className="mono-label mt-4 w-fit rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[10px] tracking-wider text-neutral-600">
          Placeholder — no data source yet
        </span>
      ) : (
        <span className="mono-label mt-4 w-fit rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[10px] tracking-wider text-neutral-600">
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
      <SectionHeading sub="People, communities, and experiences aligned with who you are becoming.">
        Mentors and experiences
      </SectionHeading>

      {data?.stub ? (
        <BackendGap className="mb-6">
          <b>Backend gap:</b> {data.note} The cards below are clearly-labeled placeholders — nothing here is
          pretending to be a real recommendation.
        </BackendGap>
      ) : data?.note ? (
        <p className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">{data.note}</p>
      ) : null}

      {data?.contact_stub ? (
        <BackendGap className="mb-6">
          <b>Still stubbed:</b> {data.contact_note}
        </BackendGap>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
          <div className="h-48 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
        </div>
      ) : null}

      {error ? (
        <HardCard className="p-6 text-center">
          <p className="font-medium text-neutral-900">Could not load mentors: {error.message}</p>
          <p className="mt-2 text-sm text-neutral-500">Check that the backend is running on port 8000.</p>
        </HardCard>
      ) : null}

      {data && !error ? (
        data.items.length === 0 ? (
          <HardCard className="p-5 text-sm italic text-neutral-500">
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
