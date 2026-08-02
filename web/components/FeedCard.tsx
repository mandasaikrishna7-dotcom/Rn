"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Check, EyeOff, Sparkles, ChevronDown } from "lucide-react";
import { HardCard } from "@/components/ui/HardCard";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { useItemAction } from "@/hooks/useApi";
import { cn, formatDate } from "@/lib/utils";
import type { FeedItem } from "@/lib/types";

/**
 * A single curated card. Structure is fixed for scanability:
 * mono utility strip (type · source · date) → headline → 3-line summary
 * → collapsed mono footnote ("why this pick" + rank) → 4 equal-width
 * action buttons. Scoring metadata never competes with the headline.
 */
export function FeedCard({ item }: { item: FeedItem }) {
  const action = useItemAction(item.id);
  const [ack, setAck] = useState<string | null>(null);
  const [state, setState] = useState<"saved" | "dismissed" | "done" | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);

  function run(next: "saved" | "dismissed" | "done" | "more_like_this") {
    action.mutate(next, {
      onSuccess: (res) => {
        setAck(res.ack);
        if (next !== "more_like_this") setState(next);
        window.setTimeout(() => setAck(null), 4000);
      },
    });
  }

  const score = item.score;
  const hidden = state === "dismissed";

  return (
    <HardCard as="article" className="settle p-6">
      <div className="mono-label flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E3DA] pb-3">
        <TypeBadge type={item.media_type} />
        <span className="text-muted/80">
          {item.sources.join(" · ")}
          {item.published_date ? ` · ${formatDate(item.published_date)}` : ""}
        </span>
      </div>

      <Link href={`/item/${item.id}`} className="mt-4 block focus-visible:outline-none">
        <h2 className="font-display text-xl leading-snug text-ink transition-colors hover:text-cobalt font-medium">
          {item.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.summary}</p>
      </Link>

      {/* Collapsed mono footnote — ranking rationale stays out of the way */}
      <button
        onClick={() => setWhyOpen((o) => !o)}
        aria-expanded={whyOpen}
        className="mt-4 flex w-full items-center gap-2 border border-[#E8E3DA] bg-surface-0 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2"
      >
        <Sparkles size={13} className="shrink-0 text-magenta" strokeWidth={2} />
        <span className="mono-label flex-1 !tracking-[0.05em] text-ink font-medium">
          Why this pick {whyOpen ? "▴" : "▾"}
        </span>
        <span className="mono-label !text-[10px] text-muted">
          #{item.id.replace("c", "")} · composed {score?.mean_composed?.toFixed(2)}
        </span>
      </button>
      {whyOpen ? (
        <p className="mono-label mt-2 !text-[11px] !normal-case !leading-relaxed !tracking-[0.02em] border-l-2 border-magenta bg-magenta/5 px-3 py-2 text-muted rounded-r-lg">
          {item.rationale}
        </p>
      ) : null}

      {/* Equal-width action row */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          onClick={() => run("saved")}
          disabled={action.isPending || state === "saved"}
          className={cn(
            "btn btn-primary px-2 py-2 text-xs",
            state === "saved" && "opacity-60",
          )}
        >
          <Bookmark size={13} fill={state === "saved" ? "currentColor" : "none"} /> Save
        </button>
        <button
          onClick={() => run("done")}
          disabled={action.isPending || state === "done"}
          className={cn("btn btn-outline px-2 py-2 text-xs", state === "done" && "opacity-60")}
        >
          <Check size={13} /> Done
        </button>
        <button
          onClick={() => run("more_like_this")}
          disabled={action.isPending}
          className="btn btn-outline px-2 py-2 text-xs"
        >
          <Sparkles size={13} /> More like this
        </button>
        <button
          onClick={() => run("dismissed")}
          disabled={action.isPending || hidden}
          className={cn("btn btn-outline px-2 py-2 text-xs", hidden && "opacity-60")}
        >
          <EyeOff size={13} /> Dismiss
        </button>
      </div>

      {ack && !hidden ? (
        <p className="mt-3 border border-cobalt/25 bg-cobalt/5 rounded-lg px-3 py-2 text-xs font-medium text-cobalt">
          {ack}
        </p>
      ) : null}
      {hidden ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <ChevronDown size={13} className="hidden" />
          Dismissed — it won&rsquo;t resurface this cycle.
        </p>
      ) : null}
    </HardCard>
  );
}
