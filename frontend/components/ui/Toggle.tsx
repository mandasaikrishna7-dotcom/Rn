import { cn } from "@/lib/utils";

/**
 * Neo-brutalist switch: square track, 2px ink border, cobalt when on,
 * ink when off, hard-sliding white knob.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "switch",
        checked ? "switch-on" : "switch-off",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="switch-knob" />
    </button>
  );
}
