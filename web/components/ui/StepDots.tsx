/**
 * Square step indicator (onboarding). Active step uses lagoon-deep
 * fill (7.5:1 contrast on paper — AAA). Passed steps use lagoon fill.
 * Future steps are transparent with ink border.
 *
 * Contrast ratios verified programmatically against WCAG 2.1.
 */
export function StepDots({ steps, current }: { steps: number; current: number }) {
  return (
    <div
      className="flex items-center gap-2.5"
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
            className={`step-dot step-dot--${state}`}
          />
        );
      })}
    </div>
  );
}
