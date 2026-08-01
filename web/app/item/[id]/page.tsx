"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Bookmark, Check, ExternalLink, EyeOff, Sparkles } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { OutlineButton, PrimaryButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { useItem, useItemAction } from "@/hooks/useApi";
import { formatDate } from "@/lib/utils";

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ItemContent id={id} />;
}

function ItemContent({ id }: { id: string }) {
  const { data, isLoading, error } = useItem(id);
  const action = useItemAction(id);
  const [ack, setAck] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="hard-card h-6 w-40 animate-pulse !shadow-none" />
        <div className="hard-card h-96 animate-pulse !shadow-none" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <HardCard className="p-6">
        <p className="text-sm font-semibold text-ink">{error?.message ?? "Item not found."}</p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-dark underline-offset-2 hover:underline"
        >
          <ArrowLeft size={15} /> Back to the feed
        </Link>
      </HardCard>
    );
  }

  const item = data;

  function run(next: "saved" | "dismissed" | "done") {
    action.mutate(next, {
      onSuccess: (res) => {
        setAck(res.ack);
        window.setTimeout(() => setAck(null), 5000);
      },
    });
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-dark underline-offset-2 hover:underline"
      >
        <ArrowLeft size={15} /> Back to the feed
      </Link>

      <HardCard className="p-6 sm:p-8">
        <div className="mono-label flex flex-wrap items-center gap-2 border-b-2 border-ink pb-3">
          <TypeBadge type={item.media_type} />
          <span className="text-muted">
            {item.sources.join(" · ")}
            {item.published_date ? ` · ${formatDate(item.published_date)}` : ""}
          </span>
          <span className="text-muted">· {item.member_count} related item{item.member_count === 1 ? "" : "s"}</span>
        </div>

        <h1 className="mt-5 font-display text-2xl leading-tight text-ink sm:text-3xl">{item.title}</h1>

        <div className="mt-6 space-y-8">
          <section>
            <h2 className="mono-label text-ink">The piece</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.full_summary}</p>
          </section>

          <section className="border-l-2 border-magenta bg-magenta/5 px-4 py-3">
            <h2 className="mono-label flex items-center gap-1.5 text-ink">
              <Sparkles size={13} className="text-magenta" strokeWidth={2.4} /> Why this was picked
            </h2>
            <p className="mt-1.5 text-sm italic leading-relaxed text-muted">{item.rationale}</p>
          </section>

          {item.links.length > 0 ? (
            <section>
              <h2 className="mono-label text-ink">Read the source</h2>
              <ul className="mt-2 space-y-1.5">
                {item.links.slice(0, 6).map((link) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 break-all text-sm font-medium text-cobalt-dark underline-offset-2 hover:underline"
                    >
                      <ExternalLink size={13} className="shrink-0" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {item.members && item.members.length > 1 ? (
            <section>
              <h2 className="mono-label text-ink">The thread behind this pick</h2>
              <ul className="mt-2 space-y-2">
                {item.members.slice(0, 8).map((member) => (
                  <li key={member.id} className="border-2 border-ink bg-paper px-3.5 py-2.5">
                    <p className="text-sm font-medium text-ink">{member.title}</p>
                    {member.rationale ? (
                      <p className="mt-0.5 text-[13px] italic text-muted">{member.rationale}</p>
                    ) : null}
                    {member.link ? (
                      <a
                        href={member.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cobalt-dark hover:underline"
                      >
                        <ExternalLink size={11} /> source
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-t-2 border-ink pt-4">
          <PrimaryButton size="sm" onClick={() => run("saved")} disabled={action.isPending}>
            <Bookmark size={14} /> Save
          </PrimaryButton>
          <OutlineButton size="sm" onClick={() => run("done")} disabled={action.isPending}>
            <Check size={13} /> Already did this
          </OutlineButton>
          <OutlineButton size="sm" onClick={() => run("dismissed")} disabled={action.isPending}>
            <EyeOff size={13} /> Dismiss
          </OutlineButton>
        </div>
        {ack ? (
          <p className="mt-3 border-2 border-cobalt bg-cobalt/5 px-3 py-2 text-xs font-medium text-cobalt-dark">
            {ack}
          </p>
        ) : null}
      </HardCard>

      {item.related && item.related.length > 0 ? (
        <section className="mt-10">
          <SectionHeading sub="What the thread suggests next">Next steps in this thread</SectionHeading>
          <div className="space-y-6">
            {item.related.slice(0, 3).map((related) => (
              <FeedCard key={related.id} item={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
