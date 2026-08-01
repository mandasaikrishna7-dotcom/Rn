import { cn } from "@/lib/utils";

/**
 * Neo-brutalist card: white surface, 2px ink border, hard flat shadow.
 * `dashed` marks placeholder content (rule: dashed = not real yet).
 * `mesh` adds the halftone-cyan dot fill (empty states / placeholders).
 * `grain` adds the paper texture — the one skeuomorphic remnant, which
 * Reduced-texture mode toggles off.
 */
export function HardCard({
  children,
  className,
  dashed = false,
  mesh = false,
  grain = true,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  dashed?: boolean;
  mesh?: boolean;
  grain?: boolean;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "hard-card",
        dashed && "hard-card--dashed",
        mesh && "hard-card--mesh",
        grain && "grain",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
