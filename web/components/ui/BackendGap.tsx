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
        "rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5",
        "flex items-start gap-3 text-xs text-neutral-600 font-sans leading-relaxed",
        className,
      )}
    >
      <Info size={16} className="mt-0.5 shrink-0 text-neutral-500" strokeWidth={1.8} />
      <div className="flex-1 text-neutral-800">{children}</div>
    </div>
  );
}
