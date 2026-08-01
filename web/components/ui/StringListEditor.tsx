"use client";

import { Plus, X } from "lucide-react";
import { OutlineButton } from "@/components/ui/Buttons";

/**
 * List editor for free-text items (aspirations, habits, goals) —
 * ink-bordered chips with add/remove.
 */
export function StringListEditor({
  values,
  onChange,
  placeholder = "Add one…",
  max = 8,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {values.map((value, idx) => (
          <li
            key={`${value}-${idx}`}
            className="group inline-flex items-center gap-1.5 border-2 border-ink bg-card px-3 py-1 text-sm text-ink shadow-[2px_2px_0_#0a0a0f]"
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
              className="text-muted transition-colors hover:text-magenta"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </li>
        ))}
      </ul>
      {values.length < max ? (
        <AddValueInput onAdd={(value) => onChange([...values, value])} placeholder={placeholder} />
      ) : null}
    </div>
  );
}

function AddValueInput({ onAdd, placeholder }: { onAdd: (value: string) => void; placeholder: string }) {
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
      <input name="new-value" type="text" placeholder={placeholder} className="hard-input max-w-xs flex-1 py-1.5 text-sm" />
      <OutlineButton size="sm" type="submit" aria-label="Add">
        <Plus size={14} strokeWidth={2.5} />
      </OutlineButton>
    </form>
  );
}
