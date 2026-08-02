"use client";

import { Plus, X } from "lucide-react";
import { OutlineButton } from "@/components/ui/Buttons";
import { cn } from "@/lib/utils";

/**
 * List editor for free-text items (aspirations, habits, goals) —
 * editorial chips with add/remove.
 */
export function StringListEditor({
  values,
  onChange,
  placeholder = "Add one…",
  max = 8,
  light = false,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
  light?: boolean;
}) {
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {values.map((value, idx) => (
          <li
            key={`${value}-${idx}`}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs transition-colors",
              light
                ? "border border-neutral-200 bg-neutral-100 font-medium text-neutral-800"
                : "border border-white/10 bg-white/5 text-white/90 hover:border-white/20",
            )}
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
              className={cn(
                "transition-colors",
                light ? "text-neutral-400 hover:text-neutral-900" : "text-muted/60 hover:text-white",
              )}
            >
              <X size={12} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
      {values.length < max ? (
        <AddValueInput onAdd={(value) => onChange([...values, value])} placeholder={placeholder} light={light} />
      ) : null}
    </div>
  );
}

function AddValueInput({
  onAdd,
  placeholder,
  light = false,
}: {
  onAdd: (value: string) => void;
  placeholder: string;
  light?: boolean;
}) {
  return (
    <form
      className="mt-3 flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("new-value") as HTMLInputElement;
        const value = input.value.trim();
        if (value) {
          onAdd(value);
          input.value = "";
        }
      }}
    >
      <input
        name="new-value"
        type="text"
        placeholder={placeholder}
        className={cn(
          "max-w-xs flex-1 py-1.5 text-sm transition-all",
          light
            ? "rounded-xl border border-neutral-300 bg-white px-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900/10"
            : "hard-input",
        )}
      />
      <OutlineButton size="sm" type="submit" aria-label="Add" variant={light ? "light" : "dark"}>
        <Plus size={14} strokeWidth={2} />
      </OutlineButton>
    </form>
  );
}
