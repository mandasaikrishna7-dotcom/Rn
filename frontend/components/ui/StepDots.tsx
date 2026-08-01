import { cn } from "@/lib/utils";

/**
 * Square neo-brutalist step indicator (onboarding). Active step is
 * cobalt-filled with a hard shadow; passed steps are cobalt-tinted;
 * upcoming are outlined.
 */
export function StepDots({ steps, current }: { steps: number; current: number }) {
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={steps}
      aria-valuenow={current + 1}
      aria-label={`Step ${current + 1} of ${steps}`}
    >
      {Array.from({ length: steps }).map((_, i) => {
        const state = i < current ? "passed" : i === current ? "active" : "future";
        return (
          <span
            key={i}
            className={cn(
              "block h-3 w-3 border-2 border-ink transition-all duration-150",
              state === "active" &&
                "bg-cobalt shadow-[2px_2px_0_#0a0a0f]",
              state === "passed" && "border-cobalt bg-cobalt/40",
              state === "future" && "bg-transparent",
            )}
          />
        );
      })}
    </div>
  );
}
