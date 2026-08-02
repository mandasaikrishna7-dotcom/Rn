import { cn } from "@/lib/utils";

/**
 * Primary CTA action button — clean pill-shaped CTA with smooth hover state.
 */
export function PrimaryButton({
  children,
  className,
  size = "md",
  glitch = true,
  variant = "dark",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  glitch?: boolean;
  variant?: "dark" | "light";
}) {
  return (
    <button
      className={cn(
        "btn",
        variant === "light"
          ? "bg-neutral-900 text-white font-medium hover:bg-neutral-800 shadow-sm"
          : "btn-primary",
        size === "sm" && "px-3.5 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3 text-base font-medium",
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
  variant = "dark",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md"; variant?: "dark" | "light" }) {
  return (
    <button
      className={cn(
        "btn",
        variant === "light"
          ? "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-400"
          : "btn-outline press",
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
