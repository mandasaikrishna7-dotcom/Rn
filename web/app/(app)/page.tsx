"use client";

import { useState } from "react";
import { useBootstrap, useFeed } from "@/hooks/useApi";
import { Plus, Sparkles, Calendar } from "lucide-react";
import { FeedCard } from "@/components/FeedCard";

const PAGE_SIZE = 10;

export default function HomePage() {
  const { data: bootstrap } = useBootstrap();
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useFeed(PAGE_SIZE, offset);

  const items = data?.items ?? [];
  const hasMore = items.length === PAGE_SIZE;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-[30px] font-bold text-neutral-900 tracking-[-0.02em] leading-[1.2]">
          Your daily feed
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-[65ch] leading-[1.45]">
          {bootstrap?.moment?.note || "Curation matched to your focus and reading preferences."}
        </p>
      </div>

      {/* Today's Curation Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={16} className="text-neutral-500" />
          <h2 className="text-[20px] font-semibold text-neutral-900 tracking-[-0.02em] leading-[1.2]">Today&rsquo;s picks</h2>
        </div>

        {isLoading && offset === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="hard-card h-48 animate-pulse" />
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="hard-card p-6 text-center">
            <p className="font-semibold text-neutral-900">Could not load the feed: {error.message}</p>
            <p className="mt-2 text-sm text-neutral-500">Check that the backend is running on port 8000.</p>
          </div>
        ) : null}

        {!isLoading && items.length === 0 && !error ? (
          <div className="hard-card p-12 text-center">
            <Calendar size={36} className="text-neutral-400 mx-auto block mb-3" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No picks today</h3>
            <p className="mb-6 text-sm text-neutral-600">Try enabling more media types in Settings, or run a fresh curation.</p>
            <button className="btn btn-primary">
              <Plus size={15} />
              Run curation
            </button>
          </div>
        ) : null}

        <div className="space-y-6">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              disabled={isLoading}
              className="btn btn-outline"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
