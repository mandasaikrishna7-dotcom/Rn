import { cn } from "@/lib/utils";

/**
 * Primary cobalt action — hard border, flat shadow, magenta glitch edge
 * on hover/focus. The glitch is reserved for these (Save, Run curation,
 * Begin).
 */
export function PrimaryButton({
  children,
  className,
  size = "md",
  glitch = true,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  glitch?: boolean;
}) {
  return (
    <button
      className={cn(
        "btn btn-primary press",
        glitch && "glitch",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Outline secondary action (Save-once, dismiss, load more, etc.).
 */
export function OutlineButton({
  children,
  className,
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" }) {
  return (
    <button
      className={cn(
        "btn btn-outline press",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
