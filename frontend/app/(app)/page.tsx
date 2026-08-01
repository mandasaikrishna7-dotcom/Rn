"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";
import { OutlineButton } from "@/components/ui/Buttons";
import { HardCard } from "@/components/ui/HardCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useBootstrap, useDigestInfo, useFeed } from "@/hooks/useApi";

const PAGE_SIZE = 10;

export default function HomePage() {
  const { data: bootstrap } = useBootstrap();
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useFeed(PAGE_SIZE, offset);
  const { data: digest } = useDigestInfo();

  const items = data?.items ?? [];
  const hasMore = items.length === PAGE_SIZE;

  return (
    <div>
      <SectionHeading sub={bootstrap?.moment?.note}>Today&rsquo;s curation</SectionHeading>

      {isLoading && offset === 0 ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="hard-card h-48 animate-pulse !shadow-none" />
          ))}
        </div>
      ) : null}

      {error ? (
        <HardCard className="p-5">
          <p className="text-sm font-semibold text-ink">Could not load the feed: {error.message}</p>
          <p className="mono-label mt-2 text-muted">Check that the backend is running on port 8000.</p>
        </HardCard>
      ) : null}

      {!isLoading && items.length === 0 && !error ? (
        <HardCard mesh className="p-10 text-center">
          <span className="milestone-diamond mb-4" aria-hidden />
          <p className="font-display text-xl text-ink">No picks match your media preferences this cycle.</p>
          <p className="mono-label mt-3 text-muted">
            Enable more media types in Settings, or run a fresh curation.
          </p>
        </HardCard>
      ) : null}

      <div className="space-y-6">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <OutlineButton onClick={() => setOffset((o) => o + PAGE_SIZE)} disabled={isLoading}>
            Load more
          </OutlineButton>
        </div>
      ) : null}

      {digest?.html_url ? (
        <div className="angle-divider mt-12 mb-8" aria-hidden />
      ) : null}
      {digest?.html_url ? (
        <a
          href={digest.html_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cobalt-dark underline-offset-4 hover:underline"
        >
          <Link2 size={15} />
          Open the full weekly digest — the agent&rsquo;s own HTML report
        </a>
      ) : null}
    </div>
  );
}
