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
        "mono-label inline-flex items-center gap-1.5 border-2 border-ink bg-void px-2 py-1 text-ink",
        className,
      )}
    >
      <Icon size={12} className="text-halftone" strokeWidth={2} />
      <span className="text-white">{meta.label}</span>
    </span>
  );
}
