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
    <div className={cn("mb-10", className)}>
      <h1 className="serif-heading text-3xl leading-snug tracking-tight text-ink md:text-4xl font-medium">{children}</h1>
      {sub ? <p className="mt-3 text-sm text-muted/85 font-normal leading-relaxed">{sub}</p> : null}
    </div>
  );
}
