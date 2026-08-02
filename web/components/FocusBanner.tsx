"use client";

import { useBootstrap, useDigestInfo } from "@/hooks/useApi";

/**
 * The comic focus banner — the one signature mesh element on every page.
 * Anchors the top: sits at y=0, content starts immediately below with a
 * 32px gap. No hero, no dead zone.
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
    <header className="bg-paper border-b border-[#E8E3DA] sticky top-0 z-20">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="milestone-diamond shrink-0 !bg-cobalt" aria-hidden />
          <p className="truncate text-sm font-semibold text-ink">
            {focus ? (
              <>
                Focused on <span className="font-display normal-case italic font-medium">&ldquo;{focus}&rdquo;</span> this week
              </>
            ) : (
              <>Setting your compass — picks reflect the weekly digest</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {digest?.digest_date ? (
            <span className="mono-label hidden text-muted/80 sm:inline">Digest · {digest.digest_date}</span>
          ) : null}
          <span
            title={data?.profile?.who_now || "You"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E3DA] bg-cobalt font-display text-[11px] text-white font-medium shadow-sm"
          >
            {initials || "·"}
          </span>
        </div>
      </div>
    </header>
  );
}
