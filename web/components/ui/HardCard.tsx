import { cn } from "@/lib/utils";

/**
 * Editorial card primitive: soft rounded surface, hairline border, ambient glow.
 * `dashed` marks placeholder content (rule: dashed = not real yet).
 * `mesh` adds subtle halftone dot background.
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
