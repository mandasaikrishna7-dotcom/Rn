import { cn } from "@/lib/utils";

/**
 * Page heading: display grotesque headline + mono subtitle. No hero
 * container — sits directly below the focus banner with a 32px gap.
 */
export function SectionHeading({
  children,
  sub,
  className,
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="display text-3xl leading-none text-ink md:text-4xl">{children}</h1>
      {sub ? <p className="mono-label mt-3 !text-[12px] text-muted">{sub}</p> : null}
    </div>
  );
}
