"use client";

import { useState } from "react";
import { useBootstrap, useFeed } from "@/hooks/useApi";
import { Plus, Sparkles, Calendar } from "lucide-react";

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
      <div className="text-center">
        <h1 className="serif-heading text-4xl mb-4 text-ink">
          Today&rsquo;s Curation
        </h1>
        <p className="text-lg text-muted mx-auto" style={{ maxWidth: '32rem' }}>
          {bootstrap?.moment?.note || "Your personalized curation awaits"}
        </p>
      </div>

      {/* Today's Curation Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles size={24} className="text-lagoon" />
          <h2 className="serif-heading text-2xl text-ink">Today&rsquo;s Picks</h2>
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
            <p className="font-semibold text-ink">Could not load the feed: {error.message}</p>
            <p className="mt-2 text-sm text-muted">Check that the backend is running on port 8000.</p>
          </div>
        ) : null}

        {!isLoading && items.length === 0 && !error ? (
          <div className="hard-card hard-card--mesh-teal p-12 text-center">
            <Calendar size={48} className="text-lagoon mx-auto block mb-4" />
            <h3 className="serif-heading text-xl mb-2 text-ink">No picks today</h3>
            <p className="mb-6 text-muted">Try enabling more media types in Settings, or run a fresh curation.</p>
            <button className="btn-primary-new">
              <Plus size={16} />
              Run Curation
            </button>
          </div>
        ) : null}

        <div className="space-y-6">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`hard-card p-6 settle stagger-${Math.min(index + 1, 4)}`}
            >
              <div className="mb-4">
                <h3 className="serif-heading text-xl mb-2 text-ink">
                  <a 
                    href={`/item/${item.id}`}
                    className="text-ink no-underline hover:opacity-80"
                  >
                    {item.title}
                  </a>
                </h3>
                <p className="leading-relaxed mb-4 text-muted">
                  {item.summary}
                </p>
              </div>

              {/* Rationale */}
              <div className="accent-panel p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-lagoon mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1 text-ink">Why this was picked</p>
                    <p className="text-sm italic text-muted">{item.rationale}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary-new px-4 py-2 text-sm">Save</button>
                <button className="btn-secondary-new px-4 py-2 text-sm">Already did this</button>
                <button className="btn-secondary-new px-4 py-2 text-sm">Dismiss</button>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              disabled={isLoading}
              className="btn-secondary-new"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
