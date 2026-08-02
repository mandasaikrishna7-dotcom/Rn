import { FileText, ScrollText, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDIA_META: Record<string, { label: string; Icon: typeof FileText }> = {
  article: { label: "Article", Icon: FileText },
  paper: { label: "Paper", Icon: ScrollText },
  video: { label: "Video", Icon: PlayCircle },
};

/**
 * Utility-strip media tag: mono face, uppercase, cobalt on ink.
 */
export function TypeBadge({
  type,
  className,
}: {
  type: keyof typeof MEDIA_META | string;
  className?: string;
}) {
  const meta = MEDIA_META[type] ?? { label: type, Icon: FileText };
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800",
        className,
      )}
    >
      <Icon size={13} className="text-neutral-600" strokeWidth={2} />
      <span>{meta.label}</span>
    </span>
  );
}
