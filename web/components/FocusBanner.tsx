"use client";

import { useBootstrap, useDigestInfo } from "@/hooks/useApi";

/**
 * Editorial top context banner — sticky top header on every page.
 */
export function FocusBanner() {
  const { data } = useBootstrap();
  const { data: digest } = useDigestInfo();

  const focus = data?.moment?.focus;
  const initials = (data?.profile?.who_now?.trim() || "You")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-900" aria-hidden />
          <p className="truncate text-sm font-normal text-neutral-900">
            {focus ? (
              <>
                Focused on <span className="font-semibold text-neutral-900">&ldquo;{focus}&rdquo;</span> this week
              </>
            ) : (
              <>Weekly digest selection active</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {digest?.digest_date ? (
            <span className="text-xs text-neutral-500 font-normal hidden sm:inline">Digest {digest.digest_date}</span>
          ) : null}
          <span
            title={data?.profile?.who_now || "You"}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-900"
          >
            {initials || "·"}
          </span>
        </div>
      </div>
    </header>
  );
}
