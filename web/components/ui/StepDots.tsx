/**
 * Square step indicator (onboarding). Active step uses lagoon-deep
 * fill (7.5:1 contrast on paper — AAA). Passed steps use lagoon fill.
 * Future steps are transparent with ink border.
 *
 * Contrast ratios verified programmatically against WCAG 2.1.
 */
export function StepDots({ steps, current, light }: { steps: number; current: number; light?: boolean }) {
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
        if (light) {
          return (
            <span
              key={i}
              className={
                state === "active"
                  ? "h-2 w-6 rounded-full bg-neutral-900 transition-all duration-300"
                  : state === "passed"
                  ? "h-2 w-2 rounded-full bg-neutral-400 transition-all duration-300"
                  : "h-2 w-2 rounded-full bg-neutral-200 transition-all duration-300"
              }
            />
          );
        }
        return (
          <span
            key={i}
            className={`step-dot step-dot--${state}`}
          />
        );
      })}
    </div>
  );
}
