import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mono-face backend-gap callout (halftone-cyan tint strip). Backend gaps
 * stay visible and honest — never prettified away.
 */
export function BackendGap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "border border-orb-core/20 bg-orb-core/5 rounded-xl px-4 py-3",
        "flex items-start gap-3",
        className,
      )}
    >
      <Info size={16} className="mt-0.5 shrink-0 text-cobalt" strokeWidth={2} />
      <div className="mono-label !text-[11px] !tracking-[0.04em] !normal-case text-ink">{children}</div>
    </div>
  );
}
