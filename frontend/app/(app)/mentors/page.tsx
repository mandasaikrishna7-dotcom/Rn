"use client";

import { User, Users, CalendarDays } from "lucide-react";
import { BackendGap } from "@/components/ui/BackendGap";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useMentors } from "@/hooks/useApi";
import type { Mentor } from "@/lib/types";

const KIND_META: Record<Mentor["kind"], { label: string; Icon: typeof User }> = {
  person: { label: "Person", Icon: User },
  community: { label: "Community", Icon: Users },
  event: { label: "Experience", Icon: CalendarDays },
};

export default function MentorsPage() {
  const { data, isLoading } = useMentors();

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
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="hard-card h-40 animate-pulse !shadow-none" />
          <div className="hard-card h-40 animate-pulse !shadow-none" />
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.items.map((mentor) => {
            const meta = KIND_META[mentor.kind] ?? KIND_META.person;
            const Icon = meta.Icon;
            return (
              <HardCard key={mentor.id} dashed mesh className="flex flex-col p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-halftone/20">
                    <Icon size={18} strokeWidth={2} className="text-cobalt-dark" />
                  </span>
                  <div>
                    <p className="mono-label text-muted">{meta.label}</p>
                    <h3 className="font-display text-base text-ink">{mentor.name}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{mentor.context}</p>
                <p className="mt-auto pt-3 text-xs italic text-muted">Why: {mentor.why}</p>
                <span className="mono-label mt-3 w-fit border-2 border-dashed border-ink bg-paper px-2 py-1 !text-[10px] !tracking-[0.06em] text-muted">
                  Placeholder — no data source yet
                </span>
              </HardCard>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
