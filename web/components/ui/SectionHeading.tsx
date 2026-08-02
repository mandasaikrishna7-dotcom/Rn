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
      <h1 className="text-[30px] font-bold text-neutral-900 tracking-[-0.02em] leading-[1.2]">{children}</h1>
      {sub ? <p className="mt-2 text-sm text-neutral-600 max-w-[65ch] leading-[1.45]">{sub}</p> : null}
    </div>
  );
}
