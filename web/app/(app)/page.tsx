"use client";

import { useState } from "react";
import { useBootstrap, useDigestInfo, useFeed } from "@/hooks/useApi";
import { Plus, Sparkles, Calendar } from "lucide-react";

const PAGE_SIZE = 10;

export default function HomePage() {
  const { data: bootstrap } = useBootstrap();
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useFeed(PAGE_SIZE, offset);
  const { data: digest } = useDigestInfo();

  const items = data?.items ?? [];
  const hasMore = items.length === PAGE_SIZE;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="serif-heading text-4xl text-ink mb-4">
          Welcome to Your Journey
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          {bootstrap?.moment?.note || "Your personalized curation awaits"}
        </p>
      </div>

      {/* Today's Curation */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles size={24} className="text-brass" />
          <h2 className="serif-heading text-2xl text-ink">Today's Curation</h2>
        </div>

        {isLoading && offset === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="journal-card h-48 animate-pulse" />
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="journal-card p-6 text-center">
            <p className="text-ink font-semibold">Could not load the feed: {error.message}</p>
            <p className="text-muted mt-2">Check that the backend is running on port 8000.</p>
          </div>
        ) : null}

        {!isLoading && items.length === 0 && !error ? (
          <div className="journal-card p-12 text-center">
            <Calendar size={48} className="text-brass mx-auto mb-4" />
            <h3 className="serif-heading text-xl text-ink mb-2">No picks today</h3>
            <p className="text-muted mb-6">
              Try enabling more media types in Settings, or run a fresh curation.
            </p>
            <button className="btn-base btn-primary">
              <Plus size={16} />
              Run Curation
            </button>
          </div>
        ) : null}

        <div className="space-y-6">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`journal-card p-6 settle-in stagger-${Math.min(index + 1, 4)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="serif-heading text-xl text-ink mb-2">
                    <a 
                      href={`/item/${item.id}`}
                      className="hover:text-brass transition-colors"
                    >
                      {item.title}
                    </a>
                  </h3>
                  <p className="text-muted leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Rationale */}
              <div className="bg-brass/10 border-l-4 border-brass p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-brass mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink mb-1">Why this was picked</p>
                    <p className="text-sm text-muted italic">{item.rationale}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button className="btn-base btn-primary px-4 py-2 text-sm">
                  Save
                </button>
                <button className="btn-base btn-secondary px-4 py-2 text-sm">
                  Already did this
                </button>
                <button className="btn-base btn-secondary px-4 py-2 text-sm">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              disabled={isLoading}
              className="btn-base btn-secondary"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
