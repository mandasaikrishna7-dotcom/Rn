"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Check, EyeOff, Sparkles, ChevronDown, ArrowUpRight } from "lucide-react";
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 text-xs text-neutral-500 font-normal">
        <TypeBadge type={item.media_type} />
        <span>
          {item.sources.join(" · ")}
          {item.published_date ? ` · ${formatDate(item.published_date)}` : ""}
        </span>
      </div>

      <Link href={`/item/${item.id}`} className="group mt-3.5 block focus-visible:outline-none">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-neutral-900 tracking-[-0.02em] leading-[1.2] group-hover:text-blue-600 group-hover:underline underline-offset-4 decoration-blue-400 transition-colors">
            {item.title}
          </h2>
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>
        <p className="mt-2.5 line-clamp-3 text-sm leading-[1.45] text-neutral-600 font-normal">{item.summary}</p>
      </Link>

      {/* Collapsed rationale footnote */}
      <button
        onClick={() => setWhyOpen((o) => !o)}
        aria-expanded={whyOpen}
        className="mt-4 flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-left transition-all hover:bg-neutral-100"
      >
        <Sparkles size={13} className="shrink-0 text-neutral-700" strokeWidth={1.8} />
        <span className="flex-1 text-xs text-neutral-800 font-medium">
          Why this pick {whyOpen ? "▴" : "▾"}
        </span>
        <span className="text-[11px] text-neutral-500 font-normal">
          #{item.id.replace("c", "")} · {score?.mean_composed?.toFixed(2)}
        </span>
      </button>
      {whyOpen ? (
        <p className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-600 leading-[1.45]">
          {item.rationale}
        </p>
      ) : null}

      {/* Action row */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          onClick={() => run("saved")}
          disabled={action.isPending || state === "saved"}
          className={cn(
            "btn btn-primary px-3 py-2 text-xs font-medium",
            state === "saved" && "opacity-60",
          )}
        >
          <Bookmark size={13} fill={state === "saved" ? "currentColor" : "none"} /> Save
        </button>
        <button
          onClick={() => run("done")}
          disabled={action.isPending || state === "done"}
          className={cn("btn btn-outline px-3 py-2 text-xs font-medium", state === "done" && "opacity-60")}
        >
          <Check size={13} /> Done
        </button>
        <button
          onClick={() => run("more_like_this")}
          disabled={action.isPending}
          className="btn btn-outline px-3 py-2 text-xs font-medium"
        >
          <Sparkles size={13} /> More like this
        </button>
        <button
          onClick={() => run("dismissed")}
          disabled={action.isPending || hidden}
          className={cn("btn btn-outline px-3 py-2 text-xs font-medium", hidden && "opacity-60")}
        >
          <EyeOff size={13} /> Dismiss
        </button>
      </div>

      {ack && !hidden ? (
        <p className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
          {ack}
        </p>
      ) : null}
      {hidden ? (
        <p className="mt-3 text-xs text-neutral-500">
          Dismissed for this cycle.
        </p>
      ) : null}
    </HardCard>
  );
}
